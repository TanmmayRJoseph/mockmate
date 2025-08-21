/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/db/drizzle";
import { jobProfiles } from "@/db/schema";
import { z } from "zod";
import jwt from "jsonwebtoken";

// =====================
// Validation Schema
// =====================
const createProfileSchema = z.object({
  jobRole: z.string().min(2, "Job role is too short"),
  skills: z.union([
    z.string().min(1, "Skills are required"),
    z.array(z.string().min(1))
  ]),
});

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: NextRequest) {
  try {
    // ✅ Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Verify and decode JWT
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    const userId = decoded.id;
    if (!userId) {
      return NextResponse.json({ error: "Invalid token payload" }, { status: 403 });
    }

    // ✅ Parse and validate body
    const body = await req.json();
    const parsed = createProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { jobRole, skills } = parsed.data;

    // ✅ Convert skills to string if array
    const skillsStr = Array.isArray(skills) ? skills.join(",") : skills;

    // ✅ Insert into DB
    const [newProfile] = await db
      .insert(jobProfiles)
      .values({
        userId,
        jobRole,
        skills: skillsStr,
      })
      .returning();

    return NextResponse.json(
      { message: "Profile created successfully", profile: newProfile },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating job profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
