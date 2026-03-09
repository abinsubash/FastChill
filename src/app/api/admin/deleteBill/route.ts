// src/app/api/admin/deleteBill/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Bill from "@/models/bill";
import Product from "@/models/products";

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { billId } = body;

    // Validation
    if (!billId) {
      return NextResponse.json(
        {
          success: false,
          message: "Bill ID is required",
        },
        { status: 400 }
      );
    }

    // Find the bill
    const bill = await Bill.findById(billId);

    if (!bill) {
      return NextResponse.json(
        {
          success: false,
          message: "Bill not found",
        },
        { status: 404 }
      );
    }

    // Restore product stock
    for (const item of bill.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } },
        { new: true }
      );
    }

    // Delete the bill
    await Bill.findByIdAndDelete(billId);

    console.log(`✅ Bill deleted: ${bill.billNumber}`);

    return NextResponse.json(
      {
        success: true,
        message: "Bill deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error deleting bill:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete bill",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}