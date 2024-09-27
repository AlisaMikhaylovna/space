import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const { title, content, subredditId } = await req.json()

        const session = await getAuthSession()

        if (!session?.user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        // verify user is subscribed to passed subreddit id
        const subscription = await db.subscription.findFirst({
            where: {
                subredditId,
                userId: session.user.id,
            },
        })

        if (!subscription) {
            return new NextResponse('Subscribe to post', { status: 403 })
        }

        await db.post.create({
            data: {
                title,
                content,
                authorId: session.user.id,
                subredditId,
            },
        })

        return new NextResponse('OK')
    } catch (error) {
        return new NextResponse(
            'Could not post to subreddit at this time. Please try later',
            { status: 500 }
        )
    }
}
