import { randomUUID } from "crypto";
import { existsSync, mkdirSync } from "fs";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const path = "uploads/";
    if (!existsSync(path)) {
      mkdirSync(path, { recursive: true });
    }
    return cb(null, path);
  },
  filename: function (req, file, cb) {
    cb(null, randomUUID());
  },
});

export const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    const fileType = /pdf/;
    const extname = fileType.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = fileType.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      return cb(null, false);
    }
  },
});
