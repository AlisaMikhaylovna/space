import { currentUser } from '@/lib/current-user';
import { db } from '@/lib/db'
import { NextResponse } from 'next/server';

export async function PATCH(req: Request) {
    try {
        const user = await currentUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { name } = await req.json();

        // check if name is taken
        const name = await db.user.findFirst({
            where: {
                name: name,
            },
        })

        if (name) {
            return new NextResponse('Username is taken', { status: 409 })
        }

        // update name
        await db.user.update({
            where: {
                id: user.id,
            },
            data: {
                name: name,
            },
        })

        return new NextResponse('OK')
    } catch (error) {
        return new NextResponse(
            'Could not update name at this time. Please try later',
            { status: 500 }
        )
    }
}
