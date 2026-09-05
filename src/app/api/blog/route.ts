import { NextResponse } from "next/server";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  tag: string;
  date: string;
  readTime: string;
  image: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
}

export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-find-technical-cofounder",
    title: "How to Find the Perfect Technical Co-founder",
    excerpt: "Stop looking for developers and start looking for partners. Here's a proven framework.",
    tag: "Startups",
    date: "Oct 12, 2026",
    readTime: "5 min read",
    image: "/images/blog/cofounder.png",
    author: {
      name: "Alex Chen",
      avatar: "https://i.pravatar.cc/150?img=11",
      role: "CEO @ Dev Roommate"
    },
    content: `
      Finding the right technical co-founder is often described as harder than getting married. You're entering a relationship where the stakes are high, the stress is guaranteed, and the financial outcomes are deeply entwined. Yet, many founders approach this search like they're ordering from a menu.

      ### The Myth of the 10x Developer
      When searching for a partner, the instinct is to find someone who knows everything—React, Python, AWS, Kubernetes, and machine learning. But what you actually need is someone who aligns with your pacing, your risk tolerance, and your communication style.

      > "Stop looking for developers and start looking for partners who happen to write code."

      ### How to Structure the Search
      1. **Start with a small project:** A week-long hackathon is the perfect sandbox. It tests stress management, communication protocols, and execution speed without locking you into equity negotiations early.
      2. **Evaluate their 'Why':** Why do they want to build a startup? Are they running from a bad corporate job, or running towards a specific problem space?
      3. **The disagreement test:** Introduce a technical or product disagreement early. Observe how they handle being challenged. Do they get defensive, or do they rationally argue their point?

      ### Where Do You Find Them?
      Communities like Dev Roommate excel because they filter for intent. People actively list their tech stack, availability, and project interests—lowering the friction of that vital first message.

      In conclusion, treat the technical co-founder search as a phased relationship. Start small, verify alignment in stressful micro-environments (like a hackathon), and scale the commitment as trust builds.
    `
  },
  {
    slug: "winning-hackathons-remote",
    title: "A Guide to Winning Remote Hackathons",
    excerpt: "Best practices for asynchronous team coordination and fast iteration during 48-hour sprints.",
    tag: "Hackathons",
    date: "Sep 28, 2026",
    readTime: "8 min read",
    image: "/images/blog/hackathons.png",
    author: {
      name: "Sarah Jenkins",
      avatar: "https://i.pravatar.cc/150?img=12",
      role: "Lead Designer @ HackLeague"
    },
    content: `
      Remote hackathons are a breed of their own. Unlike in-person events where you can tap a teammate on the shoulder, remote coordination requires deliberate, clear communication pipelines and rapid asynchronous loops.

      ### 1. Establish the "Single Source of Truth"
      Before writing a line of code, align on your project management hub. A clean Notion page or a shared GitHub project board keeps all design files, tasks, and API specifications documented. This minimizes the "What should I do next?" questions at 3:00 AM.

      ### 2. Standardize Your Dev Environment
      Don't waste 4 hours of a 48-hour sprint configuring webpack or environment variables. Use tools like Docker, standard create-next-app boilerplate templates, and simple pre-configured DB scripts so everyone can run code locally instantly.

      ### 3. The 12-Hour Milestone Rule
      Divide your hackathon into four distinct blocks:
      * **Hour 0-12**: Ideation, specs, design assets, base boilerplate setup.
      * **Hour 12-24**: Core backend APIs, database mapping, primary frontend pages.
      * **Hour 24-36**: Feature completion, UI integrations, testing, mock data wiring.
      * **Hour 36-48**: Video recording, presentation writing, polishing micro-animations.

      By checking in rigidly every 12 hours, you ensure nobody goes down a rabbit hole that doesn't ship.
    `
  },
  {
    slug: "open-source-contributions",
    title: "Why Your First Open Source PR Matters",
    excerpt: "The unspoken rules of the open source community and how to make an impact immediately.",
    tag: "Open Source",
    date: "Sep 15, 2026",
    readTime: "4 min read",
    image: "/images/blog/opensource.png",
    author: {
      name: "David Kim",
      avatar: "https://i.pravatar.cc/150?img=13",
      role: "Maintainer @ DevRoommate Core"
    },
    content: `
      Many developers view open-source contribution as a daunting wall. They think they need to submit massive refactors or fix complex bugs in legendary libraries. In reality, the best way to get noticed is through consistent, clean, and helpful PRs.

      ### Understanding Maintainer Stress
      Open-source maintainers are almost always volunteer workers under constant influx of issues, feature demands, and broken code. When you submit a PR, your goal should be to minimize their review workload.

      ### The Anatomy of an Excellent PR
      * **Read the CONTRIBUTING.md**: Always adhere strictly to the project's formatting, linting, and testing workflows.
      * **Keep it Small**: A PR fixing a single well-documented bug is infinitely easier to merge than a giant PR that changes 15 unrelated files.
      * **Write a Detailed Summary**: State exactly *what* you changed, *why* you did it, and *how* to test it. If it affects the UI, include screenshots or a quick loom video!

      By being communicative and meticulous, you will build reputation, earn maintainer trust, and unlock career opportunities.
    `
  },
  {
    slug: "nextjs-14-patterns",
    title: "Advanced Next.js 14 Patterns for SaaS",
    excerpt: "Structure your App Router gracefully using these battle-tested enterprise patterns.",
    tag: "Engineering",
    date: "Sep 02, 2026",
    readTime: "12 min read",
    image: "/images/blog/nextjs.png",
    author: {
      name: "Emily Parker",
      avatar: "https://i.pravatar.cc/150?img=14",
      role: "Lead Architect @ SaaSify"
    },
    content: `
      The transition to the App Router in Next.js has changed how we think about state, layouts, and server boundaries. When building multi-tenant SaaS platforms, standard layouts quickly fall short. Here are three advanced patterns to keep your app performant.

      ### 1. Hybrid Server-Client Data Fetching
      Instead of making every page a Client Component to handle search filters, utilize Server-Side query parameters in page params, fetch data securely inside the Server Component, and pass it down. You get instant SEO indexing and ultra-fast initial loads, with reactive hydration on the frontend.

      ### 2. Intercepting & Parallel Routes for Overlays
      If you want users to view profiles or project details in a modal overlay while keeping the search feed intact in the background, use Next.js parallel routes (\`@modal\`) and route interception (\`(.)profile\`). This enables clean shareable URLs for popups without losing application context.

      ### 3. Middleware-Level Subdomain Routing
      For SaaS platforms that need custom customer subdomains (e.g. \`tenant.yourdomain.com\`), implement hostname parsing in \`middleware.ts\` to gracefully rewrite requests into dynamic workspace folder hierarchies internally.
    `
  },
  {
    slug: "remote-collaboration-tools",
    title: "Our Favorite Remote Collaboration Tools",
    excerpt: "Beyond Slack and Zoom: How we build and maintain momentum as a fully distributed team.",
    tag: "Culture",
    date: "Aug 20, 2026",
    readTime: "6 min read",
    image: "/images/blog/collaboration.png",
    author: {
      name: "Alex Chen",
      avatar: "https://i.pravatar.cc/150?img=11",
      role: "CEO @ Dev Roommate"
    },
    content: `
      Everyone knows Slack and Zoom. But fully remote teams require specialized coordination tools to prevent alignment drift and continuous meeting fatigue. Here are three tools that completely transformed our product velocity.

      ### 1. Loom for Asynchronous Updates
      Instead of scheduling a 30-minute sync to explain a feature or walk through a bug, record a quick 3-minute Loom. Developers can watch it at 2x speed in their own timezones, saving hours of active meeting cross-fire.

      ### 2. Linear for Focused Project Tracking
      Jira is often bloated and slow. Linear is keyboard-shortcut-driven, lightning-fast, and built for modern engineering sprints. It helps distributed teams align on clear cycles without overhead project management clutter.

      ### 3. Excalidraw for Virtual Brainstorming
      Excalidraw provides a lightweight, collaborative sketching board that mimics a real whiteboard perfectly. It's the ultimate tool for architectural mapping, flow charting, and collaborative product brainstorming sessions.
    `
  },
  {
    slug: "idea-to-mvp",
    title: "From Idea to MVP in 30 Days",
    excerpt: "A ruthless prioritization guide for indie hackers wanting to launch software fast.",
    tag: "Indie Hacking",
    date: "Aug 05, 2026",
    readTime: "9 min read",
    image: "/images/blog/mvp.png",
    author: {
      name: "Sarah Jenkins",
      avatar: "https://i.pravatar.cc/150?img=12",
      role: "Lead Designer @ HackLeague"
    },
    content: `
      Shipping a Minimum Viable Product in 30 days is about what you choose *not* to build. The biggest pitfall for indie hackers is scope creep—adding features because they "might be useful later."

      ### Week 1: Define the Core Hook
      What is the *single* problem your app solves? If you're building a dev matchmaking portal, the hook is: "Let users see available developers and send a direct contact request." Everything else (achievements, chat rooms, community forums) can wait.

      ### Week 2: Design with High-Fidelity UI Boilerplates
      Don't design components from scratch. Use premium library foundations like Tailwind UI, shadcn, or a custom pre-built design system. Ship a polished, professional-looking application on day one to establish trust.

      ### Week 3: Simple Integrations & Single DB Flow
      Use standard auth (e.g. NextAuth credentials or social logins) and a robust MongoDB/Prisma schema. Keep your data flow completely straightforward. Focus on the core user journey without building overly complex microservice systems.

      ### Week 4: The 80% Rule and Launch
      On day 30, your product will have minor bugs. Launch anyway. Real feedback from actual users is infinitely more valuable than spending another 3 months polishing features in isolation.
    `
  }
];

export async function GET() {
  return NextResponse.json(blogPosts);
}
