import multer from "multer";




const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, "./public");
  },
  filename: (req, file, cb) => {
      cb(null, `${file.fieldname}_${Date.now()}_${file.originalname}`);
  }
});;

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);  // File is accepted
  } else {
    cb(new Error("Invalid file type. Only images are allowed!"), false); 
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, 
});

export default upload;
