import mongoose, { Schema, Document } from 'mongoose';

export interface IPing extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  postId?: mongoose.Types.ObjectId; // Optional: specific post they pinged about
  message?: string;
  status: string; // 'pending', 'accepted', 'rejected'
  createdAt: Date;
  updatedAt: Date;
}

const PingSchema: Schema = new Schema(
  {
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    postId: { type: Schema.Types.ObjectId, ref: 'Post' },
    message: { type: String },
    status: { type: String, default: 'pending', enum: ['pending', 'accepted', 'rejected'] },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Ping || mongoose.model<IPing>('Ping', PingSchema);
