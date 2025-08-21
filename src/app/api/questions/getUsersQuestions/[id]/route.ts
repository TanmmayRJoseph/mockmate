/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { questions, answers } from "@/db/schema";
import { eq, and, isNull, or, gt } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log("📩 [API CALL] /api/questions/[id] (GET)");
    const profileId = params.id;
    console.log("🔎 Profile ID from params:", profileId);

    // Today at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log("📅 Filtering questions created after:", today);

    const result = await db
      .select({
        id: questions.id,
        text: questions.questionText,
        createdAt: questions.createdAt,
        answerText: answers.answerText,
      })
      .from(questions)
      .leftJoin(answers, eq(questions.id, answers.questionId))
      .where(
        and(
          eq(questions.profileId, profileId as any),
          or(isNull(answers.answerText), eq(answers.answerText, "")), // unanswered
          gt(questions.createdAt, today) // created today
        )
      );

    console.log("📥 Raw DB result:", result);

    const responsePayload = {
      questions: result.map((q) => ({
        id: q.id,
        text: q.text,
      })),
    };

    console.log("✅ Final API response:", responsePayload);

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("Error fetching unanswered questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}
