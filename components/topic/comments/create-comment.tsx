'use client'

import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'

import { useCustomToasts } from '@/hooks/use-custom-toasts'
import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { z } from 'zod'

interface CreateCommentProps {
    postId: string
    replyToId?: string
}

const commentPrisma = z.object({
    postId: z.string(),
    text: z.string(),
    replyToId: z.string().optional()
})

type CommentRequest = z.infer<typeof commentPrisma>

export const CreateComment = ({ postId, replyToId }: CreateCommentProps) => {
    const [input, setInput] = useState<string>('')
    const router = useRouter()
    const { loginToast } = useCustomToasts()

    const { mutate: comment } = useMutation({
        mutationFn: async ({ postId, text, replyToId }: CommentRequest) => {
            const payload: CommentRequest = { postId, text, replyToId }

            const { data } = await axios.patch(
                `/api/subreddits/post/comment/`,
                payload
            )
            return data
        },

        onError: (err) => {
            if (err instanceof AxiosError) {
                if (err.response?.status === 401) {
                    return loginToast()
                }
            }

            return toast({
                title: 'Something went wrong.',
                description: "Comment wasn't created successfully. Please try again.",
                variant: 'destructive',
            })
        },
        onSuccess: () => {
            router.refresh()
            setInput('')
        },
    })

    return (
        <div className='grid w-full gap-1.5'>
            <Label htmlFor='comment'>Your comment</Label>
            <div className='mt-2'>
                <Textarea
                    id='comment'
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={1}
                    placeholder='What are your thoughts?'
                />

                <div className='mt-2 flex justify-end'>
                    <Button
                        disabled={input.length === 0}
                        onClick={() => comment({ postId, text: input, replyToId })}>
                        Post
                    </Button>
                </div>
            </div>
        </div>
    )
}


