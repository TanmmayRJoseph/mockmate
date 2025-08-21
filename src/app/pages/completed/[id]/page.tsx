"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";

type Performance = {
  id: string;
  profileId: string;
  averageTone: number;
  averageClarity: number;
  averageKeywordMatch: number;
  improvementNotes: string;
  updatedAt: string;
};

export default function CompletedInterview() {
  const { id } = useParams(); // 🔑 from URL
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchPerformance = async () => {
      try {
        const res = await axios.get(`/api/performence/performencedata/${id}`);
        setPerformance(res.data);
      } catch (err) {
        console.error("❌ Error fetching performance:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, [id]);

  if (loading) return <p className="p-4">⏳ Loading final scores...</p>;
  if (!performance) return <p className="p-4">❌ No performance data found.</p>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded-lg mt-8">
      <h1 className="text-2xl font-bold mb-4 text-center">
        🎉 Interview Completed!
      </h1>
      <p className="text-center text-gray-600 mb-6">
        Here are your final performance scores:
      </p>

      <div className="space-y-3">
        <p>
          🎭 <b>Tone Score:</b> {performance.averageTone}/100
        </p>
        <p>
          ✨ <b>Clarity Score:</b> {performance.averageClarity}/100
        </p>
        <p>
          🔑 <b>Keyword Match:</b> {performance.averageKeywordMatch}/100
        </p>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h3 className="font-semibold">💡 Improvement Notes:</h3>
        <p className="text-gray-700">{performance.improvementNotes}</p>
      </div>
      <button
        className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded mt-4"
        onClick={() => (window.location.href = "/pages/dashboard")}
      >
        Dashboard
      </button>

      <p className="mt-6 text-sm text-gray-500 text-center">
        Last Updated: {new Date(performance.updatedAt).toLocaleString()}
      </p>
    </div>
  );
}
