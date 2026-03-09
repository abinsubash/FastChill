import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Complaint from "@/models/complaint";
import { Types } from "mongoose";

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { complaintId, isComplete } = body;

    // Validate required fields
    if (!complaintId) {
      return NextResponse.json(
        {
          success: false,
          message: "Complaint ID is required",
        },
        { status: 400 }
      );
    }

    if (typeof isComplete !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          message: "isComplete must be a boolean value",
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

    // Find and update the complaint
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      complaintId,
      { isComplete },
      { new: true, runValidators: true }
    );

    if (!updatedComplaint) {
      return NextResponse.json(
        {
          success: false,
          message: "Complaint not found",
        },
        { status: 404 }
      );
    }

    console.log(
      `✅ Updated complaint ${complaintId} status to: ${isComplete ? "Completed" : "Pending"}`
    );

    return NextResponse.json(
      {
        success: true,
        message: `Complaint marked as ${isComplete ? "completed" : "pending"}`,
        complaint: {
          id: updatedComplaint._id.toString(),
          fullName: updatedComplaint.fullName,
          brand: updatedComplaint.brand,
          category: updatedComplaint.category,
          isComplete: updatedComplaint.isComplete,
          updatedAt: updatedComplaint.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error updating complaint status:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update complaint status",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
