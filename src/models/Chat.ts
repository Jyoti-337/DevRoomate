import mongoose, { Schema, Document } from 'mongoose';

export interface IChat extends Document {
  participants: mongoose.Types.ObjectId[];
  lastMessage?: string;
  updatedAt: Date;
  createdAt: Date;
}

const ChatSchema: Schema = new Schema(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessage: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema);
