// src/app/api/admin/getAllComplaints/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Complaint, { ComplaintDocument } from "@/models/complaint";
import { Types } from "mongoose";

// Define the type for lean query results
interface LeanComplaint {
  _id: Types.ObjectId;
  fullName: string;
  address: string;
  primaryContactNumber: string;
  alternateContactNumber?: string;
  brand: string;
  category: string;
  problemDescription: string;
  images: string[];
  isComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Fetch all complaints, sorted by most recent first
    const complaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .lean<LeanComplaint[]>(); // Add type annotation here

    // Format complaints for frontend
    const formattedComplaints = complaints.map(complaint => ({
      id: complaint._id.toString(),
      fullName: complaint.fullName,
      address: complaint.address,
      primaryContactNumber: complaint.primaryContactNumber,
      alternateContactNumber: complaint.alternateContactNumber || '',
      brand: complaint.brand,
      category: complaint.category,
      problemDescription: complaint.problemDescription,
      images: complaint.images || [],
      isComplete: complaint.isComplete || false,
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt,
    }));

    console.log(`✅ Fetched ${formattedComplaints.length} complaints`);

    return NextResponse.json(
      {
        success: true,
        complaints: formattedComplaints,
        total: formattedComplaints.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error fetching complaints:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch complaints",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}