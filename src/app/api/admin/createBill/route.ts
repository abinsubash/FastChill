// src/app/api/admin/createBill/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Bill from "@/models/bill";
import Product from "@/models/products";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const {
      customerName,
      customerPhone,
      items,
      subtotal,
      grandTotal,
      paymentMethod,
      paymentStatus,
    } = body;

      console.log(body)
    // Validation
    if (!customerName || !items || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer name and items are required",
        },
        { status: 400 }
      );
    }

    // Validate each item
    for (const item of items) {
      if (!item.product || !item.name || !item.quantity || item.quantity < 1 || !item.price || item.price < 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid item data. Each item must have product, name, quantity, and price",
          },
          { status: 400 }
        );
      }

      // Check if product exists and has enough stock
      const product = await Product.findById(item.product);
      if (!product) {
        return NextResponse.json(
          {
            success: false,
            message: `Product ${item.name} not found`,
          },
          { status: 404 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            message: `Insufficient stock for ${item.name}. Available: ${product.stock}`,
          },
          { status: 400 }
        );
      }
    }

    // Generate bill number
    const billCount = await Bill.countDocuments();
    const billNumber = `BILL-${Date.now()}-${billCount + 1}`;

    // Create bill
    const bill = await Bill.create({
      billNumber,
      customerName,
      customerPhone: customerPhone || undefined,
      items: items.map((item: any) => ({
        product: item.product,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      })),
      subtotal,
      grandTotal,
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: paymentStatus || 'paid',
    });

    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
    }

    console.log(`✅ Bill created: ${billNumber}`);

    // Populate product details for response
    await bill.populate('items.product', 'name');

    return NextResponse.json(
      {
        success: true,
        message: "Bill created successfully",
        bill: {
          id: bill._id.toString(),
          billNumber: bill.billNumber,
          customerName: bill.customerName,
          customerPhone: bill.customerPhone,
          items: bill.items.map((item: any) => ({
            product: item.product._id.toString(),
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
          })),
          subtotal: bill.subtotal,
          grandTotal: bill.grandTotal,
          paymentMethod: bill.paymentMethod,
          paymentStatus: bill.paymentStatus,
          createdAt: bill.createdAt,
          updatedAt: bill.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error creating bill:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create bill",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}