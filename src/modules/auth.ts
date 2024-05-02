import {Context, Hono} from "hono";
import {drizzle} from "drizzle-orm/d1";
import checkRole from "../middlewares/checkRole";
import {APP_ROLES} from "../type";
import {zValidator} from '@hono/zod-validator'
import {z} from 'zod'

import AuthService from "../services/AuthService";

const authService = AuthService.getInstance()
const auth = new Hono()
auth.post('/login', zValidator('json', z.object({
  email: z.string().email("Invalid email address"),
  password: z.string()
})), async (c: Context) => {
  const db = drizzle(c.env.DB)
  const data = await c.req.json()
  const result = await authService.login(db, data)
  return c.json(result)
})

auth.post('/register', zValidator('json', z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional()
})), async (c: Context) => {
  const db = drizzle(c.env.DB)
  const data = await c.req.json()
  const result = await authService.register(db, data)
  return c.json(result)
})


auth.get('/me', checkRole(), (c: Context) => {
  const user = c.get('user');
  return c.json(user);
})

auth.get('/admin', checkRole([APP_ROLES.ADMIN]), (c: Context) => {
  return c.json({message: 'Admin only route'})
})
export default auth
