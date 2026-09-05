import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import productsRouter from "./products";
import ordersRouter from "./orders";
import customersRouter from "./customers";
import dashboardRouter from "./dashboard";
import adminUsersRouter from "./admin-users";
import notificationsRouter from "./notifications";
import storeSettingsRouter from "./store-settings";
import storageRouter from "./storage";
import productImportRouter from "./product-import";
import contactRouter from "./contact";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(productImportRouter);
router.use(contactRouter);
router.use(productsRouter);
router.use(ordersRouter);
router.use(customersRouter);
router.use(dashboardRouter);
router.use(adminUsersRouter);
router.use(notificationsRouter);
router.use(storeSettingsRouter);
router.use(storageRouter);

export default router;
