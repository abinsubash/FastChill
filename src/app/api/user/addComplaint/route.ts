// src/app/api/user/addComplaint/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Complaint from "@/models/complaint";
import { uploadImage } from "@/lib/s3";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Parse form data
    const formData = await req.formData();

    // Extract text fields
    const fullName = formData.get("name") as string;
    const address = formData.get("address") as string;
    const primaryContactNumber = formData.get("phone") as string;
    const alternateContactNumber = formData.get("alternatePhone") as string;
    const brand = formData.get("brand") as string;
    const category = formData.get("category") as string;
    const problemDescription = formData.get("description") as string;

    console.log({
      fullName,
      address,
      primaryContactNumber,
      alternateContactNumber,
      brand,
      category,
      problemDescription,
    });

    // Validate required fields
    if (
      !fullName ||
      !address ||
      !primaryContactNumber ||
      !brand ||
      !category ||
      !problemDescription
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 }
      );
    }

    // Handle image uploads - using same pattern as product add
    const uploadedImages: string[] = [];
    const image1 = formData.get("image1") as File | null;
    const image2 = formData.get("image2") as File | null;

    // Upload image 1 to S3 if it exists
    if (image1 && image1.size > 0) {
      try {
        const buffer = Buffer.from(await image1.arrayBuffer());
        const fileName = `complaintIMG/${Date.now()}-${image1.name}`;
        const imageUrl = await uploadImage(buffer, fileName, image1.type);
        uploadedImages.push(imageUrl);
        console.log("✅ Image 1 uploaded:", imageUrl);
      } catch (error) {
        console.error("❌ Error uploading image 1:", error);
      }
    }

    // Upload image 2 to S3 if it exists
    if (image2 && image2.size > 0) {
      try {
        const buffer = Buffer.from(await image2.arrayBuffer());
        const fileName = `complaintIMG/${Date.now()}-${image2.name}`;
        const imageUrl = await uploadImage(buffer, fileName, image2.type);
        uploadedImages.push(imageUrl);
        console.log("✅ Image 2 uploaded:", imageUrl);
      } catch (error) {
        console.error("❌ Error uploading image 2:", error);
      }
    }

    console.log("Images stored on S3:", uploadedImages);

    // Create complaint document
    const complaint = await Complaint.create({
      fullName,
      address,
      primaryContactNumber,
      alternateContactNumber: alternateContactNumber || undefined,
      brand,
      category,
      problemDescription,
      images: uploadedImages,
      isComplete: false,
    });

    console.log("✅ Complaint created:", complaint._id);

    return NextResponse.json(
      {
        success: true,
        message: "Complaint registered successfully",
        complaint: {
          id: complaint._id.toString(),
          fullName: complaint.fullName,
          category: complaint.category,
          brand: complaint.brand,
          createdAt: complaint.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error creating complaint:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to register complaint",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}