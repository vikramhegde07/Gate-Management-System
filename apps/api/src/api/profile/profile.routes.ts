import { Router } from "express";

import { verifyJWT } from "../../middlewares/authMiddleware";
import { upload } from "../../lib/multer";
import {
    updateProfile,
    uploadProfileImage,
    checkAvailability
} from "./profile.controller";
import { optionalVerifyJWT } from "../../middlewares/optionalAuthMiddleware";

const router = Router();

// All profile routes require an authenticated user.
router.use(verifyJWT);

// Update editable personal information.
router.patch("/me", updateProfile);

// Upload or replace the profile avatar.
router.post(
    "/me/avatar",
    upload.single("image"),
    uploadProfileImage
);

// Public availability check; recognizes a valid access token if present.
router.get("/availability", optionalVerifyJWT, checkAvailability);

export default router;