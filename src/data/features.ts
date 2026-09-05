import { Code2, Globe2, Zap, Trophy, Layers, Rocket } from "lucide-react";

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: any; // LucideIcon type
  image: string;
}

export const features: Feature[] = [
  {
    id: "1",
    title: "Smart Stack Matching",
    description: "Don't waste time looking for skills. Our algorithm instantly matches you with developers who complete your tech stack perfectly.",
    icon: Code2,
    image: "/images/features/matching.png",
  },
  {
    id: "2",
    title: "Timezone Collaboration",
    description: "Find partners who work when you do. Filter by timezone overlap so you can pair-program and ship without awful delays.",
    icon: Globe2,
    image: "/images/features/timezone.png",
  },
  {
    id: "3",
    title: "Instant Ping Requests",
    description: "Skip the awkward DMs. Just send a single ping request with your project details and start chatting if it's a match.",
    icon: Zap,
    image: "/images/features/pings.png",
  },
  {
    id: "4",
    title: "Hackathon Team Builder",
    description: "Need a designer for your weekend hackathon? Find available talent fast and win your next competition together.",
    icon: Trophy,
    image: "/images/features/hackathons.png",
  },
  {
    id: "5",
    title: "Open Source Collaboration",
    description: "Discover passionate developers eager to contribute or find maintainers to help scale your open-source repositories.",
    icon: Layers,
    image: "/images/features/opensource.png",
  },
  {
    id: "6",
    title: "Startup Co-founder Discovery",
    description: "Looking for a technical co-founder for your next YC application? Meet serious builders with startup experience.",
    icon: Rocket,
    image: "/images/features/cofounder.png",
  }
];
