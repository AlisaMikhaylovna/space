import { getAuthSession } from "./auth";

export const currentUser = async () => {
    const session = await getAuthSession();
    if (!session) return null;
    return session.user;
}