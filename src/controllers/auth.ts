import expressAsyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import { ValidationErrorItem } from "joi";
import { prisma } from "../prismaClient";
import { loginSchema, registerSchema } from "../validation/auth";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import { AuthenticatedRequest } from "@/types/requests";
import { promises } from "fs";

export const registerUser = expressAsyncHandler(async (req, res) => {
  const { error, value } = registerSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    res.status(400).json({
      message: "Validation error",
      details: error.details.map((err: ValidationErrorItem) => err.message),
    });
    return;
  }

  const user = await prisma.users.findUnique({
    where: { email: value.email },
  });

  if (user) {
    res.status(400).json({
      message: "User with this email already exists",
    });
    return;
  }

  const hashed = await bcrypt.hash(value.password, 10);

  const newUser = await prisma.users.create({
    data: {
      name: value.name,
      birthdate: value.birthdate,
      email: value.email,
      password: hashed,
    },
  });

  res.json({
    message: `Account for ${newUser.email} was created`,
  });
});

export const loginUser = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { error } = loginSchema.validate(req.body, { abortEarly: false });
  if (error) {
    res.status(400).json({
      message: "Validation error",
      details: error.details.map((err: ValidationErrorItem) => err.message),
    });
    return;
  }

  const user = await prisma.users.findUnique({
    where: { email },
  });

  if (!user) {
    res.status(400).json({
      message: "Invalid email or password",
    });
    return;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    res.status(400).json({
      message: "Invalid email or password",
    });
    return;
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET as string,
    { expiresIn: "1800s" }
  );

  res.json({
    message: "Login successful",
    token,
  });
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
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

export const saveUserDocuments = expressAsyncHandler(
  async (req: AuthenticatedRequest, res) => {
    upload.single("document")(req, res, async () => {
      const { user } = req;
      const { name } = req.body;
      const email = user.email;
      const userInfo = await prisma.users.findUnique({
        where: { email: email },
      });

      if (!userInfo) {
        res.status(400).json({
          message: "user",
        });
        return;
      }

      if (!req.file) {
        return res
          .status(400)
          .json({ message: "No file uploaded or invalid file format" });
      }

      const newDocument = await prisma.userDocuments.create({
        data: {
          name: name,
          url: `uploads/${req.file.filename}`,
          user_id: userInfo.id,
        },
      });

      res.json({
        message: "Document uploaded successfully",
        document: newDocument,
      });
    });
  }
);
