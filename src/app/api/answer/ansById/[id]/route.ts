/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { answers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: questionId } = await context.params;

    if (!questionId) {
      return NextResponse.json(
        { error: "Question ID is required" },
        { status: 400 }
      );
    }

    const result = await db
      .select()
      .from(answers)
      .where(eq(answers.questionId, questionId as any));

    return NextResponse.json({ answers: result });
  } catch (error) {
    console.error("Error fetching answers:", error);
    return NextResponse.json(
      { error: "Failed to fetch answers" },
      { status: 500 }
    );
  }
}
