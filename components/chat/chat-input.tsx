"use client";

import axios from "axios";
import qs from "query-string";

import { useRouter } from "next/navigation";

import { useRef, useState } from "react";
import Quill from "quill";
import Editor from "./chat-editor";

interface ChatInputProps {
    apiUrl: string;
    query: Record<string, any>;
    name?: string;
    type?: "conversation" | "channel";
}


export const ChatInput = ({
    apiUrl,
    query,
    name,
    type
}: ChatInputProps) => {

    const [editorKey, setEditorKey] = useState(0);
    const [isPending, setIsPending] = useState(false);

    const editorRef = useRef<Quill | null>(null);

    const router = useRouter();

    const handleSubmit = async ({ body }: { body: string }) => {
        try {

            setIsPending(true);
            editorRef?.current?.enable(false);

            const url = qs.stringifyUrl({
                url: apiUrl,
                query,
            });

            await axios.post(url, { content: body }, { // 修改这里
                headers: {
                    'Content-Type': 'application/json',
                }
            });


            setEditorKey((prevKey) => prevKey + 1);

            router.refresh();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error response:", error.response?.data);
            } else {
                console.error("Unexpected error:", error);
            }
        } finally {
            setIsPending(false);
            editorRef?.current?.enable(true);
        }
    }

    return (
        <div className="px-5 w-full">
            <Editor
                key={editorKey}
                placeholder={`Message ${type === "conversation" ? name : "#" + name}`}
                onSubmit={handleSubmit}
                disabled={isPending}
                innerRef={editorRef}
            />
        </div>
    )
}
