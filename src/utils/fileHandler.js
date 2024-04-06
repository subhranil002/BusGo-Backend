import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

export const deleteLocalFiles = filePaths => {
    try {
        if (filePaths && filePaths.length > 0) {
            filePaths.forEach(filePath => {
                if (filePath != "") {
                    fs.unlinkSync(filePath);
                }
            });
        }
    } catch (error) {
        console.log("Error while deleting local files: ", error);
    }
};

export const uploadImage = async (localFilePath) => {
    if (localFilePath == "") return null;

    try {
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "image",
            folder: "BusGo-Backend",
            transformation: [
                {
                    width: 200,
                    height: 200,
                    crop: "fill",
                    gravity: "faces:center"
                }
            ]
        });

        deleteLocalFiles([localFilePath]);

        return {
            public_id: response.public_id,
            secure_url: response.secure_url
        };
    } catch (error) {
        deleteLocalFiles([localFilePath]);
        console.log("Error while uploading to Cloudinary: ", error);
    }
};

export const deleteImage = async publicId => {
    try {
        if (publicId == "") return false;

        await cloudinary.uploader.destroy(publicId);

        return true;
    } catch (error) {
        console.error("Error while deleting image from Cloudinary: ", error);
    }
};
