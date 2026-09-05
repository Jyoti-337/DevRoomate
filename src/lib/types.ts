export const DEVELOPER_ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full-Stack Developer",
  "Mobile Developer (iOS/Android/React Native/Flutter)",
  "DevOps/Cloud Engineer",
  "Data Engineer",
  "Data Scientist/ML Engineer",
  "AI/ML Engineer",
  "Game Developer",
  "Embedded/IoT Developer",
  "Blockchain/Web3 Developer",
  "QA/Test Engineer",
  "Security Engineer",
  "UI/UX Designer",
  "Site Reliability Engineer"
] as const;

export type DeveloperRole = typeof DEVELOPER_ROLES[number];

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  image: string | null;
  bio: string | null;
  role: string;
  stack: string[];
  availability: string;
  timezone: string | null;
  lookingFor: string | null;
  githubUrl: string | null;
  twitterUrl: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  projectType: string[];
  level: string;
  isRemoteOnly: boolean;
  createdAt: string;
}

export interface PingWithUser {
  id: string;
  message: string | null;
  status: string;
  createdAt: string;
  sender: UserProfile;
  receiver: UserProfile;
}

export interface DashboardData {
  user: UserProfile;
  stats: {
    pingsSent: number;
    pingsReceived: number;
    profileViews: number;
    avgMatchScore: number;
  };
  topMatches: (UserProfile & { matchScore: number })[];
  recentPingsReceived: PingWithUser[];
  recentPingsSent: PingWithUser[];
}
