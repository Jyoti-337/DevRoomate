export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  avatar: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "James L.",
    role: "Indie Hacker",
    content: "Found my Next.js teammate in 10 minutes. We launched our MVP 2 weeks later and got 100 paying users.",
    avatar: "https://i.pravatar.cc/150?img=59",
  },
  {
    id: "2",
    name: "Priya S.",
    role: "CS Student",
    content: "Built our hackathon MVP in one night with a designer I met here. We actually ended up winning first place!",
    avatar: "https://i.pravatar.cc/150?img=20",
  },
  {
    id: "3",
    name: "Michael T.",
    role: "Startup Founder",
    content: "Met my startup cofounder here. It's like Tinder for developers, but actually works for serious builders.",
    avatar: "https://i.pravatar.cc/150?img=60",
  },
  {
    id: "4",
    name: "Anna K.",
    role: "Open Source Lead",
    content: "I needed a Rust developer for an open-source library I was maintaining. Connected with a maintainer from Berlin within hours.",
    avatar: "https://i.pravatar.cc/150?img=42",
  }
];
