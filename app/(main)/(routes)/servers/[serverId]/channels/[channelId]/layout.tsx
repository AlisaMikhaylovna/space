"use client"

import { Loader } from "lucide-react";
import { Thread } from "@//components/thread";
import { Profile } from "@/components/profile";
import { Member, User } from "@prisma/client"

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";

import { usePanel } from "@/hooks/use-panel";

import { useEffect, useState } from "react";
import axios from "axios";

const ChannelLayout = ({ children, params }: {
    children: React.ReactNode;
    params: { serverId: string, channelId: string }
}) => {
    const { parentMessageId, profileMemberId, onClose } = usePanel();
    const showPanel = !!parentMessageId || !!profileMemberId;
    const channelId = params.channelId;
    const serverId = params.serverId;

    const [member, setMember] = useState<Member & { user: User } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`/api/current-member/${serverId}`);
                setMember(response.data);
            } catch (error) {
                console.error("Error fetching member data:", error);
            }
        };
        fetchData();
    }, [serverId]);

    return (
        <div className="h-full">
            <ResizablePanelGroup
                direction="horizontal"
                autoSaveId="ca-workspace-layout"
            >
                <ResizableHandle withHandle />
                <ResizablePanel minSize={20} defaultSize={80}>
                    {children}
                </ResizablePanel>
                {showPanel && (
                    <>
                        <ResizableHandle withHandle />
                        <ResizablePanel minSize={20} defaultSize={29}>
                            {parentMessageId && member ? (
                                <Thread
                                    member={member}
                                    chatId={channelId}
                                    inputUrl="/api/socket/reply-messages"
                                    query={{
                                        channelId,
                                        serverId,
                                        messageId: parentMessageId
                                    }}
                                    apiUrl={`/api/messages/${parentMessageId}`}
                                    socketUrl="/api/socket/messages"
                                    socketQuery={{
                                        channelId,
                                        serverId,
                                        messageId: parentMessageId
                                    }}
                                    paramKey="channelId"
                                    paramValue={channelId}
                                    messageId={parentMessageId}
                                    onClose={onClose}
                                />
                            ) : profileMemberId && member ? (
                                <Profile
                                    member={member}
                                    onClose={onClose}
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <Loader className="size-5 animate-spin text-muted-foreground" />
                                </div>
                            )}
                        </ResizablePanel>
                    </>
                )}
            </ResizablePanelGroup>
        </div>
    )
}
export default ChannelLayout;
