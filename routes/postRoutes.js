import express from 'express';
import {deletePost,newPost,getAllPosts, likeUnlikePost,commentonPost,deleteComment,editCaption} from '../controllers/postController.js';
import { isAuth } from "../middlewares/isAuth.js";
import uploadFile from "../middlewares/multer.js";



const router = express.Router();


router.post("/new",isAuth,uploadFile,newPost);
router.put("/:id",isAuth,editCaption);
router.delete("/:id",isAuth,deletePost);
router.get("/all",isAuth,getAllPosts);
router.post("/like/:id",isAuth,likeUnlikePost);
router.post("/comment/:id",isAuth,commentonPost);
router.delete("/comment/:id",isAuth,deleteComment);

export default router;