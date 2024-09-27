import { currentUser } from '@/lib/current-user';
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const user = await currentUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }


        const { subredditId } = await req.json()

        // check if user has already subscribed or not
        const subscriptionExists = await db.subscription.findFirst({
            where: {
                subredditId,
                userId: user.id,
            },
        })

        if (!subscriptionExists) {
            return new NextResponse(
                "You've not been subscribed to this subreddit, yet.",
                {
                    status: 400,
                }
            )
        }

        // create subreddit and associate it with the user
        await db.subscription.delete({
            where: {
                userId_subredditId: {
                    subredditId,
                    userId: user.id,
                },
            },
        })

        return new NextResponse(subredditId)
    } catch (error) {
        console.log("CHANNELS_POST", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
