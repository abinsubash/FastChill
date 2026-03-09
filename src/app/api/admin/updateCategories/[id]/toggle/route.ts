import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/models/category";

// TOGGLE isActive status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    console.log('this is id',id)
    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    // Toggle the isActive status
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { isActive: !category.isActive },
      { new: true }
    );

    return NextResponse.json(
      {
        message: `Category ${updatedCategory.isActive ? 'enabled' : 'disabled'} successfully`,
        category: updatedCategory
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error toggling category status:", error);
    return NextResponse.json(
      { message: "Failed to update category status" },
      { status: 500 }
    );
  }
}