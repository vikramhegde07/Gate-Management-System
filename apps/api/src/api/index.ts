import express from 'express';

import authRoutes from './auth/auth.routes';
import propertyRoutes from './property/property.routes';
import publicRoutes from './public/public.routes';
import profileRoutes from "./profile/profile.routes"

const router = express.Router();

router.use('/auth', authRoutes);

router.use('/properties', propertyRoutes);

router.use('/public', publicRoutes);

router.use('/profile', profileRoutes);

export default router;