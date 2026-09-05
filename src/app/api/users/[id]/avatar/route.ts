import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || id === "undefined" || id === "null") {
      return getFallbackSvgAvatar();
    }

    await connectToDatabase();
    const user = await User.findById(id).select("avatar name").lean();

    if (!user || !user.avatar) {
      return getFallbackSvgAvatar(user?.name);
    }

    const avatar = user.avatar as string;

    // Handle Base64 Data URLs (data:image/jpeg;base64,...)
    if (avatar.startsWith("data:")) {
      const match = avatar.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (match) {
        const mimeType = match[1];
        const base64Data = match[2];
        const imageBuffer = Buffer.from(base64Data, "base64");

        return new NextResponse(imageBuffer, {
          headers: {
            "Content-Type": mimeType,
            "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
          },
        });
      }
    }

    // Handle HTTP/HTTPS URLs (e.g. gravatar / github / external URLs)
    if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
      return NextResponse.redirect(avatar);
    }

    return getFallbackSvgAvatar(user?.name);
  } catch (error) {
    console.error("Error serving user avatar:", error);
    return getFallbackSvgAvatar();
  }
}

function getFallbackSvgAvatar(name?: string) {
  const initial = (name ? name.charAt(0) : "D").toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
    <rect width="128" height="128" fill="#11111A"/>
    <circle cx="64" cy="64" r="60" fill="url(#grad)" stroke="#00E5FF" stroke-width="2"/>
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#00E5FF" stop-opacity="0.2"/>
        <stop offset="100%" stop-color="#FF2BD6" stop-opacity="0.2"/>
      </linearGradient>
    </defs>
    <text x="64" y="78" font-family="sans-serif" font-size="52" font-weight="bold" fill="#00E5FF" text-anchor="middle">${initial}</text>
  </svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
