export interface DeveloperProfile {
  id: string;
  name: string;
  role: string;
  stack: string[];
  availability: string;
  timezone: string;
  lookingFor: string;
  avatar: string;
  matchPercentage?: number;
  online?: boolean;
}

export const developers: DeveloperProfile[] = [
  {
    id: "1",
    name: "Alex Dev",
    role: "Frontend Engineer",
    stack: ["React", "Next.js", "Tailwind"],
    availability: "Part-time",
    timezone: "UTC-5 (EST)",
    lookingFor: "Fullstack SaaS Project",
    avatar: "https://i.pravatar.cc/150?img=11",
    matchPercentage: 98,
    online: true,
  },
  {
    id: "2",
    name: "Sarah Chen",
    role: "AI/ML Engineer",
    stack: ["Python", "PyTorch", "FastAPI"],
    availability: "Hackathons",
    timezone: "UTC+8 (SGT)",
    lookingFor: "AI Startup Co-founder",
    avatar: "https://i.pravatar.cc/150?img=47",
    matchPercentage: 94,
    online: true,
  },
  {
    id: "3",
    name: "David Kim",
    role: "Backend Developer",
    stack: ["Node.js", "PostgreSQL", "Go"],
    availability: "Full-time",
    timezone: "UTC+1 (CET)",
    lookingFor: "Open Source Contributor",
    avatar: "https://i.pravatar.cc/150?img=33",
    matchPercentage: 88,
    online: false,
  },
  {
    id: "4",
    name: "Elena Rodriguez",
    role: "UI/UX Designer",
    stack: ["Figma", "Framer", "React"],
    availability: "Part-time",
    timezone: "UTC-8 (PST)",
    lookingFor: "Frontend Developer Partner",
    avatar: "https://i.pravatar.cc/150?img=9",
    matchPercentage: 85,
    online: true,
  },
  {
    id: "5",
    name: "Marcus Johnson",
    role: "Smart Contract Dev",
    stack: ["Solidity", "Hardhat", "React"],
    availability: "Contract",
    timezone: "UTC+0 (GMT)",
    lookingFor: "DeFi Protocol Builders",
    avatar: "https://i.pravatar.cc/150?img=12",
    matchPercentage: 91,
    online: false,
  },
  {
    id: "6",
    name: "Li Wei",
    role: "Fullstack Developer",
    stack: ["Vue", "Nuxt", "Django"],
    availability: "Weekends",
    timezone: "UTC+8 (CST)",
    lookingFor: "Indie Hacker Project",
    avatar: "https://i.pravatar.cc/150?img=68",
    matchPercentage: 79,
    online: true,
  }
];
