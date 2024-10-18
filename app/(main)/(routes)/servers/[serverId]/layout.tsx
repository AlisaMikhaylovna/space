import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/current-user";
import { ServerSidebar } from "@/components/server/server-sidebar";
import { Navbar } from "@/components/navbar";

const ServerIdLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { serverId: string };
}) => {
  const user = await currentUser();

  if (!user) {
    return redirect("/");
  }

  const server = await db.server.findUnique({
    where: {
      id: params.serverId,
      members: {
        some: {
          userId: user.id
        }
      }
    }
  });

  if (!server) {
    return redirect("/");
  }

  return (
    <div className="h-full flex">
      <div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0">
        <ServerSidebar serverId={params.serverId} />
      </div>
      <div className="flex-grow md:pl-60">
        <Navbar serverId={params.serverId} />
        <main className="h-full">
          {children}
        </main>
      </div>
    </div>
  );
}

export default ServerIdLayout;