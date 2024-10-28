"use client"

import { MailIcon, XIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Member, User } from "@prisma/client";

interface ProfileProps {
    member: Member & {
        user: User;
    };
    onClose: () => void;
};

export const Profile = ({ member, onClose }: ProfileProps) => {

    const avatarFallback = member.user.name?.[0] ?? "M";

    return (
        <>
            <div className="h-full flex flex-col">
                <div className=" h-[49px] flex justify-between items-center px-4 border-b">
                    <p className="text-lg font-bold">Profile</p>
                    <Button onClick={onClose} size="iconSm" variant="ghost">
                        <XIcon className="size-5 stroke-[1.5]" />
                    </Button>
                </div>
                <div className="flex flex-col items-center justify-center p-4">
                    <Avatar className="max-w-[256px] max-h-[256px] size-full">
                        <AvatarImage src={member.user.image || undefined} />
                        <AvatarFallback className="aspect-square text-6xl">
                            {avatarFallback}
                        </AvatarFallback>
                    </Avatar>
                </div>
                <div className="flex flex-col p-4">
                    <p className="tex-xl font-bold">{member.user.name}</p>
                </div>
                <Separator />
                <div className="flex flex-col p-4">
                    <p className="text-sm font-bold mb-4">Contact information</p>
                    <div className="flex items-center gap-2">
                        <div className="size-9 rounded-md bg-muted flex items-center justify-center">
                            <MailIcon className="size-4" />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-[13px] font-semibold text-muted-foreground">
                                Email Address
                            </p>
                            <Link
                                href={`mailto:${member.user.email}`}
                                className="text-sm hover:underline text-[#1264a3]"
                            >
                                {member.user.email}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
