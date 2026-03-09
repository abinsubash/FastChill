import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/models/category";
import Product from "@/models/products";

/**
 * DELETE Category
 * Route: /api/admin/updateCategories/[id]
 * Method: DELETE
 * Description: Deletes a category by ID (with product dependency check)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Validate ID format
    if (!id || id.trim() === "") {
      return NextResponse.json(
        { message: "Category ID is required" },
        { status: 400 }
      );
    }

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    // Check if category is being used by any products
    const productsUsingCategory = await Product.countDocuments({ 
      category: id 
    });
    
    if (productsUsingCategory > 0) {
      return NextResponse.json(
        { 
          message: `Cannot delete category "${category.name}". It is currently being used by ${productsUsingCategory} product(s). Please reassign or delete these products first.`,
          productsCount: productsUsingCategory,
          categoryName: category.name
        },
        { status: 409 } // 409 Conflict
      );
    }

    // Delete the category (only if no products are using it)
    await Category.findByIdAndDelete(id);

    return NextResponse.json(
      {
        message: "Category deleted successfully",
        category: {
          _id: category._id,
          name: category.name,
          slug: category.slug
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting category:", error);
    
    // Handle specific MongoDB errors
    if (error.name === "CastError") {
      return NextResponse.json(
        { message: "Invalid category ID format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Failed to delete category. Please try again." },
      { status: 500 }
    );
  }
}