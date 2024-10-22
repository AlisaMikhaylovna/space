import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config'
import { currentUser } from '@/lib/current-user'
import { db } from '@/lib/db'
import { PostFeed } from './post-feed'
import { notFound } from 'next/navigation'

export const CustomFeed = async () => {
    const user = await currentUser()

    // only rendered if session exists, so this will not happen
    if (!user) return notFound()

    const followedCommunities = await db.subscription.findMany({
        where: {
            userId: user.id,
        },
        include: {
            subreddit: true,
        },
    })

    const posts = await db.post.findMany({
        where: {
            subreddit: {
                name: {
                    in: followedCommunities.map((sub) => sub.subreddit.name),
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            votes: true,
            author: true,
            comments: true,
            subreddit: true,
        },
        take: INFINITE_SCROLL_PAGINATION_RESULTS,
    })
    // @ts-ignore
    return <PostFeed initialPosts={posts} />
}


