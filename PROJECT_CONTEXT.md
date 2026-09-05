# DevRoommate - Project Context & Developer Reference

This document provides a comprehensive overview of the DevRoommate codebase. It outlines the technology stack, application architecture, database schemas, API routes, page structures, and styling systems. Use this file as a context sheet for other LLM prompts when adding new features or resolving issues.

---

## 🛠️ Technology Stack & Environment

1. **Framework**: Next.js v16.2.4 (App Router)
2. **Library**: React v19.2.4
3. **Database**: MongoDB & Mongoose ORM (`mongoose` version 9.x)
4. **Auth**: NextAuth.js (`next-auth` version 4.x)
5. **Styling**: Tailwind CSS v4.x + PostCSS (Note: Theme variables and custom utilities are standard Tailwind v4 CSS imports configured in `src/app/globals.css`. There is no `tailwind.config.js` or `tailwind.config.ts`).
6. **State Management**: 
   - **Global/Filter State**: Zustand (`zustand` v5.x)
   - **Server State / Fetching**: React Query (`@tanstack/react-query` v5.x)
7. **Real-time / WebSocket**: Pusher (`pusher` & `pusher-js` v8/v5)
8. **Animations**: Framer Motion (`framer-motion` v12.x)

### Environment Variables (`.env`)
Ensure the following variables are configured in your local environment:
- `MONGODB_URI`: Connection string (local: `mongodb://127.0.0.1:27017/devroommate`).
- `NEXTAUTH_SECRET`: Secret JWT signing key.
- `NEXTAUTH_URL`: Canonical OAuth URL (e.g. `http://localhost:3000`).
- `PUSHER_APP_ID`, `PUSHER_SECRET`: Pusher application credentials.
- `NEXT_PUBLIC_PUSHER_KEY`, `NEXT_PUBLIC_PUSHER_CLUSTER`: Client-side Pusher configurations.

---

## 📂 Codebase Directory Layout

```text
├── prisma/                    # Raw database blueprint (mostly unused, Mongoose is primary)
│   └── schema.prisma          # Prisma schema structure (retained for reference)
├── public/                    # Static assets
└── src/
    ├── app/                   # App Router directories (Routes & pages)
    │   ├── api/               # API endpoints
    │   │   ├── auth/          # NextAuth endpoints
    │   │   ├── pings/         # Collaboration request APIs
    │   │   ├── posts/         # Feed posts APIs
    │   │   ├── requests/      # Listing recruitment post APIs
    │   │   ├── seed/          # Seeder logic to populate MongoDB
    │   │   └── users/         # Users query & update APIs
    │   ├── dashboard/         # Combined Dev dashboard page
    │   ├── developers/        # Developer directory view
    │   ├── login/ / signup/   # Auth forms
    │   ├── pings/             # Pings manager panel
    │   ├── post-request/      # Form to submit a teammate request
    │   ├── profile/           # Profile views (/[username] & /edit)
    │   ├── requests/          # Search/View recruitment posts
    │   ├── layout.tsx         # Root container
    │   └── globals.css        # Tailwind config directive & custom styles
    ├── components/            # Shared UI components
    │   ├── DeveloperCard.tsx  # Grid element representation for users
    │   ├── DeveloperFeed.tsx  # Dynamic component subscribing to filters
    │   ├── FilterBar.tsx      # Sidebar/Header control board
    │   ├── Navbar.tsx         # Sticky header with session and notifications
    │   └── ...
    ├── data/                  # Static dataset definitions (including mock devs)
    ├── lib/                   # Utility helpers
    │   ├── auth.ts            # NextAuth options config object
    │   ├── db.ts              # Mongoose caching connection controller
    │   ├── filterStore.ts     # Zustand filter store definition
    │   ├── pusher.ts          # Pusher serverside/clientside init
    │   └── utils.ts           # Classnames compiler / UI formatting helpers
    ├── models/                # Mongoose Schema Definitions
    └── types/                 # Typescript bindings
```

---

## 🗄️ Database Schemas (Mongoose Models)

All database models reside in `src/models/*.ts`. Always import these to perform queries.

### 1. `User` (`src/models/User.ts`)
Holds the primary user profile details used during registration, search, and filtering.
```typescript
export interface IUser extends Document {
  name: string;
  username: string;          // Must be unique (used in profile URLs)
  email: string;             // Unique primary key
  password?: string;
  avatar?: string;           // Image URL
  bio?: string;
  lookingFor?: string;       // Text explaining their target projects/roles
  techStack: string[];       // Arrays of tags (e.g. ["React", "Go"])
  availability: string;      // availability label (e.g. "Full-time", "Part-time", "Hackathons")
  timezone?: string;
  projectType: string[];     // Preferred formats (e.g. ["SaaS", "Hackathon", "Open Source"])
  isRemoteOnly?: boolean;
  level?: string;            // "beginner" | "intermediate" | "advanced" | "expert"
  github?: string;
  linkedin?: string;
  portfolio?: string;
  role: string;              // "user" | "admin"
}
```

### 2. `CollabRequest` (`src/models/CollabRequest.ts`)
Created by users who are building projects and looking for additional developers.
```typescript
export interface ICollabRequest extends Document {
  userId: mongoose.Types.ObjectId;  // Author reference
  title: string;
  projectType: string;               // e.g. "SaaS", "Hackathon"
  description: string;
  stackNeeded: string[];             // Tech stack targets
  roles: string[];                   // e.g. ["Frontend Developer", "Designer"]
  level: string;                     // Experience preference (e.g. "intermediate")
  timeline?: string;
  remoteOnly: boolean;
  contactPreference: string;         // e.g. "ping" or "email"
  status: string;                    // "active" | "completed"
}
```

### 3. `Ping` (`src/models/Ping.ts`)
A virtual invitation or request triggered between developers to initiate collaboration.
```typescript
export interface IPing extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  postId?: mongoose.Types.ObjectId;  // Optional relative recruitment post
  message?: string;                  // Short cover message
  status: string;                    // 'pending' | 'accepted' | 'rejected'
}
```

### 4. `Chat` (`src/models/Chat.ts`) & `Message` (`src/models/Message.ts`)
Direct messaging systems. Each Chat has two participants and updates on messaging.
```typescript
export interface IChat extends Document {
  participants: mongoose.Types.ObjectId[];
  lastMessage?: string;
}
export interface IMessage extends Document {
  chatId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  content: string;
  seen: boolean;
}
```

---

## 🎨 Theme & Utility Settings (Tailwind CSS v4)

Tailwind v4 doesn't support `tailwind.config.js`. Variables are declared in `src/app/globals.css`. 

### Key Custom Class Colors:
- Background: `bg-background-primary` (`#0B1120`) & `bg-background-secondary` (`#111827`)
- Text: `text-text-primary` (`#F9FAFB`) & `text-text-secondary` (`#9CA3AF`)
- Contrast Colors: `bg-accent-cyan` (`#06B6D4`) & `bg-accent-purple` (`#8B5CF6`)
- Status colors: `success` (`#10B981`)

### Custom CSS Layer Utilities:
- `.glass-card`: Semi-transparent background, border, blurred blur filter, and nice rounding. Ideal for dashboard widgets and feed cards.
- `.text-gradient`: Implements gradient coloring across header texts (`from-accent-cyan to-accent-purple`).
- `.glow-cyan` / `.glow-purple`: Applies interactive box-shadow glow effects.

---

## 💡 Developer Guidelines (How to Build & Edit)

When writing new routes, UI elements, or integrating tools:

1. **Database Connections**:
   - In any API handler or server-side operation, you must import and call `connectToDatabase` first:
     ```typescript
     import connectToDatabase from "@/lib/db";
     await connectToDatabase();
     ```

2. **Tailwind Styling**:
   - Use dynamic tailwind classes that reference the `@theme` variables (e.g. `border-border-primary`, `text-text-secondary`, `bg-background-secondary`). Avoid styling with arbitrarily defined colors if a theme token already exists.

3. **React Query Configuration**:
   - The UI uses React Query for fetching backend lists (e.g. `DeveloperFeed.tsx` queries data). Query keys should correctly match the parameters (like `['developers', queryString, pages]`) to benefit from state caching and state tracking.

4. **NextAuth Session Synchronization**:
   - If user edits parameters (e.g., changes display name or bio updates), invoke:
     ```typescript
     const { update } = useSession();
     await update({ name: newName, image: newAvatarUrl });
     ```
   - This fires the session `jwt` callback mapped in `src/lib/auth.ts` under the `"update"` trigger, allowing context values like header avatars and current dashboard names to sync in real-time.

5. **Pusher Real-Time Chat Channels**:
   - Client routes listen to events on private channels (e.g. `chat-${chatId}`) or user pings. Respect key bindings and push states.

---

## 🚥 Local Development Loop

- Run development compiler: `npm run dev`
- Build verification: `npm run build`
- Linter checks: `npm run lint`
