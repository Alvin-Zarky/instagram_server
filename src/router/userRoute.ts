import express from "express"
import { userLogIn, userLogOut, userProfile, userRegister } from "../controller/userController"

const router= express.Router()
router.post('/login', userLogIn)
router.post('/register', userRegister)
router.get('/logout', userLogOut)
router.get('/profile', userProfile)

export default router