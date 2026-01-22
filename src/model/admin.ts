import mongoose, { Schema, Model, Types } from "mongoose";

export interface Admin {
  email: string;
  password: string;
}

export interface AdminDocument extends Admin {
  _id: Types.ObjectId;
}

const AdminSchema = new Schema<AdminDocument>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const AdminModel: Model<AdminDocument> =
  mongoose.models.Admin ||
  mongoose.model<AdminDocument>("Admin", AdminSchema);

export default AdminModel;
