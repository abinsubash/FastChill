// src/app/api/admin/getAllBills/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Bill from '@/models/bill';
import mongoose from 'mongoose';

// Type for populated product
interface PopulatedProduct {
  _id: mongoose.Types.ObjectId;
  name: string;
  category: any;
  brand: any;
}

// Type for bill item with possible populated product
interface BillItemWithProduct {
  product: mongoose.Types.ObjectId | PopulatedProduct;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

// Type for lean bill document
interface LeanBillDocument {
  _id: mongoose.Types.ObjectId;
  billNumber: string;
  customerName: string;
  customerPhone?: string;
  items: BillItemWithProduct[];
  subtotal: number;
  grandTotal: number;
  paymentMethod: "cash" | "upi" | "card";
  paymentStatus: "paid" | "unpaid";
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const searchTerm = searchParams.get('search');
    const dateFilter = searchParams.get('dateFilter') || 'all';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const paymentStatus = searchParams.get('paymentStatus');
    const paymentMethod = searchParams.get('paymentMethod');

    console.log('🔍 Filters:', {
      searchTerm,
      dateFilter,
      paymentStatus,
      paymentMethod,
    });

    // Build MongoDB query
    const query: any = {};

    // Search filter
    if (searchTerm && searchTerm.trim()) {
      query.$or = [
        { billNumber: { $regex: searchTerm.trim(), $options: 'i' } },
        { customerName: { $regex: searchTerm.trim(), $options: 'i' } },
        { customerPhone: { $regex: searchTerm.trim(), $options: 'i' } },
      ];
    }

    // Date filter
    if (dateFilter !== 'all') {
      if (dateFilter === 'custom' && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        query.createdAt = {
          $gte: start,
          $lte: end,
        };
      } else if (dateFilter === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        query.createdAt = {
          $gte: today,
          $lt: tomorrow,
        };
      } else if (dateFilter === 'yesterday') {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        query.createdAt = {
          $gte: yesterday,
          $lt: today,
        };
      }
    }

    // Payment status filter
    if (paymentStatus && paymentStatus !== 'all') {
      query.paymentStatus = paymentStatus;
    }

    // Payment method filter
    if (paymentMethod && paymentMethod !== 'all') {
      query.paymentMethod = paymentMethod;
    }

    console.log('📋 MongoDB Query:', JSON.stringify(query, null, 2));

    const bills = await Bill.find(query)
      .populate({
        path: 'items.product',
        select: 'name category brand'
      })
      .sort({ createdAt: -1 })
      .lean<LeanBillDocument[]>();

    console.log(`✅ Found ${bills.length} bills`);

    // Helper function to check if product is populated
    const isPopulatedProduct = (product: any): product is PopulatedProduct => {
      return product && typeof product === 'object' && '_id' in product;
    };

    // Map bills to include id field
    const mappedBills = bills.map((bill) => ({
      id: bill._id.toString(),
      billNumber: bill.billNumber,
      customerName: bill.customerName,
      customerPhone: bill.customerPhone || '',
      items: bill.items.map((item) => {
        const isPopulated = isPopulatedProduct(item.product);
        
        return {
          product: isPopulated 
            ? item.product._id.toString() 
            : item.product.toString(),
          name: item.name || (isPopulated ? item.product.name : 'Unknown Product'),
          quantity: item.quantity,
          price: item.price,
          total: item.total,
        };
      }),
      subtotal: bill.subtotal,
      grandTotal: bill.grandTotal,
      paymentMethod: bill.paymentMethod,
      paymentStatus: bill.paymentStatus,
      createdAt: bill.createdAt.toISOString(),
      updatedAt: bill.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      bills: mappedBills,
      count: mappedBills.length,
    });
  } catch (error) {
    console.error('❌ Error fetching bills:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch bills',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}