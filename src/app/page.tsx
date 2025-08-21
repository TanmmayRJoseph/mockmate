import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Mic, BarChart3 } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navbar */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-white sticky top-0 z-50">
        <h1 className="text-2xl font-bold text-gray-800">Mock-Mate</h1>
        <nav className="flex gap-4">
          <Link href="/pages/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/pages/register">
            <Button>Get Started</Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="text-center px-6 py-20">
        <div className="text-4xl md:text-6xl font-bold text-gray-900">
          Ace Your Next Interview with{" "}
          <span className="text-indigo-600">AI-Powered Coaching</span>
        </div>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
          Get personalized interview questions, real-time feedback on your
          answers, and track your improvement with AI.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/pages/register">
            <Button size="lg">Start Practicing</Button>
          </Link>
          <Link href="/pages/login">
            <Button size="lg" variant="outline">
              Login
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 bg-gray-50">
        <h3 className="text-3xl font-semibold text-center text-gray-900">
          Why InterviewCoachAI?
        </h3>
        <div className="grid md:grid-cols-3 gap-8 mt-12 max-w-6xl mx-auto">
          <Card className="shadow-md">
            <CardContent className="p-6 text-center">
              <Brain className="mx-auto h-10 w-10 text-indigo-600" />
              <h4 className="mt-4 text-xl font-semibold">
                AI-Generated Questions
              </h4>
              <p className="mt-2 text-gray-600">
                Practice with realistic, role-specific interview questions
                powered by AI.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6 text-center">
              <Mic className="mx-auto h-10 w-10 text-indigo-600" />
              <h4 className="mt-4 text-xl font-semibold">
                Answer in Text or Audio
              </h4>
              <p className="mt-2 text-gray-600">
                Improve clarity and confidence by practicing both written and
                spoken answers.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6 text-center">
              <BarChart3 className="mx-auto h-10 w-10 text-indigo-600" />
              <h4 className="mt-4 text-xl font-semibold">
                Track Your Progress
              </h4>
              <p className="mt-2 text-gray-600">
                Get detailed insights on tone, clarity, and keywords to measure
                improvement.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <h3 className="text-3xl md:text-4xl font-bold text-gray-900">
          Ready to Land Your Dream Job?
        </h3>
        <p className="mt-4 text-lg text-gray-600">
          Sign up today and start practicing with AI-powered interview coaching.
        </p>
        <div className="mt-6">
          <Link href="/pages/register">
            <Button size="lg">Get Started for Free</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white px-6 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} InterviewCoachAI. All rights reserved.
      </footer>
    </main>
  );
}
