import { db } from "./db";

const populateMember = async (memeberId: string) => {
    const member = await db.member.findUnique({
        where: { id: memeberId }
    })
    return member;
}

const populateUser = async (userId: string) => {
    const user = await db.user.findUnique({
        where: { id: userId }
    })
    return user;
}

export const populateThread = async (messageId: string) => {
    const messages = await db.message.findMany({
        where: { parentMessageId: messageId }
    })
    if (messages.length === 0) {
        return {
            count: 0,
            image: undefined,
            timestamp: 0,
            name: "",
        };
    }
    const lastMessage = messages[messages.length - 1];
    const lastMessageMember = await populateMember(lastMessage.memberId);

    if (!lastMessageMember) {
        return {
            count: 0,
            image: undefined,
            timestamp: 0,
            name: "",
        };
    }

    const lastMessageUser = await populateUser(lastMessageMember.userId);

    return {
        count: messages.length,
        image: undefined,
        timestamp: lastMessage.createdAt.getTime(),
        name: lastMessageUser?.name,
    };
}