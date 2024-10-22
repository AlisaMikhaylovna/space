import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { db } from "@/lib/db";
import { authOptions } from "./auth";

export const currentUserServer = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        return null;
    }

    const userId = session.user.id;

    const user = await db.user.findUnique({
        where: {
            id: userId
        }
    });

    return user;
}