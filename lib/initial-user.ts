import { currentUser, auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db";

export const initialProfile = async () => {
    const user = await currentUser();
    if (!user)
        return auth().redirectToSignIn();
    const user = await db.user.findUnique({
        where: {
            userId: user.id
        }
    });
    if (user) {
        return user;
    }
    const newProfile = await db.profile.create({
        data: {
            userId: user.id,
            name: `${user.firstName} ${user.lastName}`,
            imageUrl: user.imageUrl,
            email: user.emailAddresses[0].emailAddress
        }
    });
    return newProfile;
};
