import { NextResponse } from 'next/server';
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";
import { verifyAuth } from "../../../lib/auth";
import { getRedisIfAvailable } from "../../../lib/redis";

// 1. Existing GET method to fetch user list
export async function GET(request: Request) {
  try {
    
    // 1. Verify authentication and get user info from token
    const userAuth = await verifyAuth(request);
    const userId = userAuth.userId;

    // 2. Setup Redis and Cache Key
    const redis = await getRedisIfAvailable();
    const cacheKey = `user:profile:${userId}`;
    
    // 3. Try to fetch data from Redis first
    if (redis) {
      const cachedUser = await redis.get(cacheKey).catch(() => null);
      if (cachedUser) {
        console.log("🚀 Cache Hit: Serving from Redis");
        // print as string format
        // console.log("Redis raw data:", cachedUser); 
        // print as object format
        // console.log("Parsed Object:", JSON.parse(cachedUser));
        return NextResponse.json(JSON.parse(cachedUser), { status: 200 });
      }
    }

    // 4. Cache Miss: Fetch from Database (Prisma)
    console.log("🐢 Cache Miss: Fetching from Database");
    const users = await prisma.user.findMany({
      take: 200,
      orderBy: { id: "desc" } as any,
      where: {
        id: parseInt(userId), // Id from token
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        phone: true,
        city: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      } as any,
    });

    if(users.length){
      if (!users) {
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
        );
      }
    }
    // 5. Store the result in Redis for future requests (Expire in 1 hour)
    if (redis) {
      await redis.set(cacheKey, JSON.stringify(users), {
        EX: 3600, // Expires in 3600 seconds
      }).catch((err) => console.error("Redis Set Error:", err));
    }
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    const status = message === "Unauthorized" || message === "Token revoked" ? 401 : 500;
    return NextResponse.json(
      { success: false, message }, 
      { status }
    );
  }
}

// 2. New POST method to handle Signup (Insert Data)
export async function POST(request: Request) {
  try {
    // Parse the body coming from the frontend signup form
    const body = await request.json();
    const { firstname, lastname, phone, city, password, email, role, status } = body;

    // makes password hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert into database using Prisma
    await prisma.user.create({
      data: {
        firstname,
        lastname,
        phone,
        city,
        email,
        password : hashedPassword,
        role : role || "User",
        status : status || "Active",
      },
    });

    // Return the newly created user
    return NextResponse.json({
      success: true,
      message: "User created successfully!",
    }, { status: 201 });

  } catch (error: any) {
    console.error("Database Error (POST):", error);
    
    // Handle unique constraint error (e.g., email already exists)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, message: "Email already registered" }, 
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to create user" }, 
      { status: 500 }
    );
  }
}