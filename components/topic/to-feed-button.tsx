'use client'

import { ChevronLeft } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { buttonVariants } from '@/components/ui/button'

export const ToFeedButton = () => {

    const pathname = usePathname();

    const splitPath = pathname!.split('/');

    const getSubredditPath = (pathname: string) => {

        const initialPath = `${splitPath[1]}/${splitPath[2]}/${splitPath[3]}`;

        if (splitPath.length === 5) return initialPath
        else if (splitPath.length > 5) return `/${splitPath[1]}/${splitPath[2]}/${splitPath[3]}/${splitPath[4]}`;

        else return initialPath
    }

    const subredditPath = getSubredditPath(pathname!)

    return (
        <a href={subredditPath} className={buttonVariants({ variant: 'ghost' })}>
            <ChevronLeft className='h-4 w-4 mr-1' />
            Back
        </a>
    )
}



