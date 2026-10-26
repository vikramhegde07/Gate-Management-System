
import express from "express";

import { verifyJWT } from "../../middlewares/authMiddleware";
import { asyncHandler } from "../../utils/asyncHandler";

import {
    registerDevice,
    getDevices,
    deactivateDevice,
    pingDevice,
} from "./fcm-tokens.controller";

const router = express.Router();

router.use(verifyJWT);

router.post("/", asyncHandler(registerDevice));
router.get("/", asyncHandler(getDevices));
router.delete("/current", asyncHandler(deactivateDevice));
router.patch("/current/ping", asyncHandler(pingDevice));

export default router;
