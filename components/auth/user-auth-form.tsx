'use client'

import { cn } from '@/lib/utils';
import { signIn } from 'next-auth/react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FaGithub } from "react-icons/fa";


interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> { }

export const UserAuthForm = ({ className, ...props }: UserAuthFormProps) => {
    const { toast } = useToast()
    const [isLoading, setIsLoading] = React.useState<boolean>(false)

    const loginWithGithub = async () => {
        setIsLoading(true)

        try {
            await signIn('github')
        } catch (error) {
            toast({
                title: 'Error',
                description: 'There was an error logging in with Github',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={cn('flex justify-center', className)} {...props}>
            <Button
                type='button'
                size="lg" className="w-full" variant="outline"
                onClick={loginWithGithub}
                disabled={isLoading}>
                <FaGithub className="h-5 w-5" />
            </Button>
        </div>
    )
}


