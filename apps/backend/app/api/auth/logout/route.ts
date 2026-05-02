import { NextResponse } from "next/server";
import { getBearerToken, revokeToken, verifyAuth } from "../../../../lib/auth";
import { getRedisIfAvailable } from "../../../../lib/redis";

export async function POST(request: Request) {
  // Token is stored in client localStorage, so client still clears it.
  // Additionally, we revoke the JWT (blacklist by jti) so the token can't be reused.
  const token = getBearerToken(request);
  if (token) {
    try {
      // 1. Verify token to get user info before revoking it
      // We need the userId to clear their specific cache keys
      const userAuth = await verifyAuth(request).catch(() => null);

      // 2. Revoke the token (Blacklist)
      await revokeToken(token);

      // 3. Clear all Redis data for this specific user
      if (userAuth?.userId) {
        const redis = await getRedisIfAvailable();
        if (redis) {
          const userId = userAuth.userId;
          
          // Define all keys that belong to this user
          const keysToDelete = [
            `user:profile:${userId}`,
            // `user:courses:${userId}`,
            // `user:settings:${userId}`,
            // Add any other dynamic keys you've created
          ];

          // Execute delete for all keys
          await Promise.all(
            keysToDelete.map(key => redis.del(key).catch(() => null))
          );
          console.log(`🧹 Cache cleared for user: ${userId}`);
        }
      }
    } catch (error) {
      console.error("Logout cleanup error:", error);
      // ignore errors; client-side cleanup is still effective
    }
  }

  return NextResponse.json(
    { success: true, message: "Logged out successfully" }, 
    { status: 200 }
  );
}

