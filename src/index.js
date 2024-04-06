import app from "./app.js";
import constants from "./constants.js";
import connectDB from "./config/db.config.js";
import connectCloudinary from "./config/cloudinary.config.js";

connectDB()
    .then(() => {
        connectCloudinary()
            .finally(() => {
                app.listen(constants.PORT || 3000, async () => {
                    console.log(`Server running on port ${constants.PORT}`);
                });
            })
    })
