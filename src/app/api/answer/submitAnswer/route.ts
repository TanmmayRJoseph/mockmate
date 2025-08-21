import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { answers } from "@/db/schema";
import { v4 as uuidv4 } from "uuid";
import { transcribeAudio } from "@/utils/transcribeAudio";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const questionId = formData.get("questionId") as string;
    let finalAnswerText = formData.get("answerText") as string | null;
    const audioFile = formData.get("audioFile") as File | null;

    // 🔑 Get JWT from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - no token" },
        { status: 401 }
      );
    }

    // ✅ Verify token and extract userId
    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
      };
      userId = decoded.id;
    } catch (err) {
      console.log(err);
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    if (!questionId) {
      return NextResponse.json(
        { error: "questionId is required" },
        { status: 400 }
      );
    }

    let audioUrl: string | null = null;

    if (audioFile) {
      // Convert to buffer
      const bytes = await audioFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // 🎙 Transcribe with ElevenLabs
      const transcription = await transcribeAudio(buffer);

      // If user typed answer + uploaded audio → keep typed answer
      finalAnswerText = finalAnswerText || transcription;

      // ⚡ Store audio (mock storage for now)
      audioUrl = `/uploads/${uuidv4()}.mp3`;
    }

    const [newAnswer] = await db
      .insert(answers)
      .values({
        questionId,
        userId,
        answerText: finalAnswerText,
        audioUrl,
      })
      .returning();

    return NextResponse.json({ answer: newAnswer }, { status: 201 });
  } catch (error) {
    console.error("Error submitting answer:", error);
    return NextResponse.json(
      { error: "Failed to submit answer" },
      { status: 500 }
    );
  }
}
