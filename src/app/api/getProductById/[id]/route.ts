// src/app/api/getProductById/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import Product from "@/models/products";
import { connectDB } from "@/lib/db";

// ✅ Define params type properly for Next.js 15+
type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    // ✅ Await params in Next.js 15+
    const { id } = await context.params;
    
    console.log("📍 API Route Hit - Product ID:", id);

    await connectDB();

    const product = await Product.findOne({
      _id: id,
      isActive: true,
    })
      .populate("category", "name")
      .populate("brand", "name");

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    const formattedProduct = {
      id: product._id.toString(),
      name: product.name,
      category: product.category?.name || "Unknown",
      brand: product.brand?.name || "Unknown",
      description: product.description || "",
      sellingPrice: product.sellingPrice,
      teachnitionPrice: product.technicianPrice,
      stock: product.stock,
      images: product.images,
      mainImage: product.images[0] || "",
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        product: formattedProduct,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error fetching product by id:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch product",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}