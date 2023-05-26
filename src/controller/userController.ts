import expressAsyncHandler from "express-async-handler";
import { RequestHandler } from "express";
import User from "../model/User";
import { UserSchema } from "../types/user";
import ResponseError from "../utility/customError";
import validator from "validator";
import bcryptjs from "bcryptjs";
import generateUserToken from "../helper/generateUserToken";
import { Op } from "sequelize";
import {userProperties} from "../helper/userObjectResult";
import { io } from "../server";
import crypto from "crypto";
import sendMailer from "../helper/sendMailer";

const userRegister: RequestHandler = expressAsyncHandler(
  async (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name) {
      throw new ResponseError("Please input the name", 401);
    }
    if (!email) {
      throw new ResponseError("Please input the email", 401);
    }
    if (!validator.isEmail(email)) {
      throw new ResponseError("Email invalid", 401);
    }
    if (!password) {
      throw new ResponseError("Please input the password", 401);
    }
    if (password.length < 6) {
      throw new ResponseError("Password should be atleast 6 characters", 401);
    }

    const nameExist = await User.findOne({
      where: { name: { [Op.iLike]: name.toLowerCase() } },
    });
    if (nameExist) {
      throw new ResponseError(`Name was already existed`, 401);
    }

    const emailExist = await User.findOne({
      where: { email: { [Op.iLike]: email.toLowerCase() } },
    });
    if (emailExist) {
      throw new ResponseError(`Email was already existed`, 401);
    }

    const genSalt = await bcryptjs.genSalt(10);
    const hash = await bcryptjs.hash(password, genSalt);

    const bcryptToken= crypto.randomBytes(20).toString('hex')
    const dateExpired= Date.now() + 10 * 60 * 1000

    const verifiedCryptoToken= crypto.createHash("sha256").update(bcryptToken).digest('hex')

    const user = (await User.create({
      name,
      email,
      password: hash,
      photo:
        "https://res.cloudinary.com/dt89p7jda/image/upload/v1675580588/Instagram%20Clone/user_vzvi5b.png",
      role: "user",
      isAdmin: false,
      isActive: true,
      bio: "",
      links: "",
      isVerified:false,
      verifiedToken: verifiedCryptoToken,
      verifiedExpired: dateExpired
    })) as UserSchema;

    const userObjects = userProperties(user);
    const data = {
      ...userObjects,
      token: generateUserToken(user.id?.toString()!),
    };

    io.emit("user-register", data);

    res.status(201).json({
      success: true,
      data,
    });

    const verifiedUrl = `${req.protocol}://${process.env.VERIFIED_ACCOUNT_URL}/${bcryptToken}`
    const html=`
      <p>Hello ${user.name}</p>
      <p>To activate your Account, please verify your email address</p>
      <p>Your account will not be created until your email address is confirmed.</p>
      <p>${verifiedUrl}</p>
      <p>Note that this link will expire after 10 minutes. Your account won't verify until you access the link above and create a new one.</p>
      <p style="color: grey">Instagram Clone</p>
    `
    const options={
      email,
      subject: "Verifiy your account",
      html
    }
    return await sendMailer(options)

  }
);

const userLogIn: RequestHandler = expressAsyncHandler(
  async (req, res, next) => {
    const { user, password } = req.body;

    if (!user) {
      throw new ResponseError("Please input the name or email", 401);
    }
    if (!password) {
      throw new ResponseError(`Please input the password`, 401);
    }

    const userNameExist = (await User.findOne({
      where: { name: { [Op.iLike]: user.toLowerCase() } },
    })) as UserSchema;
    const userEmailExist = (await User.findOne({
      where: { email: { [Op.iLike]: user.toLowerCase() } },
    })) as UserSchema;

    if (!userEmailExist && !userNameExist) {
      throw new ResponseError(`Username or Email was incorrect`, 401);
    }

    if (userNameExist) {
      if (
        password &&
        (await bcryptjs.compare(password, userNameExist.password!))
      ) {
        userNameExist.isActive = true;
        userNameExist.save();

        const userObjects = userProperties(userNameExist);

        const user = {
          ...userObjects,
          token: generateUserToken(String(userNameExist.id!)),
        };

        res.status(200).json({ success: true, data: user });
      } else {
        throw new ResponseError(`Password was incorrect`, 401);
      }
    }

    if (userEmailExist) {
      if (
        password &&
        (await bcryptjs.compare(password, userEmailExist.password!))
      ) {
        userEmailExist.isActive = true;
        userEmailExist.save();

        const userObjects = userProperties(userEmailExist);

        const user = {
          ...userObjects,
          token: generateUserToken(String(userEmailExist.id!)),
        };

        res.status(200).json({ success: true, data: user });
      } else {
        throw new ResponseError(`Password was incorrect`, 401);
      }
    }
  }
);

const userLogOut: RequestHandler = expressAsyncHandler(
  async (req, res, next) => {
    const user = (await User.findByPk(req.user.id)) as UserSchema;
    if (!user) {
      throw new ResponseError(`User not found`, 404);
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        photo: user.photo,
        role: user.role,
        isAdmin: user.isAdmin,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isHideLike: user.isHideLike,
        token: "",
      },
    });
  }
);

const userProfile: RequestHandler = expressAsyncHandler(
  async (req, res, next) => {
    if (!req.user) {
      throw new ResponseError(`User not found`, 404);
    }
    if (!req.user.id) {
      throw new ResponseError(`User not authorized`, 401);
    }

    const userObjects = userProperties(req.user);
    const token = req.headers.authorization?.split(" ")[1];

    res.status(200).json({
      success: true,
      data: {
        ...userObjects,
        token,
      },
    });
  }
);

const editUserProfile: RequestHandler = expressAsyncHandler(
  async (req, res, next) => {
    const { name, email, currentPassword, password, photo, bio, links, photoDetail } =
      req.body;
    if (!req.user.id) {
      throw new ResponseError(`User not authorized`, 401);
    }

    const user = (await User.findByPk(req.user.id)) as UserSchema;
    if (!user) {
      throw new ResponseError(`User not found`, 404);
    }

    if (
      currentPassword &&
      !(await bcryptjs.compare(currentPassword, user.password!))
    ) {
      throw new ResponseError(`Current Password was incorrect`, 400);
    }

    if (password) {
      if (password.length < 6) {
        throw new ResponseError(`Password should be atleast 6 characters`, 401);
      }
      const genSalt = await bcryptjs.genSalt(10);
      const hash = await bcryptjs.hash(password, genSalt);
      user.password = hash;
    }

    const nameExist = await User.findOne({
      where: { name: { [Op.iLike]: name?.toLowerCase() } },
    });
    if (nameExist) {
      throw new ResponseError(`Name was already exist`, 400);
    }

    const emailExist = await User.findOne({
      where: { email: { [Op.iLike]: email?.toLowerCase() } },
    });
    if (emailExist) {
      throw new ResponseError(`Email was already exist`, 400);
    }

    user.name = name || req.user.name;
    user.email = email || req.user.email;
    user.photo = photo || req.user.photo;
    user.photoDetail= photoDetail ?? null
    user.bio = bio || req.user.bio;
    user.links = links || req.user.links;
    user.isHideLike= false || req.user.isHideLike
    await user.save();

    res.status(200).json({
      success: true,
      data: user,
    });
  }
);

const getAllUser: RequestHandler = expressAsyncHandler(
  async (req, res, next) => {
    // const data= await User.findAll({ order: [['createdAt', 'desc']] })

    const data = await User.findAll({
      where: { id: { [Op.not]: req.user.id } },
      // limit: 8, 
      order: [["createdAt", "desc"]],
    });
    // if (data.length === 0) {
    //   throw new ResponseError("Data not found", 404);
    // }
    res.status(200).json({ success: true, data });
  }
);

const forgetPasswordUser: RequestHandler = expressAsyncHandler(
  async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
      throw new ResponseError("Please input the email", 401);
    }

    const user = (await User.findOne({
      where: { email: { [Op.iLike]: email.toLowerCase() } },
    })) as UserSchema;
    if (!user) {
      throw new ResponseError("User email not found", 404);
    }

    const date = Date.now() + 10 * 60 * 1000;
    const resetToken = crypto.randomBytes(20).toString("hex");

    const token = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpired = date;

    await user.save();

    // const resetUrl = `${req.protocol}://${req.get(
    //   "host"
    // )}/api/instagram/clone/user/reset/password/${resetToken}`;
    const resetUrl = `${req.protocol}://${process.env.RESET_URL}/${resetToken}`;

    // const message = `
    //   Hello ${user.name}!\n
    //   Someone has requested a link to change your password. You can do this through the following link:\n
    //   ${resetUrl}\n
    //   Note that this link will expire after 10 minutes. Your password won't change until you access the link above and create a new one.\n
    //   We recommend that you use unique, long, complex passwords for all of your accounts. To make generating and remembering your passwords easier, we also suggest using a password management tool.\n
    //   Your password won't change until you access the link above and create a new one.\n
    // `
    const html=`
      <p>Hello ${user.name}</p>
      <p>Someone has requested a link to change your password. You can do this through the following link</p>
      <p>${resetUrl}</p>
      <p>Note that this link will expire after 10 minutes. Your password won't change until you access the link above and create a new one.</p>
      <p>We recommend that you use unique, long, complex passwords for all of your accounts. To make generating and remembering your passwords easier, we also suggest using a password management tool.</p>
      <p>Your password won't change until you access the link above and create a new one.</p>
      <p style="color: grey">Instagram Clone</p>
    `
    
    sendMailer({
      email: user.email,
      subject: "Reset your password",
      html
      // message,
    }).then(() => {
      res.status(200).json({
        success: true,
        data: {
          message: "We already sent link to reset your password",
        },
      });
    }).catch(async (err) =>{
      user.resetPasswordExpired= null
      user.resetPasswordToken = null
      
      await user.save()
      throw new ResponseError("Link could not be sent", 400)
    });

  }
);

const resetPasswordUser: RequestHandler = expressAsyncHandler(
  async (req, res, next) => {

    const { newPassword, confirmNewPassword } = req.body

    if(!newPassword){
      throw new ResponseError("Please input your new password", 401)
    }
    if(confirmNewPassword !== newPassword){
      throw new ResponseError("Confirm password does not matched", 401)
    }

    const resetPasswordToken= crypto.createHash("sha256").update(req.params.resetToken).digest('hex')
    const user= await User.findOne({ where: { resetPasswordToken, resetPasswordExpired: { [Op.gt]: Date.now() } } }) as UserSchema

    if(!user){
      throw new ResponseError("Invalid Token", 400)
    }
    
    const genSalt= await bcryptjs.genSalt(10)
    const hashNewPassword = await bcryptjs.hash(newPassword, genSalt)
    user.password= hashNewPassword
    user.resetPasswordExpired = null
    user.resetPasswordToken = null
    
    const data = await user.save() as UserSchema

    res.status(200).json({ 
      success: true, 
      data:{
        token: generateUserToken(String(data.id))
      }
    });

  }
);

export {
  userLogIn,
  userRegister,
  userLogOut,
  userProfile,
  editUserProfile,
  getAllUser,
  forgetPasswordUser,
  resetPasswordUser,
};
