import { Router } from "express";

import { verifyJWT } from "../../middlewares/authMiddleware";
import { loadPropertyAccess } from "../../middlewares/loadPropertyAccess";
import { allowRoles } from "../../middlewares/allowRoles";

import {
    createPropertyUser,
    getPropertyUsers,
} from "./user.controller";

import { PropertyRole } from "../../generated/prisma/enums";

const router = Router({ mergeParams: true });

router.post(
    "/",
    verifyJWT,
    loadPropertyAccess,
    allowRoles([
        PropertyRole.OWNER,
        PropertyRole.COMMITTEE,
    ]),
    createPropertyUser
);

router.get(
    "/",
    verifyJWT,
    loadPropertyAccess,
    getPropertyUsers
);

export default router;