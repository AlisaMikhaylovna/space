"use client"

import Quill from "quill";
import dynamic from "next/dynamic";
import axios from "axios";
import qs from "query-string";

import { useRef, useState, ElementRef } from "react";

import { AlertTriangle, Loader, Loader2, XIcon } from "lucide-react";
import { differenceInMinutes, format, isToday, isYesterday } from "date-fns";

import { useChatQuery } from "@/hooks/use-chat-query";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { useChatScroll } from "@/hooks/use-chat-scroll";
import { useRouter } from "next/navigation";

import { Member, Message, User } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { ChatItem } from "@/components/chat/chat-item";

const Editor = dynamic(() => import("@/components/chat/chat-editor"), { ssr: false });

const TIME_THRESHOLD = 5;

type MessageWithMemberWithUser = Message & {
    member: Member & {
        user: User;
    };
};

interface ThreadProps {
    member: Member;
    chatId: string;
    inputUrl: string;
    query: Record<string, string>;
    apiUrl: string;
    socketUrl: string;
    socketQuery: Record<string, string>;
    paramKey: "channelId" | "conversationId";
    paramValue: string;
    messageId: string;
    onClose: () => void;
};

const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "EEEE, MMMM d");
};

export const Thread = ({
    member,
    chatId,
    inputUrl,
    query,
    apiUrl,
    socketUrl,
    socketQuery,
    paramKey,
    paramValue,
    messageId,
    onClose
}: ThreadProps) => {
    const queryKey = `chat:${messageId}`;
    const addKey = `chat:${messageId}:messages`;
    const updateKey = `chat:${chatId}:messages:update`;

    const chatRef = useRef<ElementRef<"div">>(null);
    const bottomRef = useRef<ElementRef<"div">>(null);

    const router = useRouter();

    const [editorKey, setEditorKey] = useState(0);
    const [isPending, setIsPending] = useState(false);

    const editorRef = useRef<Quill | null>(null);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useChatQuery({
        queryKey,
        apiUrl,
        paramKey,
        paramValue,
        initialLimit: 50
    });

    useChatSocket({ queryKey, addKey, updateKey });

    useChatScroll({
        chatRef,
        bottomRef,
        loadMore: fetchNextPage,
        shouldLoadMore: !isFetchingNextPage && !!hasNextPage,
        count: data?.pages?.[0]?.items?.length ?? 0,
    });

    const handleSubmit = async ({ body }: { body: string }) => {
        try {

            setIsPending(true);
            editorRef?.current?.enable(false);

            const url = qs.stringifyUrl({
                url: inputUrl,
                query
            });

            await axios.post(url, { content: body }, {
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

    if (status === "pending") {
        return (
            <div className="h-full flex flex-col">
                <div className="h-[49px] flex justify-between items-center px-4 border-b">
                    <p className="text-lg font-bold">Replies</p>
                    <Button onClick={onClose} size="iconSm" variant="ghost">
                        <XIcon className="size-5 stroke-[1.5]" />
                    </Button>
                </div>
                <div className="flex flex-col gap-y-2 h-full items-center justify-center">
                    <Loader className="size-5 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="h-full flex flex-col">
                <div className="h-[49px] flex justify-between items-center px-4 border-b">
                    <p className="text-lg font-bold">Replies</p>
                    <Button onClick={onClose} size="iconSm" variant="ghost">
                        <XIcon className="size-5 stroke-[1.5]" />
                    </Button>
                </div>
                <div className="flex flex-col gap-y-2 h-full items-center justify-center">
                    <AlertTriangle className="size-5 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Message not found</p>
                </div>
            </div>
        );
    }

    const groupedMessages = data?.pages?.reduce((acc, group) => {
        group.items.forEach((message: MessageWithMemberWithUser) => {
            const dateKey = format(new Date(message.createdAt), "yyyy-MM-dd");
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push(message);
        });
        return acc;
    }, {} as Record<string, MessageWithMemberWithUser[]>);

    return (
        <div ref={chatRef} className="flex-1 flex flex-col py-4 overflow-y-auto">
            <div className="mt-10 h-[49px] flex justify-between items-center px-4 border-b">
                <p className="text-lg font-bold">Replies</p>
                <Button onClick={onClose} size="iconSm" variant="ghost">
                    <XIcon className="size-5 stroke-[1.5]" />
                </Button>
            </div>

            {!hasNextPage && <div className="flex-1" />}

            {hasNextPage && (
                <div className="flex justify-center">
                    {isFetchingNextPage ? (
                        <Loader2 className="h-6 w-6 text-zinc-500 animate-spin my-4" />
                    ) : (
                        <button
                            onClick={() => fetchNextPage()}
                            className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 text-xs my-4 dark:hover:text-zinc-300 transition"
                        >
                            Load previous messages
                        </button>
                    )}
                </div>
            )}

            <div className="flex flex-col-reverse mt-auto">
                {Object.entries(groupedMessages || {}).map(([dateKey, messages]) => {
                    const sortedMessages = (messages as MessageWithMemberWithUser[]).sort((a, b) =>
                        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                    );

                    return (
                        <div key={dateKey}>
                            <div className="text-center my-2 relative">
                                <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300" />
                                <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm">
                                    {formatDateLabel(dateKey)}
                                </span>
                            </div>
                            {sortedMessages.map((message: MessageWithMemberWithUser, index: number) => {
                                const prevMessage = sortedMessages[index - 1];
                                const isCompact =
                                    prevMessage &&
                                    prevMessage.member.id === message.member.id &&
                                    differenceInMinutes(
                                        new Date(message.createdAt),
                                        new Date(prevMessage.createdAt)
                                    ) < TIME_THRESHOLD;

                                return (
                                    <ChatItem
                                        key={message.id}
                                        id={message.id}
                                        currentMember={member}
                                        member={message.member}
                                        content={message.content}
                                        deleted={message.deleted}
                                        createdAt={message.createdAt}
                                        isUpdated={message.updated}
                                        socketUrl={socketUrl}
                                        socketQuery={socketQuery}
                                        isCompact={isCompact}
                                        hideThreadButton
                                    />
                                );
                            })}
                        </div>
                    );
                })}
            </div>
            <div className=" px-2 fixed bottom-2">
                <Editor
                    key={editorKey}
                    placeholder="Reply.."
                    onSubmit={handleSubmit}
                    disabled={isPending}
                    innerRef={editorRef}
                />
            </div>

            <div ref={bottomRef} />
        </div>
    );
};
