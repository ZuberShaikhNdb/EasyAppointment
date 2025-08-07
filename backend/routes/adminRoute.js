import express from "express";
import Admin from "../models/Admin.js";
import jwt from "jsonwebtoken";
import { loginAdmin, appointmentsAdmin, appointmentCancel, addDoctor, allDoctors, adminDashboard } from '../controllers/adminController.js';
import { changeAvailablity } from '../controllers/doctorController.js';
import authAdmin from '../middleware/authAdmin.js';
import upload from '../middleware/multer.js';

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await Admin.findOne({ email });
    if (exists) return res.json({ success: false, message: "Email already exists" });

    const admin = new Admin({ name, email, password });
    await admin.save();
    res.json({ success: true, message: "Admin registered successfully" });
  } catch (err) {
    res.json({ success: false, message: "Registration failed" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.json({ success: false, message: "Invalid credentials" });

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) return res.json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ success: true, token });
  } catch (err) {
    res.json({ success: false, message: "Login failed" });
  }
});

router.post('/add-doctor', authAdmin, upload.single('image'), addDoctor);
router.get("/appointments", authAdmin, appointmentsAdmin)
router.post("/cancel-appointment", authAdmin, appointmentCancel)
router.get("/all-doctors", authAdmin, allDoctors)
router.post("/change-availability", authAdmin, changeAvailablity)
router.get("/dashboard", authAdmin, adminDashboard)

export default router;