const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

// Read .env
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/MONGODB_URI=(.+)/);
const uri = match ? match[1].trim() : 'mongodb://127.0.0.1:27017/devroommate';

const developers = [
  {
    name: "Alex Dev",
    role: "Frontend Engineer",
    stack: ["React", "Next.js", "Tailwind"],
    availability: "Part-time",
    timezone: "UTC-5 (EST)",
    lookingFor: "Fullstack SaaS Project",
    avatar: "https://i.pravatar.cc/150?img=11",
  },
  {
    name: "Sarah Chen",
    role: "AI/ML Engineer",
    stack: ["Python", "PyTorch", "FastAPI"],
    availability: "Hackathons",
    timezone: "UTC+8 (SGT)",
    lookingFor: "AI Startup Co-founder",
    avatar: "https://i.pravatar.cc/150?img=47",
  },
  {
    name: "David Kim",
    role: "Backend Developer",
    stack: ["Node.js", "PostgreSQL", "Go"],
    availability: "Full-time",
    timezone: "UTC+1 (CET)",
    lookingFor: "Open Source Contributor",
    avatar: "https://i.pravatar.cc/150?img=33",
  },
  {
    name: "Elena Rodriguez",
    role: "UI/UX Designer",
    stack: ["Figma", "Framer", "React"],
    availability: "Part-time",
    timezone: "UTC-8 (PST)",
    lookingFor: "Frontend Developer Partner",
    avatar: "https://i.pravatar.cc/150?img=9",
  },
  {
    name: "Marcus Johnson",
    role: "Smart Contract Dev",
    stack: ["Solidity", "Hardhat", "React"],
    availability: "Contract",
    timezone: "UTC+0 (GMT)",
    lookingFor: "DeFi Protocol Builders",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
  {
    name: "Li Wei",
    role: "Fullstack Developer",
    stack: ["Vue", "Nuxt", "Django"],
    availability: "Weekends",
    timezone: "UTC+8 (CST)",
    lookingFor: "Indie Hacker Project",
    avatar: "https://i.pravatar.cc/150?img=68",
  }
];

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  avatar: { type: String },
  bio: { type: String },
  lookingFor: { type: String },
  techStack: [{ type: String }],
  availability: { type: String, default: "Part-time" },
  timezone: { type: String },
  projectType: [{ type: String }],
  isRemoteOnly: { type: Boolean, default: false },
  level: { type: String, default: "intermediate" },
  github: { type: String },
  linkedin: { type: String },
  portfolio: { type: String },
  role: { type: String, default: "user" },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seed() {
  await mongoose.connect(uri);
  console.log('Connected to DB for seeding...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const usersToInsert = developers.map((dev, i) => {
    const projectTypes = ["Startup MVP"];
    if (dev.availability === "Hackathons") projectTypes.push("Hackathon");
    if (dev.lookingFor.includes("Open Source")) projectTypes.push("Open Source");
    if (dev.lookingFor.includes("SaaS")) projectTypes.push("SaaS");

    return {
      name: dev.name,
      username: dev.name.toLowerCase().replace(/ /g, '') + i,
      email: `${dev.name.toLowerCase().replace(/ /g, '')}@example.com`,
      password: hashedPassword,
      avatar: dev.avatar,
      bio: `Looking for: ${dev.lookingFor}`,
      techStack: dev.stack,
      availability: dev.availability,
      timezone: dev.timezone,
      projectType: projectTypes,
      isRemoteOnly: i % 2 === 0,
      level: i % 3 === 0 ? "beginner" : "intermediate",
      role: "user"
    };
  });

  await User.deleteMany({ email: { $in: usersToInsert.map(u => u.email) } });
  const result = await User.insertMany(usersToInsert);
  console.log(`Successfully seeded ${result.length} users into MongoDB!`);
  
  const count = await User.countDocuments();
  console.log(`Total users in collection: ${count}`);

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed Error:', err);
  process.exit(1);
});
