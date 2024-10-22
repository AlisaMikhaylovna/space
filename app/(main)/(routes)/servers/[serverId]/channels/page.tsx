import { redirect } from "next/navigation";

import { currentUser } from "@/lib/current-user";
import { db } from "@/lib/db";

interface ChannelPageProps {
    params: {
        serverId: string;
    }
};

const ChannelPage = async ({
    params
}: ChannelPageProps) => {
    const user = await currentUser();

    if (!user) {
        return redirect("/");
    }

    const server = await db.server.findUnique({
        where: {
            id: params.serverId,
            members: {
                some: {
                    userId: user.id,
                }
            }
        },
        include: {
            channels: {
                where: {
                    name: "general"
                },
                orderBy: {
                    createdAt: "asc"
                }
            }
        }
    })

    const initialChannel = server?.channels[0];

    if (initialChannel?.name !== "general") {
        return null;
    }

    return redirect(`/servers/${params.serverId}/channels/${initialChannel?.id}`)
}

export default ChannelPage;