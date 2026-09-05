/**
 * Environment variable sanitizer for Next.js build-time and runtime evaluation.
 * Prevents ERR_INVALID_URL crashes during Vercel static page prerendering (e.g., /_not-found, /about)
 * when NEXTAUTH_URL, NEXTAUTH_URL_INTERNAL, or VERCEL_URL is missing, empty, surrounded by quotes,
 * contains whitespace, or is malformed.
 */

function sanitizeUrlString(urlStr: unknown): string | null {
  if (typeof urlStr !== "string") return null;

  // 1. Trim whitespace, newlines, and surrounding quotes (single or double)
  let cleaned = urlStr.trim().replace(/^["']|["']$/g, "").trim();
  if (!cleaned) return null;

  // 2. Add https:// protocol if scheme is missing
  if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://")) {
    cleaned = `https://${cleaned}`;
  }

  // 3. Test if URL constructor accepts it
  try {
    const parsed = new URL(cleaned);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.origin; // Normalized valid origin without trailing slash
    }
  } catch {
    // Parsing failed
  }

  return null;
}

export function sanitizeEnv() {
  // Sanitize NEXTAUTH_URL
  const validNextAuthUrl = sanitizeUrlString(process.env.NEXTAUTH_URL);
  
  if (validNextAuthUrl) {
    process.env.NEXTAUTH_URL = validNextAuthUrl;
  } else {
    // Try VERCEL_URL fallback
    const validVercelUrl = sanitizeUrlString(process.env.VERCEL_URL);
    if (validVercelUrl) {
      process.env.NEXTAUTH_URL = validVercelUrl;
    } else {
      // Ultimate safe fallback
      process.env.NEXTAUTH_URL = "http://localhost:3000";
    }
  }

  // Sanitize NEXTAUTH_URL_INTERNAL if present
  if (process.env.NEXTAUTH_URL_INTERNAL) {
    const validInternal = sanitizeUrlString(process.env.NEXTAUTH_URL_INTERNAL);
    if (validInternal) {
      process.env.NEXTAUTH_URL_INTERNAL = validInternal;
    } else {
      delete process.env.NEXTAUTH_URL_INTERNAL;
    }
  }

  // Ensure NEXTAUTH_SECRET is set to prevent NextAuth warnings or errors
  if (!process.env.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET.trim() === "") {
    process.env.NEXTAUTH_SECRET = "build-time-fallback-secret-key-min-32-chars";
  }
}

// Execute immediately when module is imported
sanitizeEnv();
