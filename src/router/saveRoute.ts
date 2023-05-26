import express from "express"
import { getAllSavePostData, savePostData } from "../controller/saveController"
import authTokenMiddleware from "../middleware/authMiddleware"

const router= express.Router({mergeParams:true})
router.use(authTokenMiddleware)

export default router