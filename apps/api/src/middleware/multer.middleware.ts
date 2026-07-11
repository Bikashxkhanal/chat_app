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

export const upload = multer({storage : storage});
// can upload single file and multiple file using the upload.

