import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/products";

// Import these so Mongoose registers their schemas before .populate() runs
import "@/models/category";
import "@/models/brand";

export async function GET() {
  try {
    await connectDB();

    const products = await Product.find()
      .populate("category", "name slug isActive")
      .populate("brand", "name slug isActive")
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        products,
        count: products.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}