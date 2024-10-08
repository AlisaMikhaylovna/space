"use client";

import { Plus } from "lucide-react";
import { useModal } from "@/hooks/use-modal-store";

export const NavigationAction = () => {
  const { onOpen } = useModal();
  return (
    <div>
      <button
        onClick={() => onOpen("createServer")}
        className="group flex items-center"
      >
        <div className="flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden items-center justify-center bg-background dark:bg-neutral-700 group-hover:bg-gray-300">
          <Plus
            className="group-hover:text-black transition text-gray-500"
            size={25}
          />
        </div>
      </button>
    </div>
  )
}