import { Hash } from "lucide-react";

import { UserAvatar } from "@/components/user-avatar";
import { SocketIndicator } from "@/components/socket-indicator";

interface ChatHeaderProps {
  serverId: string;
  name: string;
  type: "channel" | "conversation";
  image?: string;
}

export const ChatHeader = ({
  serverId,
  name,
  type,
  image
}: ChatHeaderProps) => {
  return (
    <div className="text-md font-semibold px-3 flex items-center  border-neutral-200 dark:border-neutral-800 border-b-2 py-2 cursor-default">
      {type === "conversation" && (
        <UserAvatar
          user={{ name: name || null, image: image || null }}
          className="h-8 w-8 md:h-8 md:w-8 mr-2"
        />
      )}
      <p className="font-semibold text-md text-black dark:text-white">
        {name}
      </p>
      <div className="ml-auto flex items-center">
        <SocketIndicator />
      </div>
    </div>
  )
}