// src/app/api/users/seed/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const seedSecret = process.env.SEED_SECRET;
  const provided = req.headers.get("x-seed-secret") || "";

  if (process.env.NODE_ENV !== "development" && (!seedSecret || provided !== seedSecret)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await dbConnect();

    const body = (await req.json().catch(() => ({}))) as {
      password?: string;
      users?: Array<Record<string, any>>;
    };

    const plainPassword = body.password ?? "password123";
    const hashed = await bcrypt.hash(plainPassword, 10);

    const users = body.users ?? [
      { email: "manager@example.com", name: "Manager", role: "officeManager", employeeId: "EMP-MGR-001" },
      { email: "receptionist@example.com", name: "Receptionist", role: "receptionist", employeeId: "EMP-REC-001" },
      { email: "doctor@example.com", name: "Doctor", role: "doctor", employeeId: "EMP-DR-001" },
    ];

    for (const u of users) {
      await User.findOneAndUpdate(
        { email: u.email },
        { $set: { ...u, password: hashed } },
        { upsert: true }
      );
    }

    return NextResponse.json({ ok: true, upserted: users.map((u) => u.email) });
  } catch (err) {
    console.error("seed error:", err);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}