"use client";


import axios from "axios";
import qs from "query-string";

import { Member, MemberRole, User } from "@prisma/client";
import { ShieldAlert, ShieldCheck } from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";

import dynamic from "next/dynamic";
import { format, isToday, isYesterday } from "date-fns";

import { usePanel } from "@/hooks/use-panel";

import { Hint } from "@/components/hint";
import { Toolbar } from "@/components/toolbar";

import { ThreadBar } from "@/components/thread-bar";

import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";

import { useModal } from "@/hooks/use-modal-store";
import Quill from "quill";

const Editor = dynamic(() => import("@/components/chat/chat-editor"), { ssr: false });
const Renderer = dynamic(() => import("@/components/renderer"), { ssr: false });

interface ChatItemProps {
  id: string;
  content: string;
  member: Member & {
    user: User;
  };
  createdAt: Date,
  updatedAt: Date
  deleted: boolean;
  currentMember: Member;
  isUpdated: boolean;
  socketUrl: string;
  socketQuery: Record<string, string>;
  isCompact?: boolean;
  hideThreadButton?: boolean;
  threadCount?: number;
  threadImage?: string;
  threadName?: string;
  threadTimestamp?: number;
};

const roleIconMap = {
  "GUEST": null,
  "MODERATOR": <ShieldCheck className="h-4 w-4 ml-2 text-green-400" />,
  "ADMIN": <ShieldAlert className="h-4 w-4 ml-2 text-rose-500" />,
}

const formatFullTime = (date: Date) => {
  return `${isToday(date) ? "Today" : isYesterday(date) ? "Yesterday" : format(date, "MMM d, yyyy")} at ${format(date, "h:mm:ss a")}`;
};

export const ChatItem = ({
  id,
  content,
  member,
  createdAt,
  updatedAt,
  deleted,
  currentMember,
  isUpdated,
  socketUrl,
  socketQuery,
  isCompact,
  hideThreadButton,
  threadCount,
  threadImage,
  threadName,
  threadTimestamp,
}: ChatItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const editorRef = useRef<Quill | null>(null);
  const { onOpen } = useModal();
  const params = useParams();
  const router = useRouter();

  const { parentMessageId, onOpenMessage, onOpenProfile, onClose } = usePanel();

  const onMemberClick = () => {
    if (member.id === currentMember.id) {
      return;
    }

    router.push(`/servers/${params?.serverId}/conversations/${member.id}`);
  }

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === "Escape" || event.keyCode === 27) {
        setIsEditing(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keyDown", handleKeyDown);
  }, []);


  const handleUpdate = async ({ body }: { body: string }) => {
    try {

      setIsPending(true);
      editorRef?.current?.enable(false);

      const url = qs.stringifyUrl({
        url: `${socketUrl}/${id}`,
        query: socketQuery,
      });

      await axios.patch(url, { content: body }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      setIsEditing(false);

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

  const handleRemove = () => {
    onOpen("deleteMessage", {
      apiUrl: `${socketUrl}/${id}`,
      query: socketQuery,
    })

    if (parentMessageId === id) {
      onClose();
    }
  }


  const isAdmin = currentMember.role === MemberRole.ADMIN;
  const isModerator = currentMember.role === MemberRole.MODERATOR;
  const isOwner = currentMember.id === member.id;
  const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner);
  const canEditMessage = !deleted && isOwner;


  if (isCompact) {
    return (
      <>
        <div className={cn(
          "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
          isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]"
        )}>
          <div className="flex items-start gap-2">
            <Hint label={formatFullTime(new Date(createdAt))}>
              <button className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 w-[40px] leading-[22px] text-center hover:underline">
                {format(new Date(createdAt), "hh:mm")}
              </button>
            </Hint>
            {isEditing ? (
              <div className="w-full h-full">
                <Editor
                  onSubmit={handleUpdate}
                  disabled={isPending}
                  defaultValue={JSON.parse(content)}
                  onCancel={() => setIsEditing(false)}
                  variant="update"
                />
              </div>
            ) : (
              <div className="flex flex-col w-full">
                <Renderer value={content} />
                {updatedAt ? (
                  <span className="text-xs text-muted-foreground">
                    (edited)
                  </span>
                ) : null}
                <ThreadBar
                  count={threadCount}
                  image={threadImage}
                  name={threadName}
                  timestamp={threadTimestamp}
                  onClick={() => onOpenMessage(id)}
                />
              </div>
            )}
          </div>
          {!isEditing && (
            <Toolbar
              isAuthor={isOwner}
              isPending={isPending}
              handleEdit={() => setIsEditing(true)}
              handleThread={() => onOpenMessage(id)}
              handleDelete={handleRemove}
              hideThreadButton={hideThreadButton}
            />
          )}
        </div>
      </>
    )
  }

  return (
    <>
      <div className={cn(
        "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
        isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]"
      )}>
        <div className="flex items-start gap-2">
          <button onClick={() => onOpenProfile(member.id)}>
            <UserAvatar
              user={{ name: member.user.name || null, image: member.user.image || null }}
              className="h-8 w-8 md:h-8 md:w-8"
            />
          </button>
          {isEditing ? (
            <div className="w-full h-full">
              <Editor
                onSubmit={handleUpdate}
                disabled={isPending}
                defaultValue={JSON.parse(content)}
                onCancel={() => setIsEditing(false)}
                variant="update"
              />
            </div>
          ) : (
            <div className="flex flex-col w-full overflow-hidden">
              <div className="text-sm">
                <button onClick={() => onOpenProfile(member.id)} className="font-bold text-primary hover:underline">
                  {member.user.name}
                </button>
                <span>&nbsp;&nbsp;</span>
                <Hint label={formatFullTime(new Date(createdAt))}>
                  <button className="text-xs text-muted-foreground hover:underline">
                    {format(new Date(createdAt), "h:mm a")}
                  </button>
                </Hint>
              </div>
              <Renderer value={content} />
              {updatedAt ? (
                <span className="text-xs text-muted-foreground">(edited)</span>
              ) : null}
              <ThreadBar
                count={threadCount}
                image={threadImage}
                name={threadName}
                timestamp={threadTimestamp}
                onClick={() => onOpenMessage(id)}
              />
            </div>
          )}
        </div>
        {!isEditing && (
          <Toolbar
            isAuthor={isOwner}
            isPending={isPending}
            handleEdit={() => setIsEditing(true)}
            handleThread={() => onOpenMessage(id)}
            handleDelete={handleRemove}
            hideThreadButton={hideThreadButton}
          />
        )}
      </div>
    </>
  )
}

// return (
//   <div className="relative group flex items-center hover:bg-black/5 p-4 transition">
//     <div className="flex gap-x-2 max-w-fit">
//       <div
//         onClick={onMemberClick}
//         className="cursor-pointer hover:drop-shadow-md transition"
//       >
//         <UserAvatar
//           user={{ name: member.user.name || null, image: member.user.image || null }}
//           className="h-8 w-8 md:h-8 md:w-8"
//         />
//       </div>
//       <div className="flex flex-col">
//         <div className="flex items-center gap-x-2" >
//           <div className="flex items-center">
//             <p
//               onClick={onMemberClick}
//               className="font-semibold text-sm hover:underline cursor-pointer"
//             >
//               {member.user.name}
//             </p>
//             <ActionTooltip label={member.role}>
//               {roleIconMap[member.role]}
//             </ActionTooltip>
//           </div>
//           <span className="text-xs text-zinc-500 dark:text-zinc-400">
//             {timestamp}
//           </span>
//         </div>

//         {!isEditing && (
//           <p
//             className={cn(
//               "text-sm text-zinc-600 dark:text-zinc-300",
//               deleted &&
//               "italic text-zinc-500 dark:text-zinc-400 text-xs mt-1"
//             )}
//           >
//             {content}
//             {isUpdated && !deleted && (
//               <span className="text-[10px] mx-2 text-zinc-500 dark:text-zinc-400">
//                 (edited)
//               </span>
//             )}
//           </p>
//         )}
//         {isEditing && (
//           <div className="w-full h-full">
//             <Editor
//               onSubmit={handleUpdate}
//               disabled={isPending}
//               defaultValue={JSON.parse(content)}
//               onCancel={() => setIsEditing(false)}
//               variant="update"
//             />
//           </div>
//         )}
//       </div>
//     </div>
//     {canDeleteMessage && (
//       <div
//         className={cn(
//           "hidden group-hover:flex items-center gap-x-2 absolute p-1 -top-2",
//           isOwner ? "left-5" : "right-5",
//           "bg-white dark:bg-zinc-800 border rounded-sm"
//         )}
//       >
//         {canEditMessage && (
//           <ActionTooltip label="Edit">
//             <Edit
//               onClick={() => setIsEditing(true)}
//               className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
//             />
//           </ActionTooltip>
//         )}
//         <ActionTooltip label="Delete">
//           <Trash
//             onClick={() =>
//               onOpen("deleteMessage", {
//                 apiUrl: `${socketUrl}/${id}`,
//                 query: socketQuery,
//               })
//             }
//             className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
//           />
//         </ActionTooltip>
//       </div>
//     )}
//   </div>
// );
