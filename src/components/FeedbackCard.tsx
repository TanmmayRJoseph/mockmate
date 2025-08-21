"use client";
import { useEffect, useState } from "react";
import axios from "axios";

type Feedback = {
  toneScore: number;
  clarityScore: number;
  keywordMatchScore: number;
  suggestions: string;
};

export default function FeedbackCard({ answerId }: { answerId: string }) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    if (!answerId) return;

    const fetchFeedback = async () => {
      try {
        const res = await axios.get(`/api/feedback/feedbackForAnswer/${answerId}`);
        const newFeedback = res.data.feedback;
        setFeedback(newFeedback);

        // 🛑 Cancel previous speech before speaking new text
        window.speechSynthesis.cancel();

        // 🗣 Speak only if suggestions exist
        if (newFeedback?.suggestions) {
          const utterance = new SpeechSynthesisUtterance(newFeedback.suggestions);
          window.speechSynthesis.speak(utterance);
        }
      } catch (err) {
        console.error("❌ Error fetching feedback:", err);
      }
    };

    fetchFeedback();
  }, [answerId]); // runs only when answerId changes

  if (!feedback) return <p>⏳ Fetching feedback...</p>;

  return (
    <div className="p-4 bg-white shadow rounded-lg mt-4">
      <h3 className="font-bold text-lg mb-2">📊 Feedback</h3>
      <p>🎭 Tone: {feedback.toneScore}/100</p>
      <p>✨ Clarity: {feedback.clarityScore}/100</p>
      <p>🔑 Keyword Match: {feedback.keywordMatchScore}/100</p>
      <p className="mt-2 text-gray-700">💡 {feedback.suggestions}</p>
    </div>
  );
}
