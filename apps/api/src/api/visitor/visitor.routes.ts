import { Router } from "express";

import { verifyJWT } from "../../middlewares/authMiddleware";
import { loadPropertyAccess } from "../../middlewares/loadPropertyAccess";
import { allowRoles } from "../../middlewares/allowRoles";

import {
    createVisitorEntry,
    getVisitors,
    approveVisitor,
    checkOutVisitor,
} from "./visitor.controller";

import { PropertyRole } from "../../generated/prisma/enums";

const router = Router({ mergeParams: true });

router.post(
    "/",
    verifyJWT,
    loadPropertyAccess,
    createVisitorEntry
);

router.get(
    "/",
    verifyJWT,
    loadPropertyAccess,
    getVisitors
);

router.patch(
    "/:visitorId/approve",
    verifyJWT,
    loadPropertyAccess,
    allowRoles([
        PropertyRole.SECURITY,
    ]),
    approveVisitor
);

router.patch(
    "/:visitorId/checkout",
    verifyJWT,
    loadPropertyAccess,
    allowRoles([
        PropertyRole.SECURITY,
    ]),
    checkOutVisitor
);

export default router;