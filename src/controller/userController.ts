import expressAsyncHandler from "express-async-handler";
import { RequestHandler } from "express";
import User from "../model/User";
import { UserSchema } from "../types/user";
import ResponseError from "../utility/customError";
import validator from "validator";
import bcryptjs from "bcryptjs";
import generateUserToken from "../helper/generateUserToken";
import { Op } from "sequelize";
import userProperties from "../helper/userObjectResult";
import { io } from "../server";

const userRegister: RequestHandler = expressAsyncHandler(
  async (req, res, next) => {
    const { name, email, password, photo } = req.body;

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
    })) as UserSchema;

    const userObjects= userProperties(user);
    const data={
      ...userObjects,
      token: generateUserToken(user.id?.toString()!),
    }

    io.emit('user-register', data)

    res.status(201).json({
      success: true,
      data,
    });
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
        
        const userObjects= userProperties(userNameExist);

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

        const userObjects= userProperties(userEmailExist);

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
        token: ''
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

    const userObjects= userProperties(req.user);
    const token = req.headers.authorization?.split(' ')[1]

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
    const { name, email, currentPassword, password, photo, bio, links } =
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

    if(password){
      if (password.length < 6) {
        throw new ResponseError(`Password should be atleast 6 characters`, 401);
      }
      const genSalt = await bcryptjs.genSalt(10);
      const hash = await bcryptjs.hash(password, genSalt);
      user.password = hash;
    }

    const nameExist= await User.findOne({ where: { name: { [Op.iLike]: name?.toLowerCase() } } }) 
    if(nameExist){
      throw new ResponseError(`Name was already exist`, 400)
    }   

    const emailExist= await User.findOne({ where: { email: { [Op.iLike] : email?.toLowerCase() } } })
    if(emailExist){
      throw new ResponseError(`Email was already exist`, 400)
    }

    user.name = name || req.user.name;
    user.email = email || req.user.email;
    user.photo = photo || req.user.photo;
    user.bio = bio;
    user.links = links;
    await user.save();

    res.status(200).json({
      success: true,
      data: user,
    });

  }
);

const getAllUser = expressAsyncHandler(async(req, res, next) =>{

  // const data= await User.findAll({ order: [['createdAt', 'desc']] })

  const data= await User.findAll({ where: { id: { [Op.not]: req.user.id } }, order: [['createdAt', 'desc']] })
  if(data.length === 0){
    throw new ResponseError("Data not found", 404)
  }
  res.status(200).json({ success:true, data })

});

export { userLogIn, userRegister, userLogOut, userProfile, editUserProfile, getAllUser };
