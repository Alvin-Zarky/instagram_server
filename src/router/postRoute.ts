import express from "express"
import { createPostData, deletePostData, getAllPostData, getPostByUser, getSinglePostData, updatePostData, updatePostInfo } from "../controller/postController"
import authTokenMiddleware from "../middleware/authMiddleware"

const router= express.Router()
router.use(authTokenMiddleware)
router.get('/myPost', getPostByUser)
router.route('/').get(getAllPostData).post(createPostData)
router.route('/:id').get(getSinglePostData).put(updatePostInfo).delete(deletePostData)
// router.route('/:id').get(getSinglePostData).put(updatePostData).delete(deletePostData)

export default router