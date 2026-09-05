import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  password?: string;
  avatar?: string;
  bio?: string;
  lookingFor?: string;
  techStack: string[];
  availability: string;
  timezone?: string;
  projectType: string[];
  isRemoteOnly?: boolean;
  level?: string;
  github?: string;
  linkedin?: string;
  portfolio?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    avatar: { type: String },
    bio: { type: String, default: "" },
    lookingFor: { type: String, default: "" },
    techStack: { type: [{ type: String }], default: ["React"] },
    availability: { type: String, default: "Part-time" },
    timezone: { type: String, default: "UTC-8" },
    projectType: { type: [{ type: String }], default: ["Startup MVP"] },
    isRemoteOnly: { type: Boolean, default: false },
    level: { type: String, default: "intermediate", enum: ["beginner", "intermediate", "advanced", "expert"] },
    github: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    portfolio: { type: String, default: "" },
    role: { type: String, default: "Developer" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
