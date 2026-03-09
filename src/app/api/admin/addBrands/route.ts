import { connectDB } from "@/lib/db";
import Brand from "@/models/brand";
import { NextResponse } from "next/server";

// Generate slug
function generateSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

// Ensure unique slug
async function createUniqueSlug(name: string) {
  let slug = generateSlug(name);
  let exists = await Brand.findOne({ slug });
  let counter = 1;

  while (exists) {
    slug = `${generateSlug(name)}-${counter}`;
    exists = await Brand.findOne({ slug });
    counter++;
  }

  return slug;
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const { name } = await req.json();
    console.log(name)
    if (!name || name.length < 2 || name.length > 30) {
      return NextResponse.json(
        { message: "Brand name must be 2–30 characters" },
        { status: 400 }
      );
    }

    const existingBrand = await Brand.findOne({ name });
    if (existingBrand) {
      return NextResponse.json(
        { message: "Brand already exists" },
        { status: 409 }
      );
    }

    const slug = await createUniqueSlug(name);

    const brand = await Brand.create({ name, slug });

    return NextResponse.json(
      { message: "Brand created successfully", brand },
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
