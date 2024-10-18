import { redirect } from 'next/navigation'

import { UserNameForm } from '@/components/user-name-form'
import { authOptions, getAuthSession } from '@/lib/auth'
import { currentUser } from '@/lib/current-user'

export default async function SettingsPage() {
    const user = await currentUser();

    if (!user) {
        redirect("/")
    }

    return (
        <div className='max-w-4xl mx-auto py-12'>
            <div className='grid items-start gap-8'>
                <h1 className='font-bold text-3xl md:text-4xl'>Settings</h1>

                <div className='grid gap-10'>
                    <UserNameForm
                        user={{
                            id: user.id,
                            name: user.name || '',
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
