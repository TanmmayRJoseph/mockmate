"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
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

export default function ProfileScoresPage() {
  const { id } = useParams(); // profileId from URL
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchProfilePerformance = async () => {
      try {
        const res = await axios.get(`/api/performence/performencedata/${id}`);
        setPerformance(res.data);
      } catch (err) {
        console.error("❌ Error fetching profile performance:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfilePerformance();
  }, [id]);

  if (loading) return <p className="p-4">⏳ Loading profile scores...</p>;
  if (!performance)
    return (
      <p className="p-4">
        ❌ No performance found for this profile. Take a test to get started.
      </p>
    );

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded-lg mt-8">
      <h1 className="text-2xl font-bold mb-4 text-center">
        📊 Profile Performance
      </h1>

      <div className="space-y-4">
        <p>
          🎭 <b>Tone:</b> {performance.averageTone}/100
        </p>
        <p>
          ✨ <b>Clarity:</b> {performance.averageClarity}/100
        </p>
        <p>
          🔑 <b>Keyword Match:</b> {performance.averageKeywordMatch}/100
        </p>
      </div>

      <div className="mt-5 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold">💡 Notes:</h3>
        <p className="text-gray-700">{performance.improvementNotes}</p>
      </div>

      <p className="mt-6 text-sm text-gray-500 text-center">
        Last Updated: {new Date(performance.updatedAt).toLocaleString()}
      </p>
    </div>
  );
}
