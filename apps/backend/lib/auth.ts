import jwt from "jsonwebtoken";
import { getRedisIfAvailable } from "./redis";

export type AuthUser = {
  userId: string;
  email: string;
  role?: string;
  jti: string;
  exp?: number;
};

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

export function getBearerToken(request: Request) {
  const header = request.headers.get("authorization") || "";
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

export async function verifyAuth(request: Request): Promise<AuthUser> {
  const token = getBearerToken(request);
  if (!token) throw new Error("Unauthorized");
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const jti = decoded?.jti;
    if (!jti) throw new Error("Unauthorized");

    // If Redis is down (local dev), we skip revocation checks rather than hanging requests.
    const redis = await getRedisIfAvailable();
    if (redis) {
      const revoked = await redis.get(`revoked:${jti}`).catch(() => null);
      if (revoked) throw new Error("Token revoked");
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      jti,
      exp: decoded.exp,
    };
  } catch (error: any) {
    if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
      throw new Error("Unauthorized");
    }
    throw error;
  }
}

export async function revokeToken(token: string) {
  const decoded = jwt.verify(token, JWT_SECRET) as any;
  const jti = decoded?.jti;
  if (!jti) return;

  const exp = typeof decoded?.exp === "number" ? decoded.exp : undefined;
  const now = Math.floor(Date.now() / 1000);
  const ttlSeconds = exp ? Math.max(1, exp - now) : 60 * 60 * 24;

  const redis = await getRedisIfAvailable();
  if (!redis) return;
  await redis.set(`revoked:${jti}`, "1", { EX: ttlSeconds }).catch(() => undefined);
}

