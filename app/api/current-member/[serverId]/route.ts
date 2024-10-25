import { NextResponse } from "next/server";
import { currentUser } from "@/lib/current-user";
import { db } from "@/lib/db";

export async function GET(req: Request, { params }: { params: { serverId: string } }) {
    try {
        const user = await currentUser();

        const serverId = params.serverId;

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!serverId) {
            return new NextResponse("Server ID missing", { status: 400 });
        }

        const member = await db.member.findFirst({
            where: {
                serverId,
                userId: user.id,
            },
            include: {
                user: true,
            },
        });

        return NextResponse.json(member);
    } catch (error) {
        console.log("[MEMBER_ID_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
