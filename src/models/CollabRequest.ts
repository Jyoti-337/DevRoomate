import mongoose, { Schema, Document } from 'mongoose';

export interface ICollabRequest extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  projectType: string;
  description: string;
  stackNeeded: string[];
  roles: string[];
  level: string;
  timeline?: string;
  remoteOnly: boolean;
  contactPreference: string;
  status: string;
  applicants: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CollabRequestSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    projectType: { type: String, required: true },
    description: { type: String, required: true },
    stackNeeded: [{ type: String }],
    roles: [{ type: String, required: true }],
    level: { type: String, default: 'any' },
    timeline: { type: String },
    remoteOnly: { type: Boolean, default: true },
    contactPreference: { type: String, default: 'ping' },
    status: { type: String, default: 'active' },
    applicants: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
  },
  {
    timestamps: true,
  }
);


export default mongoose.models.CollabRequest || mongoose.model<ICollabRequest>('CollabRequest', CollabRequestSchema);
