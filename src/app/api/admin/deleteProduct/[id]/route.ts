import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/products";
import { deleteImage } from "@/lib/s3";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Delete all product images from S3
    const deletionErrors: string[] = [];
    
    for (const imageUrl of product.images) {
      try {
        // Extract the S3 key from the URL
        // Example URL: https://bucket-name.s3.region.amazonaws.com/products/123456-image.jpg
        // We need to extract: products/123456-image.jpg
        
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
        // Continue deleting other images even if one fails
      }
    }

    // Delete product from database
    await Product.findByIdAndDelete(id);

    // Return response with any deletion errors
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
      {
        message: "Product and all images deleted successfully",
      },
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

/**
 * Extract S3 key from full S3 URL
 * @param url - Full S3 URL
 * @returns S3 key (path) or null if invalid
 */
function extractS3KeyFromUrl(url: string): string | null {
  try {
    // Handle different S3 URL formats:
    // 1. https://bucket-name.s3.region.amazonaws.com/products/123456-image.jpg
    // 2. https://s3.region.amazonaws.com/bucket-name/products/123456-image.jpg
    // 3. Custom domain: https://cdn.example.com/products/123456-image.jpg
    
    const urlObj = new URL(url);
    
    // For standard S3 URLs (bucket.s3.region.amazonaws.com)
    if (urlObj.hostname.includes('.s3.')) {
      // pathname starts with /, so remove it
      return urlObj.pathname.substring(1);
    }
    
    // For path-style URLs (s3.region.amazonaws.com/bucket)
    if (urlObj.hostname.includes('s3.')) {
      const pathParts = urlObj.pathname.substring(1).split('/');
      // Remove bucket name and join the rest
      return pathParts.slice(1).join('/');
    }
    
    // For custom domains or CloudFront, assume the path is the key
    return urlObj.pathname.substring(1);
  } catch (error) {
    console.error("Error parsing S3 URL:", error);
    return null;
  }
}