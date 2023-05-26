import express from "express"
import authTokenMiddleware from "../middleware/authMiddleware"
import { getAllNotification } from "../controller/notificationController"

const router= express.Router()
router.use(authTokenMiddleware)
router.get('/allActivities',getAllNotification)

export default router