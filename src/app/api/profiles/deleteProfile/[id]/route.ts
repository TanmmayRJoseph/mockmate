import { NextRequest, NextResponse } from "next/server";
import db from "@/db/drizzle";
import { jobProfiles } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

// ✅ Helper to get userId from JWT cookie
function getUserIdFromToken(req: NextRequest): string | null {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id?: string };
    return decoded.id || null;
  } catch {
    return null;
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Check if profile belongs to the logged-in user
    const [profile] = await db
      .select()
      .from(jobProfiles)
      .where(and(eq(jobProfiles.id, params.id), eq(jobProfiles.userId, userId)));

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // ✅ Delete profile
    await db
      .delete(jobProfiles)
      .where(and(eq(jobProfiles.id, params.id), eq(jobProfiles.userId, userId)));

    return NextResponse.json({ message: "Profile deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
