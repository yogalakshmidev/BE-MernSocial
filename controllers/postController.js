import TryCatch from "../utils/Trycatch.js";
import getDataUrl from "../utils/urlGenerator.js";
import { v2 as cloudinary } from "cloudinary";
import { Post } from "../models/postModel.js";

export const newPost = TryCatch(async (req, res) => {
  const { caption } = req.body;
  const ownerId = req.user._id;
  const file = req.file;
  const fileUrl = getDataUrl(file);
  let option;
  const type = req.query.type;

  if (type === "reel") {
    option = {
      resource_type: "video",
    };
  } else {
    // checking
    option = {  };
  }

  const myCloud = await cloudinary.uploader.upload(fileUrl.content, option);

  const post = await Post.create({
    caption,
    post: {
      id: myCloud.public_id,
      url: myCloud.secure_url,
    },
    owner: ownerId,
    type,
  });
  res.status(201).json({
    message: "Post created successfully",
    success: true,
    data: post,
  });
});

export const deletePost = TryCatch(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post)
    return res.status(400).json({
      message: "No post with this id",
      success: false,
    });

  if (post.owner.toString() !== req.user._id.toString())
    return res.status(403).json({
      message: "Unauthorized",
      success: false,
    });

  await cloudinary.uploader.destroy(post.post.id);

  await post.deleteOne();

  res.json({
    message: "Post Deleted Successfully",
    success: true,
    // data:post
  });
});

export const getAllPosts = TryCatch(async (req, res) => {
  const posts = await Post.find({ type: "post" })
    .sort({ createdAt: -1 })
    .populate("owner", "-password")
    .populate({
      path: "comments.user",
      select: "-password",
    });

  const reels = await Post.find({ type: "reel" })
    .sort({ createdAt: -1 })
    .populate("owner", "-password")
    .populate({
      path: "comments.user",
      select: "-password",
    });

  res.json({ message: "Get all post done", success: true, data: posts, reels });
});

export const likeUnlikePost = TryCatch(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post)
    return res.status(404).json({
      message: "No post with this id",
      success: false,
    });

  if (post.likes.includes(req.user._id)) {
    const index = post.likes.indexOf(req.user._id);
    post.likes.splice(index, 1);
    await post.save();
    res.json({ message: `${req.user.name} unliked your post`, success: false });
  } else {
    post.likes.push(req.user._id);
    await post.save();
    res.json({ message: `${req.user.name} liked your post`, success: false });
  }
});

export const commentonPost = TryCatch(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post)
    return res.status(404).json({
      message: "No post with this id",
      success: false,
    });

  post.comments.push({
    user: req.user._id,
    name: req.user.name,
    comment: req.body.comment,
  });

  await post.save();

  res.status(200).json({
    message: "Comment added",
    success: true,
  });
});

export const deleteComment = TryCatch(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post)
    return res.status(404).json({
      message: "No post with this id",
      success: false,
    });

  if (!req.query.commentId)
    return res.status(404).json({
      message: "Please give comment id",
      success: false,
    });

  const commentIndex = post.comments.findIndex(
    (item) => item._id.toString() === req.query.commentId.toString()
  );

  if (commentIndex === -1) {
    return res.status(400).json({
      message: "Comment not found",
      success: false,
    });
  }

  const comment = post.comments[commentIndex];

  if (
    post.owner.toString() === req.user._id.toString() ||
    comment.user.toString() === req.user._id.toString()
  ) {
    post.comments.splice(commentIndex, 1);

    await post.save();

    return res.status(200).json({
      message: "Comment deleted successfully",
      success: true,
    });
  } else {
    return res.status(400).json({
      message: "You are not allowed to delete this comment",
      success: true,
    });
  }
});

// Edit post
export const editCaption = TryCatch(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post)
    return res.data.status(404).json({
      message: "No post with this id",
      success: false,
    });

  if (post.owner.toString() !== req.user._id.toString())
    return res.status(403).json({
      message: "You are not the owner of this post",
      success: false,
    });

  post.caption = req.body.caption;

  await post.save();

  res.json({
    message: "Post updated",
    success: true,
  });
});
