import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/products";
import { deleteImage } from "@/lib/s3";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ✅ changed here
) {
  try {
    await connectDB();

    const { id } = await params;  // ✅ already correct

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    const deletionErrors: string[] = [];
    
    for (const imageUrl of product.images) {
      try {
        const key = extractS3KeyFromUrl(imageUrl);
        if (key) {
          await deleteImage(key);
          console.log(`Deleted image from S3: ${key}`);
        } else {
          console.warn(`Could not extract S3 key from URL: ${imageUrl}`);
        }
      } catch (error) {
        console.error(`Error deleting image ${imageUrl}:`, error);
        deletionErrors.push(imageUrl);
      }
    }

    await Product.findByIdAndDelete(id);

    if (deletionErrors.length > 0) {
      return NextResponse.json(
        {
          message: "Product deleted successfully, but some images failed to delete from S3",
          failedImages: deletionErrors,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: "Product and all images deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { message: "Failed to delete product" },
      { status: 500 }
    );
  }
}

function extractS3KeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('.s3.')) {
      return urlObj.pathname.substring(1);
    }
    if (urlObj.hostname.includes('s3.')) {
      const pathParts = urlObj.pathname.substring(1).split('/');
      return pathParts.slice(1).join('/');
    }
    return urlObj.pathname.substring(1);
  } catch (error) {
    console.error("Error parsing S3 URL:", error);
    return null;
  }
}