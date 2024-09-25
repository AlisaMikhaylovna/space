import { db } from "@/lib/db"
import { redirect } from "next/navigation";
import { InitialModal } from "@/components/modals/initial-modal";
import { currentUser } from "@/lib/current-user";

const SetupPage = async () => {
    const user = await currentUser();
    if (!user) {
        return redirect("/");
    }
    const server = await db.server.findFirst({
        where: {
            members: {
                some: {
                    userId: user.id
                }
            }
        }
    });
    if (server)
        return redirect(`/servers/${server.id}`);
    return (
        <InitialModal />
    );
}

export default SetupPage;