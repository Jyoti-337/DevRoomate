import mongoose, { Schema, Document } from 'mongoose';

export interface IRequest extends Document {
  title: string;
  projectType: string;
  description: string;
  techStack: string[];
  roles: string[];
  timeline: string;
  isRemoteOnly: boolean;
  authorId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RequestSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    projectType: { type: String, required: true },
    description: { type: String, required: true },
    techStack: [{ type: String, required: true }],
    roles: [{ type: String, required: true }],
    timeline: { type: String, required: true },
    isRemoteOnly: { type: Boolean, default: false },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Request || mongoose.model<IRequest>('Request', RequestSchema);
