import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/db/drizzle";
import { jobProfiles, questions } from "@/db/schema";
import ai from "@/utils/gemini"; // your GoogleGenerativeAI instance
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    console.log("📩 [API CALL] /api/questions (POST)"); //! Debugging console
    // ✅ Auth check
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    console.log("🔑 Token from cookies:", token ? "FOUND" : "NOT FOUND"); //!Debugging console

    if (!token) {
      console.warn("❌ Unauthorized: No token provided"); //!Debugging console
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };

    // ✅ Parse body
    const { profileId, count } = await req.json();

    if (!profileId || !count) {
      console.warn("⚠️ Missing fields:", { profileId, count }); //!Debugging console
      return NextResponse.json(
        { error: "profileId and count are required" },
        { status: 400 }
      );
    }

    // ✅ Check if profile belongs to the logged-in user
    const [profile] = await db
      .select()
      .from(jobProfiles)
      .where(eq(jobProfiles.id, profileId));
    console.log("👤 Profile fetched from DB:", profile); //!Debugging console

    if (!profile || profile.userId !== decoded.id) {
      return NextResponse.json(
        { error: "Profile not found or unauthorized" },
        { status: 404 }
      );
    }

    // ✅ Generate questions with AI
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an AI interview coach.
      Generate ${count} unique interview questions for a candidate applying for the role of "${profile.jobRole}".
      Focus on the following skills: ${profile.skills}.
      Format each question as plain text, no numbering, no explanations.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    console.log("🤖 Raw AI response:\n", text); //!Debugging console
    const generatedQuestions = text
      .split("\n")
      .map((q) => q.trim().replace(/^\d+\.\s*/, "")) // remove numbering if any
      .filter((q) => q.length > 0);

    // ✅ Store in DB
    const inserted = await db
      .insert(questions)
      .values(
        generatedQuestions.map((q) => ({
          profileId,
          questionText: q, // ✅ match schema
        }))
      )
      .returning();
    console.log("📥 Inserted into DB:", inserted); //!Debugging console
    // ✅ Return structured response
    return NextResponse.json({
      questions: inserted.map((q) => ({
        id: q.id,
        text: q.questionText, // ✅ map DB field → API field
      })),
    });
  } catch (error) {
    console.error("Error generating interview questions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
