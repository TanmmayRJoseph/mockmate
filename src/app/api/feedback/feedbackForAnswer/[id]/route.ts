// File: app/api/feedback/feedbackForAnswer/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/db/drizzle";
import jwt from "jsonwebtoken";
import { feedback } from "@/db/schema";
import { eq } from "drizzle-orm";
//NOTE: it takes answer_id
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ Await params

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Optional: verify token if you need user-specific filtering
    jwt.verify(token, process.env.JWT_SECRET!);

    // Fetch feedback for this answer
    const result = await db
      .select()
      .from(feedback)
      .where(eq(feedback.answerId, id));

    if (!result.length) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ feedback: result[0] });
  } catch (error) {
    console.error("GET feedback error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
