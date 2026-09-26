import { Router } from "express";

import { verifyJWT } from "../../middlewares/authMiddleware";
import { allowRoles } from "../../middlewares/allowRoles";

import {
    createGate,
    getGates,
} from "./gate.controller";
import { PropertyRole } from "../../generated/prisma/enums";
import { loadPropertyAccess } from "../../middlewares/loadPropertyAccess";


const router = Router({ mergeParams: true });

router.post(
    "/",
    verifyJWT,
    loadPropertyAccess,
    allowRoles([
        PropertyRole.OWNER,
        PropertyRole.COMMITTEE,
    ]),
    createGate
);

router.get(
    "/",
    verifyJWT,
    loadPropertyAccess,
    getGates
);

export default router;