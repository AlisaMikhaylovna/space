'use client'

import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config'
import { ExtendedPost } from '@/types'
import { useIntersection } from "@mantine/hooks"
import { useInfiniteQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Loader2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { SinglePost } from '@/components/topic/post'
import { useSession } from 'next-auth/react'

interface PostFeedProps {
    initialPosts: ExtendedPost[];
    subredditName?: string;
}

export const PostFeed = ({ initialPosts, subredditName }: PostFeedProps) => {
    const lastPostRef = useRef<HTMLElement>(null)
    const { ref, entry } = useIntersection({
        root: lastPostRef.current,
        threshold: 1,
    })
    const session = useSession();

    const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery<ExtendedPost[], Error>({
        queryKey: ['infinite-query'],
        queryFn: async ({ pageParam = 1 }) => {
            const { data } = await axios.get(`/api/posts?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}&page=${pageParam}` +
                (!!subredditName ? `&subredditName=${subredditName}` : ''));
            return data as ExtendedPost[];
        },
        getNextPageParam: (_lastPage, allPages) => allPages.length + 1,
        initialPageParam: 1,
        initialData: {
            pages: [initialPosts],
            pageParams: [1],
        }
    });


    useEffect(() => {
        if (entry?.isIntersecting) {
            fetchNextPage()
        }
    }, [entry, fetchNextPage])

    const posts = data?.pages.flatMap((page) => page) ?? initialPosts

    return (
        <ul className='flex flex-col col-span-2 space-y-6'>
            {posts.map((post, index) => {
                const votesAmt = post.votes.reduce((acc, vote) => {
                    if (vote.type === 'UP') return acc + 1
                    if (vote.type === 'DOWN') return acc - 1
                    return acc
                }, 0)

                const currentVote = post.votes.find(
                    (vote) => vote.userId === session.data?.user.id
                )

                if (index === posts.length - 1) {
                    // Add a ref to the last post in the list
                    return (
                        <li key={post.id} ref={ref}>
                            <SinglePost
                                post={post}
                                commentAmt={post.comments.length}
                                subredditName={post.subreddit.name}
                                votesAmt={votesAmt}
                                currentVote={currentVote}
                            />
                        </li>
                    )
                } else {
                    return (
                        <li key={post.id} >
                            <SinglePost
                                post={post}
                                commentAmt={post.comments.length}
                                subredditName={post.subreddit.name}
                                votesAmt={votesAmt}
                                currentVote={currentVote}
                            />
                        </li>
                    )
                }
            })}

            {isFetchingNextPage && (
                <li className='flex justify-center'>
                    <Loader2 className='w-6 h-6 text-zinc-500 animate-spin' />
                </li>
            )}
        </ul>
    )
}

