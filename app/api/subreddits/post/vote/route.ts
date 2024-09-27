import { currentUser } from '@/lib/current-user'
import { db } from '@/lib/db'
import { redis } from '@/lib/redis'
import { CachedPost } from '@/types'
import { NextResponse } from 'next/server'

const CACHE_AFTER_UPVOTES = 1

export async function PATCH(req: Request) {
    try {
        const { postId, voteType } = await req.json()

        const user = await currentUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        // check if user has already voted on this post
        const existingVote = await db.vote.findFirst({
            where: {
                userId: user.id,
                postId,
            },
        })

        const post = await db.post.findUnique({
            where: {
                id: postId,
            },
            include: {
                author: true,
                votes: true,
            },
        })

        if (!post) {
            return new NextResponse('Post not found', { status: 404 })
        }

        if (existingVote) {
            // if vote type is the same as existing vote, delete the vote
            if (existingVote.type === voteType) {
                await db.vote.delete({
                    where: {
                        userId_postId: {
                            postId,
                            userId: user.id,
                        },
                    },
                })

                // Recount the votes
                const votesAmt = post.votes.reduce((acc, vote) => {
                    if (vote.type === 'UP') return acc + 1
                    if (vote.type === 'DOWN') return acc - 1
                    return acc
                }, 0)

                if (votesAmt >= CACHE_AFTER_UPVOTES) {
                    const cachePayload: CachedPost = {
                        authorUsername: post.author.username ?? '',
                        content: JSON.stringify(post.content),
                        id: post.id,
                        title: post.title,
                        currentVote: null,
                        createdAt: post.createdAt,
                    }

                    await redis.hset(`post:${postId}`, cachePayload) // Store the post data as a hash
                }

                return new NextResponse('OK')
            }

            // if vote type is different, update the vote
            await db.vote.update({
                where: {
                    userId_postId: {
                        postId,
                        userId: user.id,
                    },
                },
                data: {
                    type: voteType,
                },
            })

            // Recount the votes
            const votesAmt = post.votes.reduce((acc, vote) => {
                if (vote.type === 'UP') return acc + 1
                if (vote.type === 'DOWN') return acc - 1
                return acc
            }, 0)

            if (votesAmt >= CACHE_AFTER_UPVOTES) {
                const cachePayload: CachedPost = {
                    authorUsername: post.author.username ?? '',
                    content: JSON.stringify(post.content),
                    id: post.id,
                    title: post.title,
                    currentVote: voteType,
                    createdAt: post.createdAt,
                }

                await redis.hset(`post:${postId}`, cachePayload) // Store the post data as a hash
            }

            return new NextResponse('OK')
        }

        // if no existing vote, create a new vote
        await db.vote.create({
            data: {
                type: voteType,
                userId: user.id,
                postId,
            },
        })

        // Recount the votes
        const votesAmt = post.votes.reduce((acc, vote) => {
            if (vote.type === 'UP') return acc + 1
            if (vote.type === 'DOWN') return acc - 1
            return acc
        }, 0)

        if (votesAmt >= CACHE_AFTER_UPVOTES) {
            const cachePayload: CachedPost = {
                authorUsername: post.author.username ?? '',
                content: JSON.stringify(post.content),
                id: post.id,
                title: post.title,
                currentVote: voteType,
                createdAt: post.createdAt,
            }

            await redis.hset(`post:${postId}`, cachePayload) // Store the post data as a hash
        }

        return new NextResponse('OK')
    } catch (error) {
        return new NextResponse(
            'Could not post to subreddit at this time. Please try later',
            { status: 500 }
        )
    }
}
