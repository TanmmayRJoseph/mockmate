"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import QuestionReader from "@/components/QuestionReader";
import FeedbackCard from "@/components/FeedbackCard"; // ⬅️ import
import { useRouter } from "next/navigation";

type Question = {
  id: string;
  profileId: string;
  text: string;
  createdAt: string;
};

export default function ShowQuestions() {
  const router = useRouter();
  const params = useParams();
  const id =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
      ? params?.id[0]
      : "";

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedbackForAnswers, setFeedbackForAnswers] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // ---- Fetch questions
  useEffect(() => {
    if (!id) return;
    const fetchQuestions = async () => {
      try {
        const res = await axios.get(`/api/questions/getUsersQuestions/${id}`, {
          withCredentials: true,
        });
        setQuestions(res.data.questions || []);
      } catch (err) {
        console.error("❌ Error fetching questions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [id]);

  // ---- Handle text change
  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const qid = questions[currentIndex]?.id;
    if (!qid) return;
    setAnswers((prev) => ({ ...prev, [qid]: e.target.value }));
  };

  // ---- Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/mp3" });
        const formData = new FormData();
        formData.append("questionId", questions[currentIndex].id);
        formData.append("audioFile", blob, "answer.mp3");
        formData.append(
          "answerText",
          answers[questions[currentIndex].id] || ""
        );

        setSubmitting(true);
        try {
          const res = await axios.post("/api/answer/submitAnswer", formData, {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          });

          const answerId = res.data.answer.id;

          // ✅ Update local answer with final transcription
          setAnswers((prev) => ({
            ...prev,
            [questions[currentIndex].id]: res.data.answer.answerText,
          }));

          // ✅ Generate feedback for this answer
          await axios.post("/api/feedback/generateFeedback", {
            questionId: questions[currentIndex].id,
            answerText: res.data.answer.answerText,
            answerId, // make sure your API accepts this
          });

          // ✅ Store answerId -> so FeedbackCard can display it
          setFeedbackForAnswers((prev) => ({
            ...prev,
            [questions[currentIndex].id]: answerId,
          }));
        } catch (err) {
          console.error("❌ Failed to submit answer:", err);
        } finally {
          setSubmitting(false);
        }
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("🎤 Recording failed:", err);
    }
  };

  // ---- Stop recording
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const handleNext = () => {
    if (currentIndex === questions.length - 1) {
      // ✅ Redirect when finished
      router.push(`/pages/completed/${id}`);
    } else {
      setCurrentIndex((i) => Math.min(i + 1, questions.length - 1));
    }
  };
  const handlePrev = () => setCurrentIndex((i) => Math.max(i - 1, 0));

  if (loading)
    return <p className="text-center mt-10">⏳ Loading questions...</p>;
  if (questions.length === 0)
    return <p className="text-center mt-10">⚠️ No questions found.</p>;

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-xl rounded-2xl mt-10">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-2 rounded-full mb-6">
        <motion.div
          className="h-2 bg-blue-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* TTS */}
      <QuestionReader questionId={currentQuestion.id} />

      <h2 className="text-2xl font-bold mb-3 text-gray-800">
        Question {currentIndex + 1} of {questions.length}
      </h2>
      <p className="mb-4 text-lg text-gray-700 leading-relaxed">
        {currentQuestion.text}
      </p>

      <textarea
        rows={5}
        value={answers[currentQuestion.id] || ""}
        onChange={handleAnswerChange}
        placeholder="✍️ Type your answer here..."
        className="w-full p-4 border border-gray-300 rounded-lg mb-4 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
      />

      <div className="flex items-center gap-4 mb-6">
        {!recording ? (
          <button
            onClick={startRecording}
            className="px-5 py-2 bg-green-500 text-white rounded-lg shadow"
            disabled={submitting}
          >
            🎤 Record & Submit
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="px-5 py-2 bg-red-500 text-white rounded-lg shadow"
          >
            ⏹ Stop Recording
          </button>
        )}
      </div>

      {/* ⬇️ Show feedback for this question if available */}
      {feedbackForAnswers[currentQuestion.id] && (
        <FeedbackCard answerId={feedbackForAnswers[currentQuestion.id]} />
      )}

      <div className="flex justify-between mt-6">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-5 py-2 bg-gray-300 text-gray-800 rounded-lg disabled:opacity-50 shadow hover:bg-gray-400 transition"
        >
          ⬅ Previous
        </button>

        <button
          onClick={handleNext}
          
          className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition disabled:opacity-50"
        >
          {currentIndex === questions.length -1 ? "Submit" : "Next"}
        </button>
      </div>
    </div>
  );
}
