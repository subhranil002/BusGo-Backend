import { BusRouteMap } from "../models/busRouteMap.model.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

export const addRouteMap = asyncHandler(async (req, res, next) => {
    try {
        // Get route map details from request
        const { routeID, origin, destination, stops, fareChart } = req.body;

        // Validate input fields
        if (
            !routeID ||
            !origin ||
            !destination ||
            !Array.isArray(stops) ||
            !stops.length ||
            !Array.isArray(fareChart) ||
            !fareChart.length
        ) {
            throw new ApiError("All fields are required", 400);
        }
        if (routeID.length < 2 || routeID.length > 10) {
            throw new ApiError(
                "Route ID must be between 2 and 10 characters",
                400
            );
        }

        // Validate stops
        stops.map(stop => {
            if (
                typeof stop.stopNumber !== "number" ||
                !stop.name ||
                typeof stop.distanceFromOrigin !== "number" ||
                typeof stop.timetakenFromOrigin !== "number"
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

        // Validate fare chart
        fareChart.map(fare => {
            if (
                typeof fare.kmUpperLimit !== "number" ||
                typeof fare.fare !== "number"
            ) {
                throw new ApiError("All fare chart fields are required", 400);
            }
            if (fare.kmUpperLimit < 0) {
                throw new ApiError(
                    "Km upper limit must be a positive number",
                    400
                );
            }
            if (fare.fare < 0) {
                throw new ApiError("Fare must be a positive number", 400);
            }
        });
        if (
            fareChart[fareChart.length - 1].kmUpperLimit <
            stops[stops.length - 1].distanceFromOrigin
        ) {
            throw new ApiError(
                "Fare chart maximum kmUpperLimit must be greater than the maximum distance between origin and destination",
                400
            );
        }

        // If Route ID already exists
        const isRouteIDExists = await BusRouteMap.findOne({ routeID });
        if (isRouteIDExists) {
            throw new ApiError("Route ID already exists", 400);
        }

        // Create new route map
        const routeMap = await BusRouteMap.create({
            routeID,
            origin,
            destination,
            stops,
            fareChart
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
        const routeMap = await BusRouteMap.findOne({ routeID }).select(
            "-fareChart"
        );
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
        const { origin, destination, stops, fareChart } = req.body;

        // Validate input fields
        if (!origin || !destination || !stops.length || !fareChart.length) {
            throw new ApiError("All fields are required", 400);
        }

        // Validate stops
        stops.map(stop => {
            if (
                typeof stop.stopNumber !== "number" ||
                !stop.name ||
                typeof stop.distanceFromOrigin !== "number" ||
                typeof stop.timetakenFromOrigin !== "number"
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

        // Validate fare chart
        fareChart.map(fare => {
            if (
                typeof fare.kmUpperLimit !== "number" ||
                typeof fare.fare !== "number"
            ) {
                throw new ApiError("All fare chart fields are required", 400);
            }
            if (fare.kmUpperLimit < 0) {
                throw new ApiError(
                    "Km upper limit must be a positive number",
                    400
                );
            }
            if (fare.fare < 0) {
                throw new ApiError("Fare must be a positive number", 400);
            }
        });
        if (
            fareChart[fareChart.length - 1].kmUpperLimit <
            stops[stops.length - 1].distanceFromOrigin
        ) {
            throw new ApiError(
                "Fare chart maximum kmUpperLimit must be greater than the maximum distance between origin and destination",
                400
            );
        }

        // Update route map
        const updatedRouteMap = await BusRouteMap.findOneAndUpdate(
            { routeID },
            {
                origin,
                destination,
                stops,
                fareChart
            },
            { new: true }
        );
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

export const getBusByRoute = asyncHandler(async (req, res, next) => {
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

        // Get buses by route
        const busNumbers = await User.aggregate([
            {
                $match: {
                    routeID: routeID
                }
            },
            {
                $project: {
                    _id: 0,
                    busNumber: 1
                }
            }
        ]);
        if (!busNumbers.length) {
            throw new ApiError("No buses found", 404);
        }

        // Send response
        return res
            .status(200)
            .json(new ApiResponse("Buses retrieved", busNumbers));
    } catch (error) {
        return next(
            new ApiError(
                `busRoute.controller :: getBusByRoute :: ${error}`,
                error.statusCode
            )
        );
    }
});
