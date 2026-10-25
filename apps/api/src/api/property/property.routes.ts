import { Router } from "express";

import gateRoutes from '../gate/gate.routes'
import userRoutes from '../user/user.routes'
import visitorRoutes from '../visitor/visitor.routes'
import dutyRoutes from '../duty/duty.routes'



import {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
} from "./property.controller";

import { verifyJWT } from "../../middlewares/authMiddleware";
import { loadPropertyAccess } from "../../middlewares/loadPropertyAccess";

const router = Router();

router.use('/:propertyId/gates', gateRoutes);
router.use('/:propertyId/users', userRoutes);
router.use('/:propertyId/visitors', visitorRoutes);
router.use("/:propertyId/duty", dutyRoutes);

router.post(
  "/",
  verifyJWT,
  createProperty
);

router.get(
  "/",
  verifyJWT,
  getProperties
);

router.get(
  "/:propertyId",
  verifyJWT,
  loadPropertyAccess,
  getProperty
);

router.patch(
  "/:propertyId",
  verifyJWT,
  loadPropertyAccess,
  updateProperty
);

export default router;