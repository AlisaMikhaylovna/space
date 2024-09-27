import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PATCH(req: Request) {
    try {
        const { commentId, voteType } = await req.json()

        const session = await getAuthSession()

        if (!session?.user) {
            return new Response('Unauthorized', { status: 401 })
        }

        // check if user has already voted on this post
        const existingVote = await db.commentVote.findFirst({
            where: {
                userId: session.user.id,
                commentId,
            },
        })

        if (existingVote) {
            // if vote type is the same as existing vote, delete the vote
            if (existingVote.type === voteType) {
                await db.commentVote.delete({
                    where: {
                        userId_commentId: {
                            commentId,
                            userId: session.user.id,
                        },
                    },
                })
                return new Response('OK')
            } else {
                // if vote type is different, update the vote
                await db.commentVote.update({
                    where: {
                        userId_commentId: {
                            commentId,
                            userId: session.user.id,
                        },
                    },
                    data: {
                        type: voteType,
                    },
                })
                return new Response('OK')
            }
        }

        // if no existing vote, create a new vote
        await db.commentVote.create({
            data: {
                type: voteType,
                userId: session.user.id,
                commentId,
            },
        })

        return new Response('OK')
    } catch (error) {
        return new Response(
            'Could not post to subreddit at this time. Please try later',
            { status: 500 }
        )
    }
}
