import { db } from "@/lib/db";

export const populateThread = async (messageId: string) => {
    const messages = await db.message.findMany({
        where: { parentMessageId: messageId }
    });

    if (messages.length === 0) {
        return {
            count: 0,
            image: undefined,
            timestamp: 0,
            name: "",
        };
    }

    const lastMessage = messages[messages.length - 1];
    const lastMessageMember = await db.member.findUnique({
        where: { id: lastMessage.memberId },
        include: { user: true }
    });

    if (!lastMessageMember || !lastMessageMember.user) {
        return {
            count: 0,
            image: undefined,
            timestamp: 0,
            name: "",
        };
    }

    return {
        count: messages.length,
        image: lastMessageMember.user.image,
        timestamp: lastMessage.createdAt.getTime(),
        name: lastMessageMember.user.name,
    };
}
