import express from "express"
import authTokenMiddleware from "../middleware/authMiddleware"
import { deleteUserChat, getUserChat, postUserChat, updateUserChat } from "../controller/chatController"

const router= express.Router()
router.use(authTokenMiddleware)
router.route('/').post(postUserChat).get(getUserChat)
router.route('/:id').put(updateUserChat).delete(deleteUserChat)

export default router