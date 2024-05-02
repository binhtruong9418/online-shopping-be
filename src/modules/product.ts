import {Context, Hono} from "hono";
import ProductService from "../services/ProductService";
import {drizzle} from "drizzle-orm/d1";
import {zValidator} from "@hono/zod-validator";
import {createRoute, OpenAPIHono, z} from "@hono/zod-openapi";
import ProductResponse from "../response/product.response";

const product = new OpenAPIHono()
const productService = ProductService.getInstance()

product.openapi(
    createRoute({
        method: 'get',
        path: '/',
        tags: ['product'],
        parameters: [
            {
                name: 'page',
                in: 'query',
                schema: {
                    type: 'number',
                    default: 1
                }
            },
            {
                name: 'limit',
                in: 'query',
                schema: {
                    type: 'number',
                    default: 10
                }
            }
        ],
        responses: {
            200: {
                description: 'List of products',
                content: {
                    'application/json': {
                        schema: z.object({
                            items: z.array(ProductResponse),
                            totalElements: z.number()
                        })
                    }
                }
            }
        },
    }),
    async (c: Context): Promise<any> => {
        const db = drizzle(c.env.DB)
        const query = c.req.query()
        const products = await productService.getProducts(db, query)
        return c.json(products)
    }
)

product.openapi(
    createRoute({
        method: 'get',
        path: '/{id}',
        tags: ['product'],
        parameters: [
            {
                name: 'id',
                in: 'path',
                required: true,
                schema: {
                    type: 'number'
                }
            }
        ],
        responses: {
            200: {
                description: 'Product detail',
                content: {
                    'application/json': {
                        schema: ProductResponse
                    }
                }
            }
        },
    }),
    async (c: Context): Promise<any> => {
        const db = drizzle(c.env.DB)
        console.log(c.req.param('id'))
        const id = c.req.param('id')
        const product = await productService.getProduct(db, +id)
        return c.json(product)
    }
)

product.openapi(
    createRoute({
        method: 'post',
        path: '/',
        tags: ['product'],
        requestBody: {
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            name: {type: 'string'},
                            price: {type: 'number', default: 0},
                            category: {type: 'string'},
                            description: {type: 'string', default: ''},
                            images: {type: 'array', items: {type: 'string'}, default: []},
                            discount: {type: 'number', default: 0}
                        }
                    }
                }
            }
        },
        responses: {
            200: {
                description: 'Create product success',
                content: {
                    'application/json': {
                        schema: ProductResponse
                    }
                }
            }
        }
    }),
    async (c: Context): Promise<any> => {
        const db = drizzle(c.env.DB)
        const data = await c.req.json()
        const result = await productService.createProduct(db, data)
        return c.json(result)
    }
)

product.openapi(
    createRoute({
        method: 'put',
        path: '/{id}',
        tags: ['product'],
        parameters: [
            {
                name: 'id',
                in: 'path',
                required: true,
                schema: {
                    type: 'number'
                }
            }
        ],
        requestBody: {
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            name: {type: 'string'},
                            price: {type: 'number', default: 0},
                            category: {type: 'string'},
                            description: {type: 'string', default: ''},
                            images: {type: 'array', items: {type: 'string'}, default: []},
                            discount: {type: 'number', default: 0}
                        }
                    }
                }
            }
        },
        responses: {
            200: {
                description: 'Update product success',
                content: {
                    'application/json': {
                        schema: ProductResponse
                    }
                }
            }
        }
    }),
    async (c: Context): Promise<any> => {
        const db = drizzle(c.env.DB)
        const id = c.req.param('id')
        const data = await c.req.json()
        const result = await productService.updateProduct(db, +id, data)
        return c.json(result)
    }
)

product.openapi(
    createRoute({
        method: 'delete',
        path: '/{id}',
        tags: ['product'],
        parameters: [
            {
                name: 'id',
                in: 'path',
                required: true,
                schema: {
                    type: 'number'
                }
            }
        ],
        responses: {
            200: {
                description: 'Delete product success',
                content: {
                    'application/json': {
                        schema: ProductResponse
                    }
                }
            }
        }
    }),
    async (c: Context): Promise<any> => {
        const db = drizzle(c.env.DB)
        const id = c.req.param('id')
        const result = await productService.deleteProduct(db, +id)
        return c.json(result)
    }
)

export default product
