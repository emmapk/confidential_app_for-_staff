import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join("public/uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${file.fieldname}_${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); 
  } else {
    cb(new Error("Invalid file type. Only images are allowed!"), false); 
  }
};

// Configure multer
const upload = multer({
  storage, 
  fileFilter, 
  limits: { fileSize: 2 * 1024 * 1024 }, 
});

export default upload;
