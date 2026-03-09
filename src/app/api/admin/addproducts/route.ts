import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/s3";
import Product from "@/models/products";
import Category from "@/models/category";
import Brand from "@/models/brand";
import { connectDB } from "@/lib/db";

export async function POST(req: Request) {
  try {
    // Connect to database
    await connectDB();
console.log("hi")
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const sellingPrice = formData.get("sellingPrice") as string;
    const stock = formData.get("stock") as string;
    const brand = formData.get("brand") as string;
    const teachnitionPrice = formData.get("teachnitionPrice") as string;
    const description = formData.get("description") as string;

    const images = formData.getAll("images") as File[];

    console.log({
      name,
      category,
      sellingPrice,
      stock,
      brand,
      teachnitionPrice,
      description,
      images,
    });

    // Validation
    if (!name || !category || !sellingPrice || !teachnitionPrice) {
      return NextResponse.json(
        { message: "Name, category, selling price, and teachnition price are required" },
        { status: 400 }
      );
    }

    if (!images.length) {
      return NextResponse.json(
        { message: "At least one image is required" },
        { status: 400 }
      );
    }

    // Find category and brand IDs
    const categoryDoc = await Category.findOne({ _id: category });
    if (!categoryDoc) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    const brandDoc = await Brand.findOne({ _id: brand });
    if (!brandDoc) {
      return NextResponse.json(
        { message: "Brand not found" },
        { status: 404 }
      );
    }

    // Upload images to S3
    const imageUrls: string[] = [];

 console.log("Starting image upload...");
for (const image of images) {
  console.log("Processing image:", image.name);
  const buffer = Buffer.from(await image.arrayBuffer());
  const fileName = `products/${Date.now()}-${image.name}`;
  console.log("Uploading to S3:", fileName);
  const imageUrl = await uploadImage(buffer, fileName, image.type);
  console.log("Uploaded successfully:", imageUrl);
  imageUrls.push(imageUrl);
}
    console.log("Images stored on S3:", imageUrls);

    // Create product in database
    const newProduct = await Product.create({
      name,
      category: categoryDoc._id,
      brand: brandDoc._id,
      description: description || "",
      sellingPrice: parseFloat(sellingPrice),
      technicianPrice: parseFloat(teachnitionPrice), // ✅ Changed from teachnitionPrice
      stock: stock ? parseInt(stock) : 0,
      images: imageUrls,
      isActive: true,
    });

    // Populate category and brand for response
    await newProduct.populate("category brand");

    return NextResponse.json(
      {
        message: "Product added successfully",
        product: {
          id: newProduct._id,
          name: newProduct.name,
          category: categoryDoc.name,
          brand: brandDoc.name,
          description: newProduct.description,
          sellingPrice: newProduct.sellingPrice,
          technicianPrice: newProduct.technicianPrice, // ✅ Changed from teachnitionPrice
          stock: newProduct.stock,
          images: newProduct.images,
          mainImage: newProduct.images[0],
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding product:", error);
    return NextResponse.json(
      { message: "Failed to add product", error: String(error) },
      { status: 500 }
    );
  }
}