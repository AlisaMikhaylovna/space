import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { UserButton } from '@/components/userbutton';
import { MobileToggle } from '@/components/mobile-toggle';
import { currentUser } from '@/lib/current-user';

interface NavbarProps {
    serverId: string;
}

export const Navbar = async ({ serverId }: NavbarProps) => {
    const user = await currentUser();

    return (
        <div className=' top-0 left-0  w-full  dark:bg-[#2B2D31] bg-[#F2F3F5] py-2'>
            <div className='container max-w-7xl mx-auto flex items-center justify-between'>
                <MobileToggle serverId={serverId} />
                <div className='flex gap-4 items-center justify-center flex-grow'>
                    <Link className="transition-colors duration-200" href={`/servers/${serverId}/channels`}>Message</Link>
                    <Link className="transition-colors duration-200" href={`/servers/${serverId}/topics`}>Topic</Link>
                    <Link className="transition-colors duration-200" href={`/servers/${serverId}/blog`}>Article</Link>
                </div>
                <div className="flex items-center ml-auto">
                    {user ? (
                        <UserButton user={user} />
                    ) : (
                        <Link href='/sign-in' className={buttonVariants()}>
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};
