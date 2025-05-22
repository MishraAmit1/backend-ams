import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // cb(null, `${file.fieldname}-${uniqueSuffix}${fileExtension}`);
    cb(null, file.originalname);
  },
});

export const upload = multer({
  storage: storage,
  // limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  // fileFilter: (req, file, cb) => {
  //   const filetypes = /jpeg|jpg|png|pdf/;
  //   const mimetype = filetypes.test(file.mimetype);
  //   const extname = filetypes.test(
  //     path.extname(file.originalname).toLowerCase()
  //   );
  //   if (mimetype && extname) {
  //     return cb(null, true);
  //   }
  //   cb(new Error("Only images and PDFs are allowed!"));
  // },
});
