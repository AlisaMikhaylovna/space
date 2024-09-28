import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { UserAccountNav } from '@/components/user-account-nav'
import { currentUser } from '@/lib/current-user'

export const Navbar = async () => {
    const user = await currentUser();
    return (
        <div className='fixed top-0 inset-x-0 h-fit bg-zinc-100 border-b border-zinc-300 z-[10] py-2'>
            <div className='container max-w-7xl h-full mx-auto flex items-center justify-between gap-2'>
                {/* actions */}
                {user ? (
                    <UserAccountNav user={user} />
                ) : (
                    <Link href='/sign-in' className={buttonVariants()}>
                        Sign In
                    </Link>
                )}
            </div>
        </div>
    )
}


