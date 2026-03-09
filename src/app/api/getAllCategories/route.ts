import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/models/category";

export async function GET() {
  try {
    await connectDB();

    // Fetch all categories from DB
    const categories = await Category.find({}).sort({ createdAt: -1 }); 
    console.log(categories)
    // Return as JSON
    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
