import { getToken } from 'next-auth/jwt';
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { NextRequest } from 'next/server';

const f = createUploadthing();

export const ourFileRouter = {
  serverImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 }
  })
    .middleware(async (req) => {
      const user = await getToken({ req: req as unknown as NextRequest });
      if (!user) throw new Error('Unauthorized');
      return { userId: user.id };
    })
    .onUploadComplete(() => { }),

  imageUploader: f({ image: { maxFileSize: '8MB' } })
    .middleware(async (req) => {
      const user = await getToken({ req: req as unknown as NextRequest });

      if (!user) throw new Error('Unauthorized');

      return { userId: user.id };
    })
    .onUploadComplete(() => { }),



  messageFile: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
    pdf: { maxFileSize: "8MB", maxFileCount: 1 },
    video: { maxFileSize: "32MB", maxFileCount: 1 }
  })
    .middleware(async (req) => {
      const user = await getToken({ req: req as unknown as NextRequest });
      if (!user) throw new Error('Unauthorized');
      return { userId: user.id };
    })
    .onUploadComplete(() => { })
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
