import { UserAuthForm } from '@/components/auth/user-auth-form'
import Link from 'next/link'

export const SignUp = () => {
    return (
        <div className='container mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]'>
            <div className='flex flex-col space-y-2 text-center'>
                <h1 className='text-2xl font-semibold tracking-tight'>Sign Up</h1>
                <p className='text-sm max-w-xs mx-auto'>
                    By continuing, you are setting up a Space account and agree to our
                    User Agreement and Privacy Policy.
                </p>
            </div>
            <UserAuthForm />
            <p className='px-8 text-center text-sm text-muted-foreground'>
                Already have a Space account?{' '}
                <Link
                    href='/sign-in'
                    className='hover:text-brand text-sm underline underline-offset-4'>
                    Sign in
                </Link>
            </p>
        </div>
    )
}


