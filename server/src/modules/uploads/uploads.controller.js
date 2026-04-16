import { getCloudinary } from "../../config/cloudinary.js";

function uploadBufferToCloudinary(cloudinary, fileBuffer, folder, filename) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        public_id: filename,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      },
    );

    stream.end(fileBuffer);
  });
}

export function createUploadsController() {
  const cloudinary = getCloudinary();

  return {
    uploadImages: async (req, res) => {
      try {
        const files = req.files || [];

        if (!files.length) {
          return res.status(400).json({ message: "At least one image file is required." });
        }

        const folder = `sscms/service-requests/${req.user?.sub || "anonymous"}`;

        const uploaded = await Promise.all(
          files.map(async (file) => {
            const safeName = file.originalname.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "-");
            const result = await uploadBufferToCloudinary(
              cloudinary,
              file.buffer,
              folder,
              `${Date.now()}-${safeName}`,
            );

            return {
              url: result.secure_url,
              publicId: result.public_id,
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes,
            };
          }),
        );

        return res.status(201).json({
          message: "Files uploaded successfully.",
          files: uploaded,
        });
      } catch (error) {
        console.error("Upload failed:", error);
        return res.status(500).json({ message: "Failed to upload files." });
      }
    },
  };
}
