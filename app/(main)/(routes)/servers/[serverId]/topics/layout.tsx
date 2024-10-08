export default function TopicLayout({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <div className='container max-w-7xl mx-auto h-full pt-12'>
            {children}
        </div>
    )
}
