import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { UserButton } from '@/components/userbutton';
import { cn } from '@/lib/utils';
import { MobileToggle } from '@/components/mobile-toggle';
import { currentUser } from '@/lib/current-user';

interface NavbarProps {
    serverId: string;
}

export const Navbar = async ({ serverId }: NavbarProps) => {

    const user = await currentUser();

    return (
        <div className='fixed top-0 z-10 w-full h-fit dark:bg-[#2B2D31] bg-[#F2F3F5] py-2'>
            <div className='container max-w-7xl mx-auto flex items-center justify-between'>
                <MobileToggle serverId={serverId} />
                <div className='flex gap-4 items-center justify-center flex-grow md:mr-96'>
                    <Link className="transition-colors duration-200" href={`/servers/${serverId}/channels`}>Message</Link>
                    <Link className="transition-colors duration-200" href={`/servers/${serverId}/topics`}>Topic</Link>
                    <Link className="transition-colors duration-200" href={`/servers/${serverId}/blog`}>Blog</Link>
                </div>
                <div className='ml-auto'>
                    {user ? (
                        <UserButton user={user} />
                    ) : (
                        <Link href='/sign-in' className={buttonVariants()}>
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </div >
    );
};
