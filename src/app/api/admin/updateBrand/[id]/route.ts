import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Brand from "@/models/brand";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// TOGGLE isActive status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const brand = await Brand.findById(id);
    if (!brand) {
      return NextResponse.json(
        { message: "Brand not found" },
        { status: 404 }
      );
    }

    const updatedBrand = await Brand.findByIdAndUpdate(
      id,
      { isActive: !brand.isActive },
      { new: true }
    );

    return NextResponse.json(
      {
        message: `Brand ${updatedBrand.isActive ? 'enabled' : 'disabled'} successfully`,
        brand: updatedBrand,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error toggling brand status:", error);
    return NextResponse.json(
      { message: "Failed to update brand status" },
      { status: 500 }
    );
  }
}

// UPDATE Brand
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const { name } = await request.json();

    if (!name || name.trim().length < 3 || name.trim().length > 30) {
      return NextResponse.json(
        { message: "Brand name must be between 3 and 30 characters" },
        { status: 400 }
      );
    }

    const existingBrand = await Brand.findById(id);
    if (!existingBrand) {
      return NextResponse.json(
        { message: "Brand not found" },
        { status: 404 }
      );
    }

    const newSlug = generateSlug(name);

    const duplicateSlug = await Brand.findOne({
      slug: newSlug,
      _id: { $ne: id },
    });

    if (duplicateSlug) {
      return NextResponse.json(
        { message: "A brand with this name already exists" },
        { status: 400 }
      );
    }

    const updatedBrand = await Brand.findByIdAndUpdate(
      id,
      { name: name.trim(), slug: newSlug },
      { new: true }
    );

    return NextResponse.json(
      {
        message: "Brand updated successfully",
        brand: updatedBrand,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating brand:", error);
    return NextResponse.json(
      { message: "Failed to update brand" },
      { status: 500 }
    );
  }
}

// DELETE Brand
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const brand = await Brand.findById(id);
    if (!brand) {
      return NextResponse.json(
        { message: "Brand not found" },
        { status: 404 }
      );
    }

    await Brand.findByIdAndDelete(id);

    return NextResponse.json(
      {
        message: "Brand deleted successfully",
        brand,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting brand:", error);
    return NextResponse.json(
      { message: "Failed to delete brand" },
      { status: 500 }
    );
  }
}