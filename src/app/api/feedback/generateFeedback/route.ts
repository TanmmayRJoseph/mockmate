/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/db/drizzle";
import ai from "@/utils/gemini";
import jwt from "jsonwebtoken";
import { feedback, questions, answers, performance } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
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
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const userId = decoded.id;

    // -------------------------------
    // 2. 📥 Parse request body
    // -------------------------------
    const { questionId, answerText } = await req.json();
    if (!questionId || !answerText?.trim())
      return NextResponse.json(
        { error: "questionId and answerText are required" },
        { status: 400 }
      );

    // -------------------------------
    // 3. ❓ Fetch question
    // -------------------------------
    const [question] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, questionId));
    if (!question)
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );

    // -------------------------------
    // 4. ✍️ Upsert answer
    // -------------------------------
    let [answer] = await db
      .select()
      .from(answers)
      .where(
        and(eq(answers.questionId, questionId), eq(answers.userId, userId))
      );

    if (!answer) {
      [answer] = await db
        .insert(answers)
        .values({ questionId, userId, answerText })
        .returning();
    } else {
      [answer] = await db
        .update(answers)
        .set({ answerText })
        .where(eq(answers.id, answer.id))
        .returning();
    }

    // -------------------------------
    // 5. 🤖 Generate AI feedback
    // -------------------------------
    const prompt = `
You are an interview coach. 
Question: "${question.questionText}"
Answer: "${answerText}"

Analyze the answer and provide feedback in valid JSON only.
The JSON must strictly follow this format:

{
  "toneScore": number (1-100),
  "clarityScore": number (1-100),
  "keywordMatchScore": number (1-100),
  "suggestions": string
}

Make sure:
- All scores are integers from 1 to 100.
- Suggestions should be concise, clear, and actionable.
- Do not include any text outside the JSON.
`;

    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const rawText = result.response.text();

    // -------------------------------
    // 6. 📊 Parse JSON safely
    // -------------------------------
    let feedbackData;
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in AI response");

      feedbackData = JSON.parse(jsonMatch[0]);
      feedbackData.toneScore = Math.min(
        100,
        Math.max(1, Number(feedbackData.toneScore) || 1)
      );
      feedbackData.clarityScore = Math.min(
        100,
        Math.max(1, Number(feedbackData.clarityScore) || 1)
      );
      feedbackData.keywordMatchScore = Math.min(
        100,
        Math.max(1, Number(feedbackData.keywordMatchScore) || 1)
      );
    } catch (err) {
      console.error("AI response parse error:", rawText, err);
      return NextResponse.json(
        { error: "Failed to parse AI feedback", details: rawText },
        { status: 500 }
      );
    }

    // -------------------------------
    // 7. 💾 Save feedback
    // -------------------------------
    const [insertedFeedback] = await db
      .insert(feedback)
      .values({
        answerId: answer.id,
        toneScore: feedbackData.toneScore,
        clarityScore: feedbackData.clarityScore,
        keywordMatchScore: feedbackData.keywordMatchScore,
        suggestions: feedbackData.suggestions,
      })
      .returning();

    // ✅ Log inserted feedback
    console.log(`[${new Date().toISOString()}] Feedback saved:`, insertedFeedback);

    // -------------------------------
    // 8. 📈 Update Performance manually (Option 2)
    // -------------------------------
    if (question.profileId) {
      // Fetch all feedbacks for this profile
      const allFeedbacks = await db
        .select({
          toneScore: feedback.toneScore,
          clarityScore: feedback.clarityScore,
          keywordMatchScore: feedback.keywordMatchScore,
        })
        .from(feedback)
        .innerJoin(answers, eq(feedback.answerId, answers.id))
        .innerJoin(questions, eq(answers.questionId, questions.id))
        .where(eq(questions.profileId, question.profileId));

      const total = allFeedbacks.length || 1;
      const avgTone =
        allFeedbacks.reduce((sum, f) => sum + (f?.toneScore ?? 0), 0) / total;
      const avgClarity =
        allFeedbacks.reduce((sum, f) => sum + (f?.clarityScore ?? 0), 0) / total;
      const avgKeyword =
        allFeedbacks.reduce((sum, f) => sum + (f?.keywordMatchScore ?? 0), 0) / total;

      // Check if performance row exists
      const [existingPerf] = await db
        .select()
        .from(performance)
        .where(eq(performance.profileId, question.profileId));

      if (existingPerf) {
        // Update existing
        const updatedPerf = await db
          .update(performance)
          .set({
            averageTone: Math.round(avgTone),
            averageClarity: Math.round(avgClarity),
            averageKeywordMatch: Math.round(avgKeyword),
            updatedAt: new Date(),
          })
          .where(eq(performance.profileId, question.profileId))
          .returning();

        // ✅ Log updated performance
        console.log(`[${new Date().toISOString()}] Performance updated:`, updatedPerf);
      } else {
        // Insert new
        const insertedPerf = await db.insert(performance).values({
          profileId: question.profileId,
          averageTone: Math.round(avgTone),
          averageClarity: Math.round(avgClarity),
          averageKeywordMatch: Math.round(avgKeyword),
          improvementNotes: "Keep improving weak areas based on feedback.",
        }).returning();

        // ✅ Log inserted performance
        console.log(`[${new Date().toISOString()}] Performance saved:`, insertedPerf);
      }
    }

    // -------------------------------
    // 9. ✅ Return feedback
    // -------------------------------
    return NextResponse.json(insertedFeedback);
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
