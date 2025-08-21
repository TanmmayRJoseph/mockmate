/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/profiles/route.ts
import {  NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import db from "@/db/drizzle" // Drizzle DB instance
import { jobProfiles } from "@/db/schema"; // your schema
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET() {
  try {
    // Get JWT token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.id;

    // Fetch profiles for this user
    const profiles = await db
      .select()
      .from(jobProfiles)
      .where(eq(jobProfiles.userId, userId));

    return NextResponse.json({ profiles });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
