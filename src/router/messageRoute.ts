import express from "express"
import authTokenMiddleware from "../middleware/authMiddleware"
import { deleteAllUserMessage, deleteUserMessageText, getAllLastestMessage, getUserMessage, postUserMessage } from "../controller/messageController"

const router= express.Router()
router.use(authTokenMiddleware)
router.get('/all', getAllLastestMessage)
router.post('/:uid', postUserMessage).get('/:uid', getUserMessage)
      .delete('/:uid/all', deleteAllUserMessage)
      .delete('/:uid/:id', deleteUserMessageText)

export default router