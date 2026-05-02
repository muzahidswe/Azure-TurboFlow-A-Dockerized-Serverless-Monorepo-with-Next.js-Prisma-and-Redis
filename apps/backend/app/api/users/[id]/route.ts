import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcryptjs";
import { verifyAuth } from "../../../../lib/auth";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAuth(request);

    const { id } = await context.params;
    const body = await request.json();

    const data: any = {};
    if (typeof body.firstname === "string") data.firstname = body.firstname;
    if (typeof body.lastname === "string") data.lastname = body.lastname;
    if (typeof body.email === "string") data.email = body.email;
    if (typeof body.phone === "string") data.phone = body.phone;
    if (typeof body.city === "string") data.city = body.city;
    if (typeof body.role === "string") data.role = body.role;
    if (typeof body.status === "string") data.status = body.status;

    if (typeof body.password === "string" && body.password.length > 0) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(body.password, salt);
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
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

    return NextResponse.json(
      { success: true, message: "User updated successfully!", user: updated },
      { status: 200 }
    );
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }
    if (error?.code === "P2002") {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 400 }
      );
    }
    const message = error instanceof Error ? error.message : "Internal Server Error";
    const status = message === "Unauthorized" || message === "Token revoked" ? 401 : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}

