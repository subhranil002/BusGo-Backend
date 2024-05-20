import { BusRouteMap } from "../models/busRouteMap.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

export const addRouteMap = asyncHandler(async (req, res, next) => {
    try {
        // Get route map details from request
        const { routeID, origin, destination, stops } = req.body;

        // Validate input fields
        if (!routeID || !origin || !destination || !stops.length) {
            throw new ApiError("All fields are required", 400);
        }
        if (routeID.length < 2 || routeID.length > 10) {
            throw new ApiError(
                "Route ID must be between 3 and 15 characters",
                400
            );
        }

        // Validate stops
        stops.map(stop => {
            if (
                !stop.stopNumber ||
                !stop.name ||
                !stop.distanceFromOrigin ||
                !stop.timetakenFromOrigin
            ) {
                throw new ApiError("All stop fields are required", 400);
            }
            if (stop.name.length > 50 || stop.name.length < 3) {
                throw new ApiError(
                    "Stop name must be between 3 and 50 characters",
                    400
                );
            }
            if (stop.distanceFromOrigin < 0) {
                throw new ApiError(
                    "Distance from origin must be a positive number",
                    400
                );
            }
            if (stop.timetakenFromOrigin < 0) {
                throw new ApiError(
                    "Time taken from origin must be a positive number",
                    400
                );
            }
        });

        // Create new route map
        const routeMap = new BusRouteMap.create({
            routeID,
            origin,
            destination,
            stops
        });

        // Send response
        return res
            .status(201)
            .json(new ApiResponse("Route map created", routeMap));
    } catch (error) {
        return next(
            new ApiError(
                `busRoute.controller :: addRouteMap :: ${error}`,
                error.statusCode
            )
        );
    }
});

export const getRouteMap = asyncHandler(async (req, res, next) => {
    try {
        // Get routeID from params
        const { routeID } = req.params;

        // Validate input field
        if (!routeID) {
            throw new ApiError("Route ID is required", 400);
        }
        if (routeID.length < 2 || routeID.length > 10) {
            throw new ApiError(
                "Route ID must be between 3 and 15 characters",
                400
            );
        }

        // Get route map
        const routeMap = await BusRouteMap.findOne({ routeID });
        if (!routeMap) {
            throw new ApiError("Route map not found", 404);
        }

        // Send response
        return res
            .status(200)
            .json(new ApiResponse("Route map retrieved", routeMap));
    } catch (error) {
        return next(
            new ApiError(
                `busRoute.controller :: getRouteMap :: ${error}`,
                error.statusCode
            )
        );
    }
});

export const updateRouteMap = asyncHandler(async (req, res, next) => {
    try {
        // Get routeID from params
        const { routeID } = req.params;

        // Validate input field
        if (!routeID) {
            throw new ApiError("Route ID is required", 400);
        }
        if (routeID.length < 2 || routeID.length > 10) {
            throw new ApiError(
                "Route ID must be between 3 and 15 characters",
                400
            );
        }

        // Get route map
        const routeMap = await BusRouteMap.findOne({ routeID });
        if (!routeMap) {
            throw new ApiError("Route map not found", 404);
        }

        // Get route map details from request
        const { origin, destination, stops } = req.body;

        // Validate input fields
        if (!origin || !destination || !stops.length) {
            throw new ApiError("All fields are required", 400);
        }

        // Validate stops
        stops.map(stop => {
            if (
                !stop.stopNumber ||
                !stop.name ||
                !stop.distanceFromOrigin ||
                !stop.timetakenFromOrigin
            ) {
                throw new ApiError("All stop fields are required", 400);
            }
            if (stop.name.length > 50 || stop.name.length < 3) {
                throw new ApiError(
                    "Stop name must be between 3 and 50 characters",
                    400
                );
            }
            if (stop.distanceFromOrigin < 0) {
                throw new ApiError(
                    "Distance from origin must be a positive number",
                    400
                );
            }
            if (stop.timetakenFromOrigin < 0) {
                throw new ApiError(
                    "Time taken from origin must be a positive number",
                    400
                );
            }
        });

        // Update route map
        const updatedRouteMap = await routeMap.update({
            origin,
            destination,
            stops
        });
        if (!updatedRouteMap) {
            throw new ApiError("Error while updating route map", 400);
        }

        // Send response
        return res
            .status(200)
            .json(new ApiResponse("Route map updated", updatedRouteMap));
    } catch (error) {
        return next(
            new ApiError(
                `busRoute.controller :: updateRouteMap :: ${error}`,
                error.statusCode
            )
        );
    }
});

export const deleteRouteMap = asyncHandler(async (req, res, next) => {
    try {
        // Get routeID from params
        const { routeID } = req.params;

        // Validate input field
        if (!routeID) {
            throw new ApiError("Route ID is required", 400);
        }
        if (routeID.length < 2 || routeID.length > 10) {
            throw new ApiError(
                "Route ID must be between 3 and 15 characters",
                400
            );
        }

        // Delete route map
        const deletedRouteMap = await BusRouteMap.deleteOne({ routeID });
        if (!deletedRouteMap) {
            throw new ApiError("Error while deleting route map", 400);
        }

        // Send response
        return res
            .status(200)
            .json(new ApiResponse("Route map deleted successfully", {}));
    } catch (error) {
        return next(
            new ApiError(
                `busRoute.controller :: deleteRouteMap :: ${error}`,
                error.statusCode
            )
        );
    }
});
