import express from "express";
import Doctor from "../models/Doctor.js";
import jwt from "jsonwebtoken";
import { loginDoctor, appointmentsDoctor, appointmentCancel, doctorList, changeAvailablity, appointmentComplete, doctorDashboard, doctorProfile, updateDoctorProfile } from '../controllers/doctorController.js';
import authDoctor from '../middleware/authDoctor.js';

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await Doctor.findOne({ email });
    if (exists) return res.json({ success: false, message: "Email already exists" });

    const doctor = new Doctor({ name, email, password });
    await doctor.save();
    res.json({ success: true, message: "Doctor registered successfully" });
  } catch (err) {
    res.json({ success: false, message: "Registration failed" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await Doctor.findOne({ email });
    if (!doctor) return res.json({ success: false, message: "Invalid credentials" });

    const isMatch = await doctor.matchPassword(password);
    if (!isMatch) return res.json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ success: true, token });
  } catch (err) {
    res.json({ success: false, message: "Login failed" });
  }
});

router.post("/cancel-appointment", authDoctor, appointmentCancel)
router.get("/appointments", authDoctor, appointmentsDoctor)
router.get("/list", doctorList)
router.post("/change-availability", authDoctor, changeAvailablity)
router.post("/complete-appointment", authDoctor, appointmentComplete)
router.get("/dashboard", authDoctor, doctorDashboard)
router.get("/profile", authDoctor, doctorProfile)
router.post("/update-profile", authDoctor, updateDoctorProfile)

export default router;