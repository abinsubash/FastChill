import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/models/category";

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-');       // Replace multiple hyphens with single hyphen
}

// UPDATE Category
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const { name } = await request.json();

    // Validation
    if (!name || name.trim().length < 3 || name.trim().length > 30) {
      return NextResponse.json(
        { message: "Category name must be between 3 and 30 characters" },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    // Generate new slug
    const newSlug = generateSlug(name);

    // Check if another category with the same slug exists (excluding current category)
    const duplicateSlug = await Category.findOne({
      slug: newSlug,
      _id: { $ne: id }
    });

    if (duplicateSlug) {
      return NextResponse.json(
        { message: "A category with this name already exists" },
        { status: 400 }
      );
    }

    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        slug: newSlug
      },
      { new: true }
    );

    return NextResponse.json(
      {
        message: "Category updated successfully",
        category: updatedCategory
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { message: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE Category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    // Delete category
    await Category.findByIdAndDelete(id);

    return NextResponse.json(
      {
        message: "Category deleted successfully",
        category
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { message: "Failed to delete category" },
      { status: 500 }
    );
  }
}