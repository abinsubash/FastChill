import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/products";
import Category from "@/models/category";
import Brand from "@/models/brand";
import { uploadImage, deleteImage, extractS3Key } from "@/lib/s3";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    const formData = await request.formData();

    // Extract form fields
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const brand = formData.get("brand") as string;
    const sellingPrice = formData.get("sellingPrice") as string;
    const teachnitionPrice = formData.get("teachnitionPrice") as string;
    const stock = formData.get("stock") as string;
    const description = formData.get("description") as string;

    // Get existing images that should be kept (sent as JSON string)
    const existingImagesStr = formData.get("existingImages") as string;
    const existingImages = existingImagesStr ? JSON.parse(existingImagesStr) : [];

    // Validation
    if (!name || !category || !brand || !sellingPrice || !teachnitionPrice) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify category exists
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    // Verify brand exists
    const brandDoc = await Brand.findById(brand);
    if (!brandDoc) {
      return NextResponse.json(
        { message: "Brand not found" },
        { status: 404 }
      );
    }

    // Handle new image uploads
    const newImages = formData.getAll("images") as File[];
    const uploadedImageUrls: string[] = [];

    if (newImages && newImages.length > 0) {
      for (const image of newImages) {
        if (image && image.size > 0) {
          const buffer = Buffer.from(await image.arrayBuffer());
          const fileName = `products/${Date.now()}-${Math.round(Math.random() * 1e9)}-${image.name}`;
          
          try {
            const imageUrl = await uploadImage(buffer, fileName, image.type);
            uploadedImageUrls.push(imageUrl);
            console.log(`Uploaded new image: ${imageUrl}`);
          } catch (error) {
            console.error("Error uploading image:", error);
            throw error;
          }
        }
      }
    }

    // Combine existing and new images
    const allImages = [...existingImages, ...uploadedImageUrls];

    if (allImages.length === 0) {
      return NextResponse.json(
        { message: "At least one product image is required" },
        { status: 400 }
      );
    }

    // Delete removed images from S3
    const imagesToDelete = existingProduct.images.filter(
      (img: string) => !existingImages.includes(img)
    );

    const deletionErrors: string[] = [];

    for (const imageUrl of imagesToDelete) {
      try {
        const key = extractS3Key(imageUrl);
        
        if (key) {
          await deleteImage(key);
          console.log(`Deleted image from S3: ${key}`);
        } else {
          console.warn(`Could not extract S3 key from URL: ${imageUrl}`);
        }
      } catch (error) {
        console.error(`Error deleting image ${imageUrl}:`, error);
        deletionErrors.push(imageUrl);
        // Continue even if deletion fails
      }
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        category: categoryDoc._id,
        brand: brandDoc._id,
        sellingPrice: parseFloat(sellingPrice),
        technicianPrice: parseFloat(teachnitionPrice),
        stock: stock ? parseInt(stock) : 0,
        description: description || "",
        images: allImages,
      },
      { new: true }
    )
      .populate("category", "name slug")
      .populate("brand", "name slug");

    // Build response
    const response: any = {
      message: "Product updated successfully",
      product: updatedProduct,
    };

    // Add warning if some images failed to delete
    if (deletionErrors.length > 0) {
      response.warning = "Some old images could not be deleted from S3";
      response.failedDeletions = deletionErrors;
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { message: "Failed to update product", error: String(error) },
      { status: 500 }
    );
  }
}