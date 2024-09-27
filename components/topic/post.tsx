'use client'

import { formatTimeToNow } from '@/lib/utils'
import { User, Vote, Post } from '@prisma/client'
import { MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { useRef } from 'react'
import { usePathname } from 'next/navigation'

type PartialVote = Pick<Vote, 'type'>

interface SinglePostProps {
    post: Post & {
        author: User
        votes: Vote[]
    }
    votesAmt: number
    subredditName: string
    currentVote?: PartialVote
    commentAmt: number
}

export const SinglePost = ({
    post,
    votesAmt: _votesAmt,
    currentVote: _currentVote,
    subredditName,
    commentAmt,
}: SinglePostProps) => {
    const pRef = useRef<HTMLParagraphElement>(null)

    const pathname = usePathname();

    const serverId = pathname?.split("/")[1];

    return (
        <div className='rounded-md bg-white shadow'>
            <div className='px-6 py-4 flex justify-between'>


                <div className='w-0 flex-1'>
                    <div className='max-h-40 mt-1 text-xs text-gray-500'>
                        {subredditName ? (
                            <>
                                <a
                                    className='underline text-zinc-900 text-sm underline-offset-2'
                                    href={`/servers/${serverId}/topics/${subredditName}`}>
                                    r/{subredditName}
                                </a>
                                <span className='px-1'>•</span>
                            </>
                        ) : null}
                        <span>Posted by u/{post.author.username}</span>{' '}
                        {formatTimeToNow(new Date(post.createdAt))}
                    </div>
                    <a href={`/servers/${serverId}/topics/${subredditName}/post/${post.id}`}>
                        <h1 className='text-lg font-semibold py-2 leading-6 text-gray-900'>
                            {post.title}
                        </h1>
                    </a>

                    <div
                        className='relative text-sm max-h-40 w-full overflow-clip'
                        ref={pRef}>

                        {pRef.current?.clientHeight === 160 ? (
                            // blur bottom if content is too long
                            <div className='absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-white to-transparent'></div>
                        ) : null}
                    </div>
                </div>
            </div>

            <div className='bg-gray-50 z-20 text-sm px-4 py-4 sm:px-6'>
                <Link
                    href={`/servers/${serverId}/topics/${subredditName}/post/${post.id}`}
                    className='w-fit flex items-center gap-2'>
                    <MessageSquare className='h-4 w-4' /> {commentAmt} comments
                </Link>
            </div>
        </div>
    )
}
