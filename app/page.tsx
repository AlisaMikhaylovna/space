import { cn } from "@/lib/utils";
import { NavigationAction } from "@/components/navigation/navigation-action";
import { Poppins } from "next/font/google";

import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { initialProfile } from "@/lib/initial-profile";


const font = Poppins({
    subsets: ["latin"],
    weight: ["600"]
});

export default async function Home() {
    const profile = await initialProfile();

    const server = await db.server.findFirst({
        where: {
            members: {
                some: {
                    userId: profile.id
                }
            }
        }
    });

    if (server) {
        return redirect(`/servers/${server.id}`);
    }

    return (
        <main className="flex h-full flex-col justify-center items-center bg-gray-700">
            <div className="space-y-6 text-center">
                <h1 className={cn("text-6xl font-semibold text-white drop-shadow-md", font.className)}>
                    Space
                </h1>
            </div>
            <NavigationAction />
        </main>
    )
}






