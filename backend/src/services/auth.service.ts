import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendResetEmail } from "../utils/mailer";
import crypto from "crypto";
import { addHours, isAfter } from "date-fns";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const BASE_URL = process.env.BASE_URL || "http://localhost";
const PORT = process.env.PORT || "8080";

export async function registerUser(email: string, password: string, name: string) {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, password: hashedPassword , name },
  });

  return user;
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("No user associated with this email");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

  return { user, token };
}


export async function generatePasswordReset(email: string) {

  if (!email) throw new Error("Email is required");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  const token = crypto.randomBytes(4).toString("hex").toUpperCase();
  const expiry = addHours(new Date(), 1);

  await prisma.user.update({
    where: { email },
    data: { resetToken: token, resetTokenExp: expiry },
  });

  await sendResetEmail(email, token);
}

export async function resetPassword(token: string, newPassword: string) {
  const user = await prisma.user.findFirst({ where: { resetToken: token.toUpperCase() } });
  console.log("token:", token, "user:", user, "newPassword:", newPassword);

  if (!user || !user.resetTokenExp || isAfter(new Date(), user.resetTokenExp)) {
    throw new Error("Invalid or expired token");
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashed,
      resetToken: null,
      resetTokenExp: null,
    },
  });

  return true;
}

