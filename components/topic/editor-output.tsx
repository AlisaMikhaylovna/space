'use client'

import { CustomCodeRenderer } from '@/components/topic/renderers/custome-code-render'
import { CustomImageRenderer } from '@/components/topic/renderers/custome-image-render'

import dynamic from 'next/dynamic'

const Output = dynamic(
    async () => (await import('editorjs-react-renderer')).default,
    { ssr: false }
)

interface EditorOutputProps {
    content: any
}

const renderers = {
    image: CustomImageRenderer,
    code: CustomCodeRenderer,
}

const style = {
    paragraph: {
        fontSize: '0.875rem',
        lineHeight: '1.25rem',
    },
}

export const EditorOutput = ({ content }: EditorOutputProps) => {
    return (
        <Output
            style={style}
            className='text-sm'
            renderers={renderers}
            data={content}
        />
    )
}


