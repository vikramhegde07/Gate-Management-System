import { S3Client, PutObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { env } from "../config/env";

const s3 = new S3Client({
    forcePathStyle: true,
    region: env.S3_REGION as string,
    endpoint: env.S3_ENDPOINT as string,
    credentials: {
        accessKeyId: env.S3_ACCESS_KEY!,
        secretAccessKey: env.S3_SECRET_KEY!,
    },
});

export const s3Util = {
    // Upload function
    uploadFile: async (file: Express.Multer.File, folder: string) => {
        const fileName = `${folder}/${Date.now()}-${file.originalname}`;
        const command = new PutObjectCommand({
            Bucket: env.S3_BUCKET_NAME,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
        });

        await s3.send(command);
        // Return the public URL
        return `${env.S3_PUBLIC_URL}/${fileName}`;
    },

    // Delete many function
    deleteFiles: async (fileKeys: string[]) => {
        const command = new DeleteObjectsCommand({
            Bucket: env.S3_BUCKET_NAME,
            Delete: {
                Objects: fileKeys.map(key => ({ Key: key })),
            },
        });
        return await s3.send(command);
    }
};