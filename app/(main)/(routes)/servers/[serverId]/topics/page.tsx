import { CustomFeed } from '@/components/topic/custome-feed'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function TopicPage() {
    return (
        <>
            <h1 className='font-bold text-3xl md:text-4xl'>Your feed</h1>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6'>
                <CustomFeed />
            </div>
        </>
    )
}
