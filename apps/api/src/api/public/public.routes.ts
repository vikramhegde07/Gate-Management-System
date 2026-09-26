import { Router } from "express";

import {
    getPublicProperty,
    createPublicVisitorEntry,
} from "./public.controller";

const router = Router();

router.get(
    "/property/:propertyId",
    getPublicProperty
);

router.post(
    "/property/:propertyId/visitor-entry",
    createPublicVisitorEntry
);

export default router;