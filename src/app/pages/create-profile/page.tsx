/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CreateProfileForm() {
  const [jobRole, setJobRole] = useState("");
  const [skills, setSkills] = useState("");
  const [loading, setLoading] = useState(false);
const router=useRouter()
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobRole.trim() || !skills.trim()) {
      alert("Please fill all fields ❌");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        "/api/profiles/createProfile",
        {
          jobRole,
          skills: skills.split(",").map((s) => s.trim()), // ✅ send as array
        },
        { withCredentials: true }
      );

      if (res.status === 201) {
        toast.success("✅ Profile created successfully");
        setJobRole("");
        setSkills("");
      }
      router.push("/pages/dashboard")
    } catch (error:any) {
      console.error(error);
      toast.error(error.response?.data?.error || "Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Create Job Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Job Role */}
          <div>
            <Label htmlFor="jobRole">Job Role</Label>
            <Input
              id="jobRole"
              placeholder="e.g. Backend Developer"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
            />
          </div>

          {/* Skills */}
          <div>
            <Label htmlFor="skills">Skills</Label>
            <Textarea
              id="skills"
              placeholder="e.g. Node.js, Express, TypeScript"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate skills with commas (e.g., Node.js, Express, TypeScript)
            </p>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
