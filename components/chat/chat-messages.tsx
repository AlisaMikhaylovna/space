"use client"

import { useRef, ElementRef } from "react";
import { differenceInMinutes, format, isToday, isYesterday } from "date-fns";
import { Member, Message, User } from "@prisma/client";
import { Loader2, ServerCrash } from "lucide-react";

import { useChatQuery } from "@/hooks/use-chat-query";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { useChatScroll } from "@/hooks/use-chat-scroll";

import { ChatItem } from "./chat-item";

const TIME_THRESHOLD = 5;

const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "EEEE, MMMM d");
};

type MessageWithMemberWithUser = Message & {
    member: Member & {
        user: User;
    };
    threadCount?: number;
    threadImage?: string;
    threadName?: string;
    threadTimestamp?: number;
};

interface ChatMessagesProps {
    member: Member;
    chatId: string;
    apiUrl: string;
    socketUrl: string;
    socketQuery: Record<string, string>;
    paramKey: "channelId" | "conversationId";
    paramValue: string;
    variant?: "channel" | "thread" | "conversation";
}

export const ChatMessages = ({
    member,
    chatId,
    apiUrl,
    socketUrl,
    socketQuery,
    paramKey,
    paramValue,
    variant = "channel"
}: ChatMessagesProps) => {
    const queryKey = `chat:${chatId}`;
    const addKey = `chat:${chatId}:messages`;
    const updateKey = `chat:${chatId}:messages:update`;

    const chatRef = useRef<ElementRef<"div">>(null);
    const bottomRef = useRef<ElementRef<"div">>(null);

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

    if (status === "pending") {
        return (
            <div className="flex flex-col flex-1 justify-center items-center">
                <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Loading messages...
                </p>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="flex flex-col flex-1 justify-center items-center">
                <ServerCrash className="h-7 w-7 text-zinc-500 my-4" />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Something went wrong!
                </p>
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
                                        isUpdated={message.updatedAt !== message.createdAt}
                                        socketUrl={socketUrl}
                                        socketQuery={socketQuery}
                                        isCompact={isCompact}
                                        hideThreadButton={variant === "thread"}
                                        threadCount={message.threadCount}
                                        threadImage={message.threadImage}
                                        threadName={message.threadName}
                                        threadTimestamp={message.threadTimestamp}
                                    />
                                );
                            })}
                        </div>
                    );
                })}
            </div>
            <div ref={bottomRef} />
        </div>
    );
};
