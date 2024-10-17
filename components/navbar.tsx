"use client";

import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { UserButton } from '@/components/userbutton';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

export const Navbar = () => {
    const pathname = usePathname();
    const serverId = pathname?.split('/')[2];
    const session = useSession();

    return (
        <div className='fixed top-0 inset-x-0 h-fit dark:bg-[#2B2D31] bg-[#F2F3F5] z-[10] py-2'>
            <div className='container max-w-7xl h-full mx-auto flex items-center justify-between'>
                {session.data?.user && (
                    <div className="flex gap-x-4 items-center">
                        <div className={cn({ "": pathname?.includes("channels") })}>
                            <Link href={`/servers/${serverId}/channels`}>Message</Link>
                        </div>
                        <div className={cn({ "": pathname?.includes("topics") })}>
                            <Link href={`/servers/${serverId}/topics`}>Topic</Link>
                        </div>
                        <div className={cn({ "": pathname?.includes("blog") })}>
                            <Link href={`/servers/${serverId}/blog`}>Blog</Link>
                        </div>
                    </div>
                )
                }
                <div >
                    {session.data?.user ? (
                        <UserButton user={session.data?.user} />
                    ) : (
                        <Link href='/sign-in' className={buttonVariants()}>
                            Sign In
                        </Link>
                    )}
                </div>
            </div >
        </div >
    );
};
