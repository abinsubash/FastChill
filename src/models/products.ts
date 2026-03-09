import mongoose, { Schema, model, models, Types } from "mongoose";

export interface ProductDocument extends mongoose.Document {
  name: string;
  category: Types.ObjectId;
  brand: Types.ObjectId;
  description: string;
  sellingPrice: number;
  teachnitionprice: number;
  stock: number;
  images: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: Types.ObjectId,
      ref: "Category",
      required: true,
    },

    brand: {
      type: Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    description: {
      type: String,
      require: true
    },

    sellingPrice: {
      type: Number,
      required: true,
    },

    technicianPrice: {
      type: Number,
      required: true,
    },

    stock: {
      type: Number,
      default: 0,
    },

    images: {
      type: [String],
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);


export default models.Product || model<ProductDocument>("Product", ProductSchema);
