import {Context, Next} from "hono";
import {HTTPException} from "hono/http-exception";
import {verify} from 'hono/jwt'
import {APP_ROLES} from "../type";
import {JWT_SECRET} from "../util";

const checkRole = (roles: APP_ROLES[] = []) => {
  return async (c: Context, next: Next) => {

    //get jwt from header
    const jwtToken = c.req.header('Authorization')
    //get token based on bearer
    const token = jwtToken?.split('Bearer ')?.[1]
    if (!token) {
      throw new HTTPException(401, {message: 'Requires token'})
    }
    //verify token
    let payload
    try {
      payload = await verify(token, JWT_SECRET)
    } catch (e) {
      throw new HTTPException(401, {message: 'Invalid token'})
    }
    if (!payload) {
      throw new HTTPException(401, {message: 'Invalid token'})
    }
    if (payload.role === APP_ROLES.ADMIN) {
      c.set('user', payload)
      await next()
      return
    }
    //check role admin can access all other roles need to be in roles array
    if (roles.length && !roles.includes(payload.role)) {
      throw new HTTPException(403, {message: 'Forbidden'})
    }
    c.set('user', payload)
    await next()
  }
}

export default checkRole


