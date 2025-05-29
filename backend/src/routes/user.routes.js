import express from "express";
import {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

router.post("/login", loginUser);
router.post("/logout", verifyJWT, logOutUser);
router.post("/refresh-token", refreshAccessToken);
export default router;
