import {
    cert,
    getApps,
    initializeApp,
} from "firebase-admin/app";

import { getMessaging } from "firebase-admin/messaging";

import { env } from "../config/env";


const serviceAccount = JSON.parse(
    env.FIREBASE_SERVICE_ACCOUNT_JSON
) as {
    project_id: string;
    client_email: string;
    private_key: string;
};

const firebaseApp =
    getApps().length > 0
        ? getApps()[0]
        : initializeApp({
            credential: cert({
                projectId: serviceAccount.project_id,
                clientEmail: serviceAccount.client_email,
                privateKey: serviceAccount.private_key.replace(
                    /\\n/g,
                    "\n"
                ),
            }),
        });

export const firebaseMessaging =
    getMessaging(firebaseApp);