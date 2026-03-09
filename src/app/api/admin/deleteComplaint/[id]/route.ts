import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Complaint from "@/models/complaint";
import { Types } from "mongoose";

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { complaintId } = body;

    // Validate complaint ID
    if (!complaintId) {
      return NextResponse.json(
        {
          success: false,
          message: "Complaint ID is required",
        },
        { status: 400 }
      );
    }

    // Validate MongoDB ObjectId format
    if (!Types.ObjectId.isValid(complaintId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid complaint ID format",
        },
        { status: 400 }
      );
    }

    // Find and delete the complaint
    const deletedComplaint = await Complaint.findByIdAndDelete(complaintId);

    if (!deletedComplaint) {
      return NextResponse.json(
        {
          success: false,
          message: "Complaint not found",
        },
        { status: 404 }
      );
    }

    console.log(`✅ Deleted complaint: ${complaintId}`);

    return NextResponse.json(
      {
        success: true,
        message: "Complaint deleted successfully",
        deletedComplaint: {
          id: deletedComplaint._id.toString(),
          fullName: deletedComplaint.fullName,
          brand: deletedComplaint.brand,
          category: deletedComplaint.category,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error deleting complaint:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete complaint",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}