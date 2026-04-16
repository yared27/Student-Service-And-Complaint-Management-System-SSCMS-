import multer from "multer";

const imageMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const storage = multer.memoryStorage();

function fileFilter(_req, file, cb) {
  if (!imageMimeTypes.has(file.mimetype)) {
    cb(new Error("Only image files are allowed."));
    return;
  }

  cb(null, true);
}

export const uploadImages = multer({
  storage,
  limits: {
    files: 6,
    fileSize: 8 * 1024 * 1024,
  },
  fileFilter,
}).array("files", 6);

export function handleUploadImages(req, res, next) {
  uploadImages(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        res.status(400).json({ message: "Each file must be 8MB or smaller." });
        return;
      }

      if (error.code === "LIMIT_FILE_COUNT") {
        res.status(400).json({ message: "You can upload up to 6 files." });
        return;
      }
    }

    res.status(400).json({ message: error.message || "Invalid upload payload." });
  });
}
