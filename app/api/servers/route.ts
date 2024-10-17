import { v4 as uuidv4 } from "uuid";
import { NextResponse } from "next/server";
import { MemberRole } from "@prisma/client";

import { currentUser } from "@/lib/current-user";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const { name } = await req.json();
        const user = await currentUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const server = await db.server.create({
            data: {
                userId: user.id,
                name,
                inviteCode: uuidv4(),
                channels: {
                    create: [
                        { name: "general", userId: user.id }
                    ]
                },
                members: {
                    create: [
                        { userId: user.id, role: MemberRole.ADMIN }
                    ]
                }
            }
        });

        return NextResponse.json(server);
    } catch (error) {
        console.log("[SERVERS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}