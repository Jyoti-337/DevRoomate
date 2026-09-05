import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
  authorId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  projectType: string;
  techStack: string[];
  teamSize?: string;
  availability: string;
  status: string; // 'open' or 'closed'
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema: Schema = new Schema(
  {
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    projectType: { type: String, required: true }, // e.g., 'SaaS', 'Hackathon'
    techStack: [{ type: String, required: true }],
    teamSize: { type: String },
    availability: { type: String, required: true },
    status: { type: String, default: 'open', enum: ['open', 'closed'] },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);
