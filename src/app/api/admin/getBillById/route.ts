import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Bill from '@/models/bill';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get billId from query parameter
    const { searchParams } = new URL(request.url);
    const billId = searchParams.get('billId');
    
    console.log("Bill ID:", billId);

    if (!billId) {
      return NextResponse.json(
        { success: false, message: 'Bill ID is required' },
        { status: 400 }
      );
    }

    const bill = await Bill.findById(billId)
      .populate('items.product', 'name category brand');

    if (!bill) {
      return NextResponse.json(
        { success: false, message: 'Bill not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      bill: {
        id: bill._id.toString(),
        billNumber: bill.billNumber,
        customerName: bill.customerName,
        customerPhone: bill.customerPhone,
        items: bill.items,
        subtotal: bill.subtotal,
        grandTotal: bill.grandTotal,
        paymentMethod: bill.paymentMethod,
        paymentStatus: bill.paymentStatus,
        createdAt: bill.createdAt,
        updatedAt: bill.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching bill:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch bill' },
      { status: 500 }
    );
  }
}