import bcrypt from "bcrypt";
import expressAsyncHandler from "express-async-handler";
import { ValidationErrorItem } from "joi";
import jwt from "jsonwebtoken";

import { prisma } from "@/prismaClient";
import { AuthenticatedRequest } from "@/types/requests";
import { upload } from "@/utils/uploadFile";
import { loginSchema, registerSchema } from "@/validation/auth";

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
      message: "User with this email already exist",
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
          message: "user does not exist",
        });
        return;
      }

      if (!req.file) {
        return res
          .status(400)
          .json({ message: "Error when uploading the file" });
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
