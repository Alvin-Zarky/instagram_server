import express from "express"
import { editUserProfile, getAllUser, forgetPasswordUser, userLogIn, userLogOut, userProfile, userRegister, resetPasswordUser } from "../controller/userController"
import authTokenMiddleware from "../middleware/authMiddleware"
import { changeDefaultHideLike, findAccountByName, resendEmailVerification, sendEmailVerifyOtp, verifiedEmailConfirmation, verifiedEmailOtp, verifyCodeOtpSms, verifyOtpSms } from "../services/auth/authService"

const router= express.Router()
router.post('/login', userLogIn)
router.post('/register', userRegister)

router.post('/forget/password', forgetPasswordUser)
router.put('/reset/password/:resetToken', resetPasswordUser)

//Verify email with link code
router.get('/account/isVerified/:token', verifiedEmailConfirmation)
router.put('/account/isVerified/resend', resendEmailVerification)

//Verify phone number with code otp
router.post('/account/sms/otp', verifyOtpSms)
router.put('/account/verify/code/sms/otp', verifyCodeOtpSms)

//Verify email with code otp
router.post('/account/email/otp', sendEmailVerifyOtp)
router.put('/account/email/verify/otp', verifiedEmailOtp)

router.get('/logout', authTokenMiddleware, userLogOut)
router.route('/profile').get(authTokenMiddleware, userProfile).put(authTokenMiddleware, editUserProfile)
router.get('/all', authTokenMiddleware, getAllUser)

router.route('/account/:name').get(authTokenMiddleware, findAccountByName)
router.put('/changeHideLike', authTokenMiddleware, changeDefaultHideLike)


export default router