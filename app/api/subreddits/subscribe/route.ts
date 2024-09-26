import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const session = await getAuthSession()

        if (!session?.user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { subredditId } = await req.json();

        // check if user has already subscribed to subreddit
        const subscriptionExists = await db.subscription.findFirst({
            where: {
                subredditId,
                userId: session.user.id,
            },
        })

        if (subscriptionExists) {
            return new NextResponse("You've already subscribed to this subreddit", {
                status: 400,
            })
        }

        // create subreddit and associate it with the user
        await db.subscription.create({
            data: {
                subredditId,
                userId: session.user.id,
            },
        })

        return new NextResponse(subredditId)
    } catch (error) {
        console.log("CHANNELS_POST", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
