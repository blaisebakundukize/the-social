import express from "express";
import authCtrl from "../controllers/auth.controller";
import userCtrl from "../controllers/user.controller";
import postCtrl from "../controllers/post.controller";

const router = express.Router();

router
  .route("/api/posts/feed/:userId")
  .get(authCtrl.requireSignin, postCtrl.listNewsFeed);

router.param("userId", userCtrl.userById);

export default router;
