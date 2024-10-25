import { redirect } from "next/navigation";

import { currentUser } from "@/lib/current-user";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { db } from "@/lib/db";
import { ChatMessages } from "@/components/chat/chat-messages";

interface ChannelIdPageProps {
    params: {
        serverId: string;
        channelId: string;
    }
}

const ChannelIdPage = async ({
    params
}: ChannelIdPageProps) => {
    const user = await currentUser();

    if (!user) {
        return redirect("/");
    }

    const channel = await db.channel.findUnique({
        where: {
            id: params.channelId,
        },
    });

    const server = await db.server.findUnique({
        where: { id: params.serverId }
    })

    const member = await db.member.findFirst({
        where: {
            serverId: params.serverId,
            userId: user.id,
        }
    });

    if (!server || !channel || !member) {
        redirect("/");
    }

    return (
        <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
            <ChatHeader
                name={server.name}
                serverId={channel.serverId}
                type="channel"
            />
            <ChatMessages
                member={member}
                chatId={channel.id}
                apiUrl="/api/messages"
                socketUrl="/api/socket/messages"
                socketQuery={{
                    channelId: channel.id,
                    serverId: channel.serverId,
                }}
                paramKey="channelId"
                paramValue={channel.id}
            />
            <ChatInput
                name={channel.name}
                type="channel"
                apiUrl="/api/socket/messages"
                query={{
                    channelId: channel.id,
                    serverId: channel.serverId,
                }}
            />
        </div>
    );
}

export default ChannelIdPage;