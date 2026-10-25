import { Router } from "express";
import {
    startDuty,
    endDuty,
    getCurrentDuty,
    correctDuty,
} from "./duty.controller";
import { verifyJWT } from "../../middlewares/authMiddleware";
import { loadPropertyAccess } from "../../middlewares/loadPropertyAccess";
import { allowRoles } from "../../middlewares/allowRoles";
import { PropertyRole } from "../../generated/prisma/enums";

const router = Router({ mergeParams: true });

router.use(verifyJWT);
router.use(loadPropertyAccess);

// Start your own duty
router.post(
    "/start",
    allowRoles([PropertyRole.SECURITY]),
    startDuty
);

// End your own duty
router.post(
    "/end",
    allowRoles([PropertyRole.SECURITY]),
    endDuty
);

// View current duty assignments
router.get(
    "/current",
    allowRoles([
        PropertyRole.SECURITY,
        PropertyRole.OWNER,
        PropertyRole.COMMITTEE,
    ]),
    getCurrentDuty
);

// Correct an abandoned duty
router.patch(
    "/:dutyId/correct",
    allowRoles([
        PropertyRole.OWNER,
        PropertyRole.COMMITTEE,
    ]),
    correctDuty
);

export default router;