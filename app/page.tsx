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
        <main className="flex h-full flex-col justify-center items-center bg-white dark:bg-[#313338]">
            <div className="text-center">
                <h1 className={cn("text-6xl font-semibold text-white drop-shadow-md", font.className)}>
                    Space
                </h1>
                <p className="mt-4 text-white">Create your space.</p>
            </div>
            <div className="mt-6">
                <NavigationAction />
            </div>
        </main>

    )
}






