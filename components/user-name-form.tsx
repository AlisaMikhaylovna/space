'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { User } from '@prisma/client'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'

interface UserNameFormProps extends React.HTMLAttributes<HTMLFormElement> {
    user: Pick<User, 'id' | 'name'>
}

const nameVPrisma = z.object({
    name: z
        .string()
        .min(3)
        .max(32)
        .regex(/^[a-zA-Z0-9_]+$/),
})

type FormData = z.infer<typeof nameVPrisma>

export function UserNameForm({ user, className, ...props }: UserNameFormProps) {
    const router = useRouter()
    const {
        handleSubmit,
        register,
        formState,
    } = useForm<FormData>({
        resolver: zodResolver(nameVPrisma),
        defaultValues: {
            name: user?.name || '',
        },
    })

    const isLoading = formState.isSubmitting;

    const { mutate: updateUsername, isPending } = useMutation({
        mutationFn: async ({ name }: FormData) => {
            const payload: FormData = { name }

            const { data } = await axios.patch(`/api/name/`, payload)
            return data
        },
        onError: (err) => {
            if (err instanceof AxiosError) {
                if (err.response?.status === 409) {
                    return toast({
                        title: 'Username already taken.',
                        description: 'Please choose another name.',
                        variant: 'destructive',
                    })
                }
            }

            return toast({
                title: 'Something went wrong.',
                description: 'Your name was not updated. Please try again.',
                variant: 'destructive',
            })
        },
        onSuccess: () => {
            toast({
                description: 'Your name has been updated.',
            })
            router.refresh()
        },
    })

    return (
        <form
            className={cn(className)}
            onSubmit={handleSubmit((e) => updateUsername(e))}
            {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>Your name</CardTitle>
                    <CardDescription>
                        Please enter a display name you are comfortable with.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='relative grid gap-1'>
                        <div className='absolute top-0 left-0 w-8 h-10 grid place-items-center'>
                            <span className='text-sm text-zinc-400'>/n</span>
                        </div> <div className='absolute top-0 left-0 w-8 h-10 grid place-items-center'>
                            <span className='text-sm text-zinc-400'> </span>
                        </div>
                        <Label className='sr-only' htmlFor='name'>
                            Name
                        </Label>
                        <Input
                            id='name'
                            className='w-[400px] pl-6'
                            size={32}
                            disabled={isLoading}
                            {...register('name')}
                        />
                        {formState.errors?.name && (
                            <p className='px-1 text-xs text-red-600'>{formState.errors.name.message}</p>
                        )}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button disabled={isLoading}>Change name</Button>
                </CardFooter>
            </Card>
        </form>
    )
}
