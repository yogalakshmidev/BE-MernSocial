import express from 'express'
import {isAuth} from '../middlewares/isAuth.js';
import {sendMessage,getAllMessages} from '../controllers/messageController.js';



const router = express.Router();

router.post("/",isAuth ,sendMessage);
router.get("/:id",isAuth ,getAllMessages);
// router.get("/chats",isAuth ,getAllChats);


export default router;
