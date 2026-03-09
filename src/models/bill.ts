// src/models/bill.ts
import mongoose, { Schema, model, models } from "mongoose";

// Interface for Bill Item
export interface IBillItem {
  product: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

// Interface for Bill Document
export interface IBillDocument extends mongoose.Document {
  billNumber: string;
  customerName: string;
  customerPhone?: string;
  items: IBillItem[];
  subtotal: number;
  grandTotal: number;
  paymentMethod: "cash" | "upi" | "card";
  paymentStatus: "paid" | "unpaid";
  createdAt: Date;
  updatedAt: Date;
}

const BillSchema = new Schema<IBillDocument>(
  {
    billNumber: {
      type: String,
      required: [true, "Bill number is required"],
      unique: true,
      trim: true,
    },

    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },

    customerPhone: {
      type: String,
      trim: true,
    },

    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "Product reference is required"],
        },
        name: {
          type: String,
          required: [true, "Product name is required"],
          trim: true,
        },
        quantity: {
          type: Number,
          required: [true, "Quantity is required"],
          min: [1, "Quantity must be at least 1"],
        },
        price: {
          type: Number,
          required: [true, "Price is required"],
          min: [0, "Price cannot be negative"],
        },
        total: {
          type: Number,
          required: [true, "Total is required"],
          min: [0, "Total cannot be negative"],
        },
      },
    ],

    subtotal: {
      type: Number,
      required: [true, "Subtotal is required"],
      min: [0, "Subtotal cannot be negative"],
    },

    grandTotal: {
      type: Number,
      required: [true, "Grand total is required"],
      min: [0, "Grand total cannot be negative"],
    },

    paymentMethod: {
      type: String,
      enum: {
        values: ["cash", "upi", "card"],
        message: "Payment method must be cash, upi, or card",
      },
      required: [true, "Payment method is required"],
    },

    paymentStatus: {
      type: String,
      enum: {
        values: ["paid", "unpaid"],
        message: "Payment status must be paid or unpaid",
      },
      default: "paid",
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
BillSchema.index({ billNumber: 1 });
BillSchema.index({ createdAt: -1 });
BillSchema.index({ paymentStatus: 1 });
BillSchema.index({ customerName: 1 });
BillSchema.index({ customerPhone: 1 });

// Pre-save hook to auto-calculate totals (optional but recommended)
BillSchema.pre("save", function (next) {
  // Calculate subtotal from items
  this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
  
  // For now, grandTotal equals subtotal (you can add tax/discount logic here)
  this.grandTotal = this.subtotal;
  
  next();
});

export default models.Bill || model<IBillDocument>("Bill", BillSchema);