import { createClient } from "redis";

declare global {
  // eslint-disable-next-line no-var
  var __redisClient: ReturnType<typeof createClient> | undefined;
}

export function getRedis() {
  const url = process.env.REDIS_URL || "redis://localhost:6379";
  const client =
    globalThis.__redisClient ||
    createClient({
      url,
    });

  if (!globalThis.__redisClient) {
    globalThis.__redisClient = client;
  }

  return client;
}

export async function getRedisIfAvailable(timeoutMs = 300) {
  const client = getRedis();
  if (client.isOpen) return client;

  try {
    await Promise.race([
      client.connect(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Redis connect timeout")), timeoutMs)
      ),
    ]);
    return client;
  } catch {
    return null;
  }
}

