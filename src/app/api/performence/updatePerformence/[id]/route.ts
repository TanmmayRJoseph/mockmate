/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/db/drizzle";
import jwt from "jsonwebtoken";
import { feedback, answers, questions, performance } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // -------------------------------
    // 1. 🔒 Auth check
    // -------------------------------
    const token = (await cookies()).get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let decoded: { id: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      console.log(decoded);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const profileId = params.id;
    if (!profileId)
      return NextResponse.json(
        { error: "Profile ID required" },
        { status: 400 }
      );

    // -------------------------------
    // 2. Fetch all feedbacks for this profile
    // -------------------------------
    const allFeedbacks = await db
      .select({
        toneScore: feedback.toneScore,
        clarityScore: feedback.clarityScore,
        keywordMatchScore: feedback.keywordMatchScore,
      })
      .from(feedback)
      .innerJoin(answers, eq(feedback.answerId, answers.id))
      .innerJoin(questions, eq(answers.questionId, questions.id))
      .where(eq(questions.profileId, profileId));

    if (!allFeedbacks.length)
      return NextResponse.json(
        { error: "No feedback found for this profile" },
        { status: 404 }
      );

    // -------------------------------
    // 3. Calculate averages
    // -------------------------------
    const total = allFeedbacks.length;
    const avgTone = Math.round(
      allFeedbacks.reduce((sum, f) => sum + (f?.toneScore ?? 0), 0) / total
    );
    const avgClarity = Math.round(
      allFeedbacks.reduce((sum, f) => sum + (f?.clarityScore ?? 0), 0) / total
    );
    const avgKeyword = Math.round(
      allFeedbacks.reduce((sum, f) => sum + (f?.keywordMatchScore ?? 0), 0) /
        total
    );

    // -------------------------------
    // 4. Upsert performance
    // -------------------------------
    const [existing] = await db
      .select()
      .from(performance)
      .where(eq(performance.profileId, profileId));

    if (existing) {
      // Update existing
      await db
        .update(performance)
        .set({
          averageTone: avgTone,
          averageClarity: avgClarity,
          averageKeywordMatch: avgKeyword,
          updatedAt: new Date(),
        })
        .where(eq(performance.profileId, profileId));

      console.log("Performance updated for profile:", profileId);
    } else {
      // Insert new
      await db.insert(performance).values({
        profileId,
        averageTone: avgTone,
        averageClarity: avgClarity,
        averageKeywordMatch: avgKeyword,
        improvementNotes: "Keep improving weak areas based on feedback.",
      });

      console.log("Performance created for profile:", profileId);
    }

    // -------------------------------
    // 5. ✅ Return updated performance
    // -------------------------------
    const [updatedPerf] = await db
      .select()
      .from(performance)
      .where(eq(performance.profileId, profileId));
    return NextResponse.json(updatedPerf);
  } catch (error: any) {
    console.error("Error updating performance:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
