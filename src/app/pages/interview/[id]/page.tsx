/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function InterviewPage() {
  const { id } = useParams(); // profileId from URL
  const [count, setCount] = useState<number>(5);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const router = useRouter();

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const res = await axios.post("/api/questions/generate", {
        profileId: id,
        count: count || 5,
      });

      if (res.data?.questions) {
        setQuestions(res.data.questions);
        setShowPopup(true);
      }
    } catch (err) {
      console.error("❌ Error generating questions:", err);
      alert("Failed to generate questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-100 p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-lg w-full text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Mock Interview Setup
        </h1>

        <label className="block text-gray-700 font-medium mb-2">
          How many questions do you want?
        </label>
        <input
          type="number"
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          min={1}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-400 outline-none mb-6"
          placeholder="Default is 5"
        />

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl w-full font-semibold shadow-lg hover:opacity-90 transition"
        >
          {loading ? "Generating..." : "Generate Questions"}
        </button>
      </div>

      {/* Popup */}
      {showPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Questions Generated! All the best
            </h2>
            <p className="text-gray-600 mb-6">
              Ready to start your interview round?
            </p>
            <button
              onClick={() => {
                setShowPopup(false);
                router.push(`/pages/showQuestions/${id}`);
                console.log("Questions ready:", questions);
              }}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl w-full font-semibold shadow-lg hover:opacity-90 transition"
            >
              Start Interview
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
