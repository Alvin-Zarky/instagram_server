import { UserSchema } from "../types/user";

const userProperties = (user: UserSchema) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    photo: user.photo,
    role: user.role,
    isAdmin: user.isAdmin,
    isActive: user.isActive,
    bio: user.bio,
    links: user.links,
    posts: user.posts,
    follower: user.follower,
    following: user.following,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const userObjects = (user: UserSchema) =>{
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    photo: user.photo
  }
}

export default userProperties;