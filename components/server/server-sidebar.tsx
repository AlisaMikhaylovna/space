import { MemberRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { Hash, ShieldAlert, ShieldCheck, MessageCircle } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { currentUser } from "@/lib/current-user";
import { db } from "@/lib/db";

import { ServerHeader } from "./server-header";
import { ServerSearch } from "./server-search";
import { ServerSection } from "./server-section";
import { ServerChannel } from "./server-channel";
import { ServerMember } from "./server-member";

interface ServerSidebarProps {
  serverId: string;
}

const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: <ShieldCheck className="h-4 w-4 mr-2 text-green-500" />,
  [MemberRole.ADMIN]: <ShieldAlert className="h-4 w-4 mr-2 text-rose-500" />
}

export const ServerSidebar = async ({
  serverId
}: ServerSidebarProps) => {
  const user = await currentUser();

  if (!user) {
    return redirect("/");
  }

  const server = await db.server.findUnique({
    where: {
      id: serverId,
    },
    include: {
      channels: {
        orderBy: {
          createdAt: "asc",
        },
      },
      members: {
        include: {
          user: true,
        },
        orderBy: {
          role: "asc",
        }
      },
      subreddits: {
        orderBy: {
          createdAt: "asc",
        },
      },
    }
  });

  const chatChannels = server?.channels;

  const topics = server?.subreddits;

  const members = server?.members.filter((member) => member.userId !== user.id)

  if (!server) {
    return redirect("/");
  }

  const role = server.members.find((member) => member.userId === user.id)?.role;

  return (
    <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
      <ServerHeader
        server={server}
        role={role}
      />
      <ScrollArea className="flex-1 px-3">
        <div className="mt-2">
          <ServerSearch
            data={[
              {
                label: "Chat Channels",
                type: "channel",
                data: chatChannels?.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: <Hash className="mr-2 h-4 w-4" />,
                }))
              }, {
                label: "Topics",
                type: "topic",
                data: topics?.map((topic) => ({
                  id: topic.id,
                  name: topic.name,
                  icon: <MessageCircle className="mr-2 h-4 w-4" />,
                }))
              }, {
                label: "Members",
                type: "member",
                data: members?.map((member) => ({
                  id: member.id,
                  name: member.user.name!,
                  icon: roleIconMap[member.role],
                }))
              }
            ]}
          />
        </div>
        <Separator className="bg-zinc-200 dark:bg-zinc-700 rounded-md my-2" />
        {!!chatChannels?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="channels"
              role={role}
              label="Chat Channels"
            />
            <div className="space-y-[2px]">
              {chatChannels.map((channel) => (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  role={role}
                  server={server}
                />
              ))}
            </div>
          </div>
        )}
        {!!members?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="members"
              role={role}
              label="Members"
              server={server}
            />
            <div className="space-y-[2px]">
              {members && members.length > 0 && members
                .filter(member => member.role !== MemberRole.GUEST)
                .map(member => (
                  <ServerMember
                    key={member.id}
                    member={member}
                    server={server}
                  />
                ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}