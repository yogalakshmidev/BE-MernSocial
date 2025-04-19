import TryCatch from "../utils/TryCatch.js"
import {Chat} from "../models/ChatModel.js"
import {Messages} from "../models/Messages.js"

export const sendMessage = TryCatch(async (req,res) => {
  const {receiverId, message}= req.body;
  
  const senderId = req.user._id;

if(!receiverId)
  return res.status(400).json({
message:"Please give receiver id",success:false});

  let chat = await Chat.findOne({
    users:{$all:[senderId,receiverId]},
  });
  if(!chat){
    chat = new Chat({
      users:[senderId,receiverId],
      latestMessage:{
        text: message,
        sender: senderId,
      },
    });
    await chat.save();
  }

  const newMessage = new Messages({
    chatId: chat._id,
    sender: senderId,
    text: message,
  });

  await newMessage.save();

  await chat.updateOne({
    latestMessage:{
      text: message,
      sender: senderId
    },
  });

  res.status(201).json({message:"Chat created",success:true,data:newMessage});
})


export const getAllMessages = TryCatch(async (req,res) => {
  const {id}= req.params;
  const userId = req.user._id;
  const chat = await Chat.findOne({
    users: {$all:[userId,id]},
  });

  if(!chat){
    return res.status(404).json({message:"No chat with these users",success:false});
  }

  const messages = await Messages.find({
    chatId:chat._id,
  });

  res.status(200).json({message:"get all chat messages done",success:true});
  
})

// export const getAllChats = TryCatch(async (req,res) => {
//   const chats = await Chat.find({
//     users:req.user._id}).populate({
//       path:"users",
//       select:"name profilePic"
//     })

//   res.status(200).json({message:"All chat details are displayed", success:true,data:chats});
  
// })