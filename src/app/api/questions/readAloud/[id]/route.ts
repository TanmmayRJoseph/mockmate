import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { questions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const questionId = params.id;

    // 1. Fetch question from DB
    const result = await db
      .select()
      .from(questions)
      .where(eq(questions.id, questionId));

    if (!result.length) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    const text = result[0].questionText;

    // 2. Call ElevenLabs API (text → speech)
    const elevenApiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID || "pNInz6obpgDQGcFmaJgB"; // default voice

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": elevenApiKey!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_monolingual_v1", // standard TTS model
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("ElevenLabs Error:", err);
      return NextResponse.json(
        { error: "Failed to generate speech" },
        { status: 500 }
      );
    }

    // 3. Convert audio to base64 (or return buffer directly)
    const audioBuffer = await response.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString("base64");
    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

    // 4. Return audio URL
    return NextResponse.json({
      id: questionId,
      text,
      audioUrl,
    });
  } catch (error) {
    console.error("Error in readAloud route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
