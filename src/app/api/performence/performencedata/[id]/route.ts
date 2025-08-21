/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/db/drizzle";
import jwt from "jsonwebtoken";
import { performance } from "@/db/schema";
import { eq } from "drizzle-orm";

// Route: GET /api/performance/getperformance/:id
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // -------------------------------
    // 1. 🔒 Auth check
    // -------------------------------
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded: { id: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      console.log("🔑 Decoded token:", decoded);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // -------------------------------
    // 2. Get profileId from params
    // -------------------------------
    const profileId = params.id;
    if (!profileId) {
      return NextResponse.json({ error: "Profile ID is required" }, { status: 400 });
    }

    // -------------------------------
    // 3. Fetch performance
    // -------------------------------
    const [perf] = await db
      .select()
      .from(performance)
      .where(eq(performance.profileId, profileId));

    if (!perf) {
      return NextResponse.json({ error: "Performance not found" }, { status: 404 });
    }

    // -------------------------------
    // 4. ✅ Return performance
    // -------------------------------
    return NextResponse.json(perf);
  } catch (error: any) {
    console.error("Error fetching performance:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
