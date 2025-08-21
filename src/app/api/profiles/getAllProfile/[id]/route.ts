/* eslint-disable @typescript-eslint/no-explicit-any */
// File: app/api/profiles/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/db/drizzle"; // Drizzle DB instance
import { jobProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!; // set in .env

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Verify JWT
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    const loggedInUserId = decoded.id;
    if (!loggedInUserId) {
      return NextResponse.json(
        { error: "Invalid token payload" },
        { status: 403 }
      );
    }

    const userIdFromParams = await params.id;

    // ✅ Ensure user can only fetch their own profiles
    if (loggedInUserId !== userIdFromParams) {
      return NextResponse.json(
        { error: "Forbidden: You can only access your own profiles" },
        { status: 403 }
      );
    }

    // ✅ Fetch all job profiles for the given user
    const profiles = await db
      .select()
      .from(jobProfiles)
      .where(eq(jobProfiles.userId, userIdFromParams));

    if (!profiles.length) {
      return NextResponse.json(
        { message: "No profiles found for this user" },
        { status: 404 }
      );
    }

    return NextResponse.json({ profiles }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user profiles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
