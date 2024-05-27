import {
    addRouteMap,
    deleteRouteMap,
    getBusByRoute,
    getRouteMap,
    updateRouteMap
} from "../controllers/busRouteMap.controller.js";
import { Router } from "express";
import {
    authorizedRoles,
    isLoggedIn,
    isVerified
} from "../middlewares/auth.middleware.js";

const busRouteMapRouter = Router();

busRouteMapRouter
    .route("/add")
    .post(isLoggedIn, isVerified, authorizedRoles("ADMIN"), addRouteMap);
busRouteMapRouter
    .route("/get-stops/:routeID")
    .get(isLoggedIn, isVerified, getRouteMap);
busRouteMapRouter
    .route("/update/:routeID")
    .put(isLoggedIn, isVerified, authorizedRoles("ADMIN"), updateRouteMap);
busRouteMapRouter
    .route("/delete/:routeID")
    .delete(isLoggedIn, isVerified, authorizedRoles("ADMIN"), deleteRouteMap);
busRouteMapRouter.route("/get-buses/:routeID").get(isLoggedIn, isVerified, getBusByRoute);

export default busRouteMapRouter;
