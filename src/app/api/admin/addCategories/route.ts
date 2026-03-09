import { connectDB } from "@/lib/db";
import Category from "@/models/category";
import { NextResponse } from "next/server";

// Generate URL-friendly slug from name
function generateSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")          // replace spaces with -
    .replace(/[^a-z0-9-]/g, "");  // remove invalid characters
}

// Ensure slug is unique in DB
async function createUniqueSlug(name: string) {
  let slug = generateSlug(name);
  let exists = await Category.findOne({ slug });
  let counter = 1;

  while (exists) {
    slug = `${generateSlug(name)}-${counter}`;
    exists = await Category.findOne({ slug });
    counter++;
  }

  return slug;
}

export async function POST(req: Request) {
  try {
    // Connect to DB
    await connectDB();

    const body = await req.json();
    const { name } = body;

    // Basic validation
    if (!name || name.length < 3 || name.length > 30) {
      return NextResponse.json(
        { message: "Category name must be 3–30 characters" },
        { status: 400 }
      );
    }

    // Check if category with same name exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return NextResponse.json(
        { message: "Category already exists" },
        { status: 409 }
      );
    }

    // Generate unique slug
    const slug = await createUniqueSlug(name);

    // Create category in DB
    console.log('This is slug', slug)
    const category = await Category.create({ name, slug });

    return NextResponse.json(
      { message: "Category created successfully", category },
      { status: 201 }
    );

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
