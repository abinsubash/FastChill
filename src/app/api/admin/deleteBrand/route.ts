import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Brand from "@/models/brand";
import Product from "@/models/products";

/**
 * DELETE Brand
 * Route: /api/admin/deleteBrand
 * Method: DELETE
 * Body: { id: string }
 * Description: Deletes a brand by ID (with product dependency check)
 */
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const { id } = await req.json();

    // Validation
    if (!id || id.trim() === "") {
      return NextResponse.json(
        { message: "Brand ID is required" },
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

    // Check if brand is being used by any products
    // This checks multiple possible field names for the brand reference
    const productsUsingBrand = await Product.countDocuments({
      $or: [
        { brand: id },
        { brandId: id },
        { brand_id: id }
      ]
    });
    
    if (productsUsingBrand > 0) {
      return NextResponse.json(
        { 
          message: `Cannot delete brand "${existingBrand.name}". It is currently being used by ${productsUsingBrand} product(s). Please reassign or delete these products first.`,
          productsCount: productsUsingBrand,
          brandName: existingBrand.name
        },
        { status: 409 } // 409 Conflict - resource cannot be deleted due to dependencies
      );
    }

    // Delete brand (only if no products are using it)
    await Brand.findByIdAndDelete(id);

    return NextResponse.json(
      { 
        message: "Brand deleted successfully",
        brand: {
          _id: existingBrand._id,
          name: existingBrand.name,
          slug: existingBrand.slug
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting brand:", error);
    
    // Handle specific MongoDB errors
    if (error.name === "CastError") {
      return NextResponse.json(
        { message: "Invalid brand ID format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Failed to delete brand. Please try again." },
      { status: 500 }
    );
  }
}