import expressAsyncHandler from "express-async-handler";
import User from "../../model/User";
import { Op } from "sequelize";
import ResponseError from "../../utility/customError";
import { userProperties } from "../../helper/userObjectResult";
import { UserSchema, VerifiedValue } from "../../types/user";
import crypto from "crypto";
import { RequestHandler } from "express";
import { Twilio } from "twilio";
import AuthTesting from "../../model/AuthTesting";
import sendMailer from "../../helper/sendMailer";
import generateUserToken from "../../helper/generateUserToken";

const client = new Twilio(process.env.ACCOUNT_SID, process.env.ACCOUNT_TOKEN);
const findAccountByName = expressAsyncHandler(async (req, res, next) => {
  const user = await User.findOne({
    where: {
      name: {
        [Op.iLike]: req.params.name.toLowerCase(),
      },
      id: {
        [Op.not]: req.user.id,
      },
    },
  });

  if (!user) {
    throw new ResponseError(`User account not found`, 404);
  }
  res.status(200).json({
    success: true,
    data: userProperties(user),
  });
});

const changeDefaultHideLike = expressAsyncHandler(async (req, res, next) => {
  const { hideLike } = req.body;
  const user = (await User.findByPk(req.user.id)) as UserSchema;
  if (!user) {
    throw new ResponseError(`User not found`, 404);
  }

  user.isHideLike = hideLike;
  await user.save();

  res.status(200).json({
    success: true,
    data: user,
  });
});

const verifiedEmailConfirmation = expressAsyncHandler(
  async (req, res, next) => {
    const { token } = req.params;
    const tokenBcrypt = crypto.createHash("sha256").update(token).digest("hex");

    const accountVerify = (await User.findOne({
      where: {
        verifiedToken: tokenBcrypt,
        // verifiedExpired: { [Op.gt]: Date.now() }
      },
    })) as UserSchema;

    if (!accountVerify) {
      throw new ResponseError("Invalid token verify", 401);
    }

    accountVerify.isVerified = true;
    accountVerify.verifiedToken = null;
    accountVerify.verifiedExpired = null;
    await accountVerify.save();``

    res.status(200).json({
      success: true,
      data: {
        ...accountVerify,
        token: generateUserToken(accountVerify.id?.toString()!)
      },
    });
  }
);

const resendEmailVerification: RequestHandler = expressAsyncHandler(
  async (req, res, next) => {
    const { id } = req.body;

    const refreshToken = crypto.randomBytes(20).toString("hex");
    const date = Date.now() + 10 * 60 * 1000;

    const updateToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    const user = (await User.findByPk(id)) as UserSchema;

    if(!user){
      throw new ResponseError("User verification failed", 404)
    }

    if (!user.isVerified) {
      user.verifiedExpired = date;
      user.verifiedToken = updateToken;

      await user.save();

      res.status(200).json({
        success: true,
        data: user,
      });

      const verifiedUrl = `${req.protocol}://${process.env.VERIFIED_ACCOUNT_URL}/${refreshToken}`;
      const html = `
      <p>Hello ${user.name}</p>
      <p>To activate your Account, please verify your email address</p>
      <p>Your account will not be created until your email address is confirmed.</p>
      <p>${verifiedUrl}</p>
      <p>Note that this link will expire after 10 minutes. Your account won't verify until you access the link above and create a new one.</p>
      <p style="color: grey">Instagram Clone</p>
    `;
      const options = {
        email: user.email,
        subject: "Verifiy your account",
        html,
      };

      return await sendMailer(options);
    }else{
      throw new ResponseError("Invalid token", 401)
    }
  }
);

const verifyOtpSms: RequestHandler = expressAsyncHandler(
  async (req, res, next) => {
    const { phoneNumber, countryCode } = req.body;
    if (!phoneNumber) {
      throw new ResponseError("Please input the phone number", 400);
    }
    if (!countryCode) {
      throw new ResponseError("Please input the country code", 400);
    }

    try {
      const responseOtp = await client.verify.v2
        .services(process.env.SERVICE_SID as string)
        .verifications.create({
          to: `${countryCode}${phoneNumber}`,
          channel: "sms",
        });
      // const responseOtp= await client.messages.create({
      //   body: 'Your account verification code for instagram clone is here',
      //   to:`${countryCode}${phoneNumber}`,
      // })
      res.status(201).json({
        success: true,
        data: responseOtp,
      });
    } catch (err) {
      throw new ResponseError("Verification failed", 400);
    }
  }
);

const verifyCodeOtpSms: RequestHandler = expressAsyncHandler(
  async (req, res, next) => {
    const { phoneNumber, countryCode, codeOtp } = req.body;

    if (!phoneNumber) {
      throw new ResponseError("Please input the phone number", 400);
    }
    if (!countryCode) {
      throw new ResponseError("Please input the country code", 400);
    }
    if (!codeOtp) {
      throw new ResponseError("Please input the code otp", 400);
    }

    try {
      const verifyOtp = await client.verify.v2
        .services(process.env.SERVICE_SID as string)
        .verificationChecks.create({
          to: `${countryCode}${phoneNumber}`,
          code: codeOtp,
        });
      res.status(200).json({
        success: true,
        data: verifyOtp,
      });
    } catch (err) {
      throw new ResponseError("Code verification invalid", 400);
    }
  }
);

const sendEmailVerifyOtp: RequestHandler = expressAsyncHandler(
  async (req, res, next) => {
    const { name, email } = req.body;
    if (!name) {
      throw new ResponseError("Please input the name", 400);
    }
    if (!email) {
      throw new ResponseError("Please input the email", 400);
    }

    const nameAlreadyExist = await AuthTesting.findOne({
      where: { name: { [Op.iLike]: name.toLowerCase() } },
    });
    if (nameAlreadyExist) {
      throw new ResponseError("Name already existed", 401);
    }

    const emailAlreadyExist = await AuthTesting.findOne({
      where: { email: { [Op.iLike]: email.toLowerCase() } },
    });
    if (emailAlreadyExist) {
      throw new ResponseError("Email already existed", 401);
    }

    const codeOtp = Math.floor(100000 + Math.random() * 900000);
    const codeExpired = Date.now() + 10 * 60 * 1000;
    const emailVerified = await AuthTesting.create({
      name,
      email,
      code: codeOtp,
      codeExpired,
    });

    res.status(201).json({
      success: true,
      data: emailVerified,
    });

    const html = `
    <p>Hello ${name}</p>
    <p>To activate your Account, please verify your email address</p>
    <p>Your account will not be created until your email address is confirmed.</p>
    <p>Enter this 6 digit code on the sign in page to confirm your identity:</p>
    <p>${codeOtp}</p>
    <p>Note that this link will expire after 10 minutes. Your account won't verify until you access the link above and create a new one.</p>
    <p style="color: grey">Instagram Clone</p>
  `;
    return await sendMailer({ email, subject: "Verify your email", html });
  }
);

const verifiedEmailOtp: RequestHandler = expressAsyncHandler(
  async (req, res, next) => {
    const { email, code } = req.body;
    if (!email) {
      throw new ResponseError("Please input the email", 400);
    }
    if (!code) {
      throw new ResponseError("Please input the code", 400);
    }

    const userVerified = (await AuthTesting.findOne({
      where: {
        code,
        email: { [Op.iLike]: email.toLowerCase() },
        // codeExpired: { [Op.gt]: Date.now() }
      },
    })) as VerifiedValue;

    if (!userVerified) {
      throw new ResponseError("Verification code invalid", 400);
    }

    userVerified.isVerified = true;
    userVerified.codeExpired = null;
    userVerified.code = null;
    await userVerified.save();

    res.status(200).json({
      success: true,
      message: "User verification successfully",
      data: userVerified,
    });
  }
);

export {
  findAccountByName,
  changeDefaultHideLike,
  verifiedEmailConfirmation,
  resendEmailVerification,
  verifyOtpSms,
  verifyCodeOtpSms,
  sendEmailVerifyOtp,
  verifiedEmailOtp,
};
