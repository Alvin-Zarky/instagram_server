import { UserSchema } from "../types/user";

const userProperties = (user: UserSchema) => {
  return {
    id: user.id,
    uid: user.uid,
    name: user.name,
    email: user.email,
    photo: user.photo,
    photoDetail: user.photoDetail,
    role: user.role,
    isAdmin: user.isAdmin,
    isActive: user.isActive,
    bio: user.bio,
    links: user.links,
    posts: user.posts,
    follower: user.follower,
    following: user.following,
    isHideLike: user.isHideLike,
    isVerified:user.isVerified,
    verifiedToken: user.verifiedToken,
    verifiedExpired: user.verifiedExpired,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const userObjects = (user: UserSchema) =>{
  return {
    id: user.id,
    uid: user.uid,
    name: user.name,
    email: user.email,
    photo: user.photo,
    isHideLike: user.isHideLike
  }
}

export {
  userObjects,
  userProperties
};