import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Brand from "@/models/brand";

export async function PATCH(req:NextRequest) {
  try {
    await connectDB();

    const { id, isActive } = await req.json();

    // Validation
    if (!id) {
      return NextResponse.json(
        { message: "Brand ID is required" },
        { status: 400 }
      );
    }

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { message: "Valid status value is required" },
        { status: 400 }
      );
    }

    // Check if brand exists
    const existingBrand = await Brand.findById(id);
    if (!existingBrand) {
      return NextResponse.json(
        { message: "Brand not found" },
        { status: 404 }
      );
    }

    // Update brand status
    const updatedBrand = await Brand.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    return NextResponse.json(
      { 
        message: `Brand ${isActive ? 'activated' : 'deactivated'} successfully`,
        brand: {
          id: updatedBrand._id.toString(),
          name: updatedBrand.name,
          slug: updatedBrand.slug,
          isActive: updatedBrand.isActive,
          createdAt: updatedBrand.createdAt,
          updatedAt: updatedBrand.updatedAt,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error toggling brand status:", error);
    return NextResponse.json(
      { message: "Failed to toggle brand status" },
      { status: 500 }
    );
  }
}