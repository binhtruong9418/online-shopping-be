import {DrizzleD1Database} from "drizzle-orm/d1";
import {users} from "../schema";
import {eq} from "drizzle-orm/expressions";
import {HTTPException} from "hono/http-exception";
// @ts-ignore
import bcrypt from "bcryptjs";
import {sign} from 'hono/jwt'
import {JWT_SECRET} from "../util";
import {APP_ROLES} from "../type";

class AuthService {
  private static instance: AuthService;

  constructor() {
    //init
  }

  public static getInstance() {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(db: DrizzleD1Database, data: any) {
    const {email, password} = data
    const userByEmailQuery = db.select().from(users).where(eq(users.email, email))
    const user = await userByEmailQuery.get()
    if (!user) {
      throw new HTTPException(404, {message: 'User not found'})
    }
    //check password
    const match = bcrypt.compareSync(password, user.password);
    if (!match) {
      throw new HTTPException(400, {message: 'Invalid password'})
    }

    const {password: userPassword, ...userWithoutPassword} = user
    const token = await sign(userWithoutPassword, JWT_SECRET)
    return {
      user: userWithoutPassword,
      jwt: token
    }
  }

  async register(db: DrizzleD1Database, data: any) {
    const {email, password, name, gender} = data
    const existedUser = await db.select().from(users).where(eq(users.email, email)).get()
    if (existedUser) {
      throw new HTTPException(400, {message: 'User already exists'})
    }
    //hash password using bcrypt
    var hash = bcrypt.hashSync(password, 10);
    const insertUser = await db.insert(users).values({
      email: email,
      password: hash,
      name: name,
      created_at: new Date().getTime(),
      updated_at: new Date().getTime(),
      role: APP_ROLES.USER
    }).returning().get()
    const {password: userPassword, ...userWithoutPassword} = insertUser
    return userWithoutPassword;
  }

}

export default AuthService;
