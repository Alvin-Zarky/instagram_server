import express from "express"
import { createPostData, deletePostData, getAllPostData, getPostByAccount, getPostByUser, getSinglePostData, updatePostData } from "../controller/postController"
import authTokenMiddleware from "../middleware/authMiddleware"
import { getAllSavePostData, savePostData } from "../controller/saveController"

const router= express.Router()
router.use(authTokenMiddleware)

router.get('/save', getAllSavePostData)
router.post('/:id/save', savePostData)

router.get('/myPost', getPostByUser)
router.route('/').get(getAllPostData).post(createPostData)
router.route('/:id').get(getSinglePostData).put(updatePostData).delete(deletePostData)

router.get('/account/:name', getPostByAccount)

export default router