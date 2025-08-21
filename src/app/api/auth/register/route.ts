import { NextRequest, NextResponse } from "next/server";
import { users } from "@/db/schema";
import bcryptjs from "bcryptjs";
import db from "@/db/drizzle";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, passwordHash } = body;

    if (!email || !passwordHash || !name) {
      return new NextResponse("Missing Required Fields", { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, email),
    });

    if (existingUser) {
      return new NextResponse("User already exists", { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcryptjs.hash(passwordHash, 10);

    // Insert the new user into the database
    const [user] = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash: hashedPassword,
      })
      .returning();

    return NextResponse.json({
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    console.log("Register Error", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
