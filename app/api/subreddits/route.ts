import { NextResponse } from "next/server";
import { MemberRole } from "@prisma/client";

import { currentUser } from "@/lib/current-user";
import { db } from "@/lib/db";

export async function POST(
    req: Request
) {
    try {
        const user = await currentUser();
        const { name } = await req.json();
        const { searchParams } = new URL(req.url);

        const serverId = searchParams.get("serverId");

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!serverId) {
            return new NextResponse("Server ID missing", { status: 400 });
        }

        const subredditExists = await db.subreddit.findFirst({
            where: {
                name,
            },
        })

        if (subredditExists) {
            return new NextResponse('Topic already exists', { status: 409 })
        }

        const server = await db.server.update({
            where: {
                id: serverId,
                members: {
                    some: {
                        userId: user.id,
                        role: {
                            in: [MemberRole.ADMIN, MemberRole.MODERATOR]
                        }
                    }
                }
            },
            data: {
                subreddits: {
                    create: {
                        creatorId: user.id,
                        name
                    }
                }
            }
        });

        const subreddit = await db.subreddit.findUnique({
            where: {
                name
            },
        });

        if (!subreddit) {
            return new NextResponse("Topic not exsits", { status: 400 });
        }

        await db.subscription.create({
            data: {
                userId: user.id,
                subredditId: subreddit.id,
            },
        })

        return NextResponse.json(server);
    } catch (error) {
        console.log("CHANNELS_POST", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
