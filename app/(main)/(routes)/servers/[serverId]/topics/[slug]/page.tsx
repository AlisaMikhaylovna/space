import { CreatePost } from '@/components/topic/create-post'
import { PostFeed } from '@/components/topic/post-feed'
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config'
import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { ExtendedPost } from '@/types'
import { notFound } from 'next/navigation'

interface PageProps {
    params: {
        slug: string
    }
}

const TopicPage = async ({ params }: PageProps) => {
    const { slug } = params

    const session = await getAuthSession()

    const subreddit = await db.subreddit.findFirst({
        where: { name: slug },
        include: {
            posts: {
                include: {
                    author: true,
                    votes: true,
                    comments: true,
                    subreddit: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                take: INFINITE_SCROLL_PAGINATION_RESULTS,
            },
        },
    });
    if (!subreddit) return notFound();
    // @ts-ignore
    const posts: ExtendedPost[] = subreddit.posts.map(post => ({
        ...post,
        subreddit: post.subreddit,
        votes: post.votes || [],
        author: post.author,
        comments: post.comments || [],
    }));

    return (
        <>
            <h1 className='font-bold text-3xl md:text-4xl h-14'>
                {subreddit.name}
            </h1>
            <CreatePost session={session} />
            <PostFeed initialPosts={posts} subredditName={subreddit.name} />
        </>
    )
}

export default TopicPage