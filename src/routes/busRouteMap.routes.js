import {
    addRouteMap,
    deleteRouteMap,
    getRouteMap,
    updateRouteMap
} from "../controllers/busRouteMap.controller.js";
import { Router } from "express";
import {} from "../middlewares/auth.middleware.js";

const busRouteMapRouter = Router();

busRouteMapRouter.route("/add").post(addRouteMap);
busRouteMapRouter.route("/get/:routeID").get(getRouteMap);
busRouteMapRouter.route("/update/:routeID").put(updateRouteMap);
busRouteMapRouter.route("/delete/:routeID").delete(deleteRouteMap);

export default busRouteMapRouter;
