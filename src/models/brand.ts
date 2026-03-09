import mongoose, { Schema, model, models } from "mongoose";

const BrandSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.Brand || model("Brand", BrandSchema);
