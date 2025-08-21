"use client";
import axios from "axios";
import Link from "next/link";
import { toast } from "sonner";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post("/api/auth/register", {
        name,
        email,
        passwordHash: password,
      });

      // Save token to localStorage
      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
      }

      toast.success("Account created successfully");
      router.push("/pages/login");
    } catch (error) {
      console.error("Registration failed", error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 px-4">
      <Card className="w-full max-w-md shadow-lg border rounded-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Create your Mock-Mate account
          </CardTitle>
          <p className="mt-2 text-sm text-gray-600">
            Sign up to start practicing with AI-powered interview coaching.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="h-11"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11"
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full h-11 text-base">
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/pages/login"
              className="text-indigo-600 hover:underline font-medium"
            >
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
