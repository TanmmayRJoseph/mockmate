"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

interface Profile {
  id: string;
  userId: string;
  jobRole: string;
  skills: string; // comma-separated from API
  createdAt: string;
}

interface DecodedToken {
  id: string; // userId from backend
  email: string;
  exp: number;
}

export default function DashboardPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No token found in localStorage");
          setLoading(false);
          return;
        }

        const decoded: DecodedToken = jwtDecode(token);
        const userId = decoded.id;

        const response = await axios.get(
          `/api/profiles/getAllProfile/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setProfiles(response.data.profiles || []);
      } catch (error) {
        console.error("Error fetching profiles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await axios.delete(`/api/profiles/deleteProfile/${id}`, {
        withCredentials: true,
      });

      if (res.status === 200) {
        toast.success("Profile deleted successfully ✅");
        setProfiles((prevProfiles) => prevProfiles.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error("Error deleting profile:", error);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Your Profiles</h1>
        <Link href="/pages/create-profile">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Create New Profile
          </Button>
        </Link>
      </div>

      {/* Loading State */}
      {loading ? (
        <p className="text-gray-600">Loading profiles...</p>
      ) : profiles.length === 0 ? (
        <p className="text-gray-600">
          No profiles found. Create one to get started!
        </p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {profiles.map((profile) => (
            <Card
              key={profile.id}
              className="shadow-sm hover:shadow-md transition"
            >
              <CardHeader>
                <CardTitle>{profile.jobRole}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-2">
                  Created on: {new Date(profile.createdAt).toLocaleDateString()}
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.split(",").map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md text-xs"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-4">
  <Button variant="outline" asChild>
    <Link href={`/pages/interview/${profile.id}`}>
      Take Interview
    </Link>
  </Button>

  <Button variant="outline" asChild>
    <Link href={`/pages/performence/${profile.id}`}>
      View Scores
    </Link>
  </Button>

  <Button onClick={() => handleDelete(profile.id)}>
    Delete
  </Button>
</div>




              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
