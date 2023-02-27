import express from "express"
import { editUserProfile, getAllUser, userLogIn, userLogOut, userProfile, userRegister } from "../controller/userController"
import authTokenMiddleware from "../middleware/authMiddleware"

const router= express.Router()
router.post('/login', userLogIn)
router.post('/register', userRegister)
router.get('/logout', authTokenMiddleware, userLogOut)
router.route('/profile').get(authTokenMiddleware, userProfile).put(authTokenMiddleware, editUserProfile)
router.get('/all', authTokenMiddleware, getAllUser)

export default router