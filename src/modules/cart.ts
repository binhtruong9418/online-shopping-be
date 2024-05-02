import {createRoute, OpenAPIHono} from "@hono/zod-openapi";
import CartService from "../services/CartService";
import {Context} from "hono";
import {drizzle} from "drizzle-orm/d1";
import cartResponse from "../response/cart.response";

const cart = new OpenAPIHono()
const cartService = CartService.getInstance()

cart.openapi(
    createRoute({
        method: 'post',
        path: '/',
        tags: ['cart'],
        responses: {
            200: {
                description: 'Create cart',
                content: {
                    'application/json': {
                        schema: cartResponse
                    }
                }
            }
        }
    }),
    async (c: Context): Promise<any> => {
        const db = drizzle(c.env.DB)
        const cart = await cartService.createCart(db)
        return c.json(cart)
    }
)

cart.openapi(
    createRoute({
        method: 'get',
        path: '/{id}',
        tags: ['cart'],
        parameters: [
            {
                name: 'id',
                in: 'path',
                required: true,
                schema: {
                    type: 'integer'
                }
            }
        ],
        responses: {
            200: {
                description: 'Get cart by id',
                content: {
                    'application/json': {
                        schema: cartResponse
                    }
                }
            }
        }
    }),
    async (c: Context): Promise<any> => {
        const db = drizzle(c.env.DB)
        const cartId = c.req.param('id')
        const cart = await cartService.getCart(db, +cartId)
        return c.json(cart)
    }
)

cart.openapi(
    createRoute({
        method: 'put',
        path: '/{id}',
        tags: ['cart'],
        parameters: [
            {
                name: 'id',
                in: 'path',
                required: true,
                schema: {
                    type: 'integer'
                }
            }
        ],
        requestBody: {
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            productId: {type: 'integer'},
                            quantity: {type: 'integer', default: 0},
                            type: {type: 'string', enum: ['INCREASE', 'DECREASE', 'REMOVE']}
                        },
                        required: ['productId', 'type']
                    }
                }
            }
        },
        responses: {
            200: {
                description: 'Update cart',
                content: {
                    'application/json': {
                        schema: cartResponse
                    }
                }
            }
        }
    }),
    async (c: Context): Promise<any> => {
        const db = drizzle(c.env.DB)
        const cartId = c.req.param('id')
        const data = await c.req.json()
        const cart = await cartService.updateCart(db, +cartId, data)
        return c.json(cart)
    }
)

cart.openapi(
    createRoute({
        method: 'put',
        path: '/clear/{id}',
        tags: ['cart'],
        parameters: [
            {
                name: 'id',
                in: 'path',
                required: true,
                schema: {
                    type: 'integer'
                }
            }
        ],
        responses: {
            200: {
                description: 'Clear cart',
                content: {
                    'application/json': {
                        schema: cartResponse
                    }
                }
            }
        }
    }),
    async (c: Context): Promise<any> => {
        const db = drizzle(c.env.DB)
        const cartId = c.req.param('id')
        const cart = await cartService.clearCart(db, +cartId)
        return c.json(cart)
    }
)

cart.openapi(
    createRoute({
        method: 'delete',
        path: '/{id}',
        tags: ['cart'],
        parameters: [
            {
                name: 'id',
                in: 'path',
                required: true,
                schema: {
                    type: 'integer'
                }
            }
        ],
        responses: {
            200: {
                description: 'Delete cart',
                content: {
                    'application/json': {
                        schema: cartResponse
                    }
                }
            }
        }
    }),
    async (c: Context): Promise<any> => {
        const db = drizzle(c.env.DB)
        const cartId = c.req.param('id')
        const cart = await cartService.deleteCart(db, +cartId)
        return c.json(cart)
    }
)

export default cart
