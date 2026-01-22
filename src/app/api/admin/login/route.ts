import { connectDB } from "@/lib/db";
import { comparePassword } from "@/lib/hash";
import { generateAccess_token, generateRefresh_token } from "@/lib/jwt";
import AdminModel from "@/model/admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const admin = await AdminModel.findOne({ email: email });

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          errors: {
            email: "Email not registered",
          },
        },
        { status: 401 }
      );
    }


    const isPasswordValid = await comparePassword(
      password,
      admin.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          errors: {
            password: "Incorrect password",
          },
        },
        { status: 401 }
      );
    }


    const access_token = generateAccess_token({
      id: admin._id.toString()
    });

    const refresh_token = generateRefresh_token({
      id: admin._id.toString(),
    });

    const response = NextResponse.json(
      {
        success: true,
        access_token,
      },
      { status: 200 }
    );

    response.cookies.set("refresh_token", refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;

  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
