import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const response = NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 },
  );

  response.cookies.delete("token");

  return response;
}
