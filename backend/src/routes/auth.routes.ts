import { Router, Request, Response } from "express";
import { registerUser, loginUser, generatePasswordReset, resetPassword } from "../services/auth.service";

const router = Router();

router.post("/register", async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  try {
    const user = await registerUser(email, password, name);
    res.status(201).json({ message: "User created", userId: user.id });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const { user, token } = await loginUser(email, password);
    res.json({ token, userId: user.id });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

router.post("/forgot-password", async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    await generatePasswordReset(email);
    res.status(200).json({
      message: "If your email is in our system, you will receive a password reset link shortly.",
    });
  } catch (err: any) {
    console.error("Error in forgot-password:", err);
    // Intentionally vague to prevent user enumeration
    res.status(200).json({
      message: `"Error processing your request... ${err.message}"`,
    });
  }
});

router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    await resetPassword(token, newPassword);
    res.json({ message: "Password updated successfully" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});


export default router;
