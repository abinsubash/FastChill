import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/products";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Toggle the isActive status
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { isActive: !product.isActive },
      { new: true }
    )
      .populate("category", "name slug")
      .populate("brand", "name slug");

    return NextResponse.json(
      {
        message: `Product ${updatedProduct.isActive ? 'enabled' : 'disabled'} successfully`,
        product: updatedProduct,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error toggling product status:", error);
    return NextResponse.json(
      { message: "Failed to update product status" },
      { status: 500 }
    );
  }
}