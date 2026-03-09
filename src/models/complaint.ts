// src/models/complaint.ts
import mongoose, { Schema, model, models } from "mongoose";

export interface ComplaintDocument extends mongoose.Document {
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

const ComplaintSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },

    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },

    primaryContactNumber: {
      type: String,
      required: [true, "Primary contact number is required"],
      trim: true,
    },

    alternateContactNumber: {
      type: String,
      trim: true,
    },

    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },

    problemDescription: {
      type: String,
      required: [true, "Problem description is required"],
      trim: true,
    },

    images: {
      type: [String],
      default: [],
    },

    isComplete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
ComplaintSchema.index({ createdAt: -1 });
ComplaintSchema.index({ isComplete: 1 });
ComplaintSchema.index({ category: 1 });

export default models.Complaint ||
  model<ComplaintDocument>("Complaint", ComplaintSchema);