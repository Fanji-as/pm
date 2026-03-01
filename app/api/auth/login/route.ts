import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { verifyPassword, generateToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    console.log("Login attempt for email:", email);

    // Validate input
    if (!email || !password) {
      console.log("Missing email or password");
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    await connectDB();
    console.log("Connected to MongoDB");

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found for email:", email);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    console.log("User found:", user.email);

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      console.log("Invalid password for email:", email);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    console.log("Password verified successfully");

    // Generate token
    const token = generateToken(user._id.toString());
    console.log("Token generated");

    const response = NextResponse.json(
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        token,
      },
      { status: 200 },
    );

    // Set cookie manually using Set-Cookie header (without HttpOnly for debugging)
    const cookieValue = `token=${token}; Path=/; SameSite=lax; Max-Age=${60 * 60 * 24 * 7}`;
    response.headers.set("Set-Cookie", cookieValue);

    console.log("Login successful for:", email);
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
