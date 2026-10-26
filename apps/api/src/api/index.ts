import express from 'express';

import authRoutes from './auth/auth.routes';
import propertyRoutes from './property/property.routes';
import publicRoutes from './public/public.routes';
import profileRoutes from "./profile/profile.routes"
import notificationRoutes from "./notifications/notifications.routes";
import fcmTokenRoutes from "./fcm-tokens/fcm-tokens.routes"

const router = express.Router();

router.use('/auth', authRoutes);

router.use('/properties', propertyRoutes);

router.use('/public', publicRoutes);

router.use('/profile', profileRoutes);

router.use("/notifications", notificationRoutes);

router.use("/fcm-tokens", fcmTokenRoutes);

export default router;