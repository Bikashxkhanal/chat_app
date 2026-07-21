import multer from 'multer'
import path from "node:path"

const storage = multer.diskStorage({

    // setting destination where to keep the file 
    destination: (req, file, callback) => {
        callback(null, "public/uploads")
    },

    // setting up the unique filename for the files uploaded
    filename(req, file, callback) {
        callback(null, Date.now() + "-" + file.originalname)
    },


})

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, callback) => {
        if (!allowedMimeTypes.has(file.mimetype)) {
            callback(new Error("Only JPG, JPEG, PNG, and WEBP images are allowed"));
            return;
        }
        callback(null, true);
    },
});
// can upload single file and multiple file using the upload.

