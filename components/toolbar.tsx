import { MessageSquareTextIcon, Pencil, Trash } from "lucide-react";

import { Hint } from "./hint";
import { Button } from "./ui/button";

interface ToolbarProps {
    canDeleteMessage: boolean;
    canEditMessage: boolean;
    isPending: boolean;
    handleEdit: () => void;
    handleThread: () => void;
    handleDelete: () => void;
    hideThreadButton?: boolean;
};

export const Toolbar = ({
    canDeleteMessage,
    canEditMessage,
    isPending,
    handleEdit,
    handleThread,
    handleDelete,
    hideThreadButton,
}: ToolbarProps) => {
    return (
        <div className="absolute top-0 right-5">
            <div className="group-hover:opacity-100 opacity-0 transition-opacity border bg-white rounded-md shadow-sm">
                {canDeleteMessage && !hideThreadButton && (
                    <Hint label="Reply">
                        <Button
                            variant="ghost"
                            size="iconSm"
                            disabled={isPending}
                            onClick={handleThread}
                        >
                            <MessageSquareTextIcon className="size-4" />
                        </Button>
                    </Hint>
                )}
                {canEditMessage && (
                    <Hint label="Edit message">
                        <Button
                            variant="ghost"
                            size="iconSm"
                            disabled={isPending}
                            onClick={handleEdit}
                        >
                            <Pencil className="size-4" />
                        </Button>
                    </Hint>
                )}
                {canDeleteMessage && (
                    <Hint label="Delete message">
                        <Button
                            variant="ghost"
                            size="iconSm"
                            disabled={isPending}
                            onClick={handleDelete}
                        >
                            <Trash className="size-4" />
                        </Button>
                    </Hint>
                )}
            </div>
        </div>
    )
};
