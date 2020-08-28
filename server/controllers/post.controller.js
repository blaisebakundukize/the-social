import formidable from "formidable";
import fs from "fs";

import Post from "../models/post.model";
import errorHandler from "../helpers/dbErrorHandler";

const create = (req, res, next) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Image could not be uploaded",
      });
    }
    let post = new Post(fields);
    post.postedBy = req.profile;
    if (files.photo) {
      post.photo.data = fs.readFileSync(files.photo.path);
      post.photo.contentType = files.photo.type;
    }
    try {
      let result = await post.save();
      res.status(201).json(result);
    } catch (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err),
      });
    }
  });
};

const listNewsFeed = async (req, res) => {
  let following = req.profile.following;
  following.push(req.profile._id);
  try {
    let posts = await Post.find({
      postedBy: { $in: req.profile.following },
    })
      .populate("comments.postedBy", "_id name")
      .populate("postedBy", "_id name")
      .sort("-created")
      .exec();
    res.status(200).json(posts);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const listByUser = async (req, res) => {
  try {
    let posts = await Post.find({ postedBy: req.profile._id })
      .populate("comments.postedBy", "_id name")
      .populate("postedBy", "_id name")
      .sort("-created")
      .exec();
    res.status(200).json(posts);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const postById = async (req, res, next, id) => {
  try {
    let post = await Post.findById(id).populate("postedBy", "_id name").exec();
    if (!post) {
      return res.status("404").json({
        error: "Post not found",
      });
    }
    req.post = post;
    next();
  } catch (err) {
    console.log(err.message);
    return res.status("400").json({
      error: "Could not retrieve use post",
    });
  }
};

const photo = (req, res, next) => {
  res.set("Content-Type", req.post.photo.contentType);
  return res.send(req.post.photo.data);
};

export default { create, listNewsFeed, listByUser, postById, photo };
