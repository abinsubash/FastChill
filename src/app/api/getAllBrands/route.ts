import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Brand from "@/models/brand";

export async function GET() {
  try {
    await connectDB();

    // Fetch all brands from DB
    const brands = await Brand.find({}).sort({ createdAt: -1 });
    console.log(brands);

    // Return as JSON
    return NextResponse.json({ brands }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}
