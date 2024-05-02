import {Context, Hono} from "hono";
import CategoryService from "../services/CategoryService";
import {drizzle} from "drizzle-orm/d1";
import {createRoute, OpenAPIHono, z} from "@hono/zod-openapi";
import categoryResponse from "../response/category.response";

const category = new OpenAPIHono()
const categoryService = CategoryService.getInstance()

category.openapi(
    createRoute({
        method: 'get',
        path: '/',
        tags: ['category'],
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
                description: 'List of categorys',
                content: {
                    'application/json': {
                        schema: z.object({
                            items: z.array(categoryResponse),
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
    const categories = await categoryService.getCategories(db, query)
    return c.json(categories)
})

category.openapi(
    createRoute({
        method: 'get',
        path: '/{id}',
        tags: ['category'],
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
                description: 'Category',
                content: {
                    'application/json': {
                        schema: categoryResponse
                    }
                }
            }
        }
    }),
    async (c: Context): Promise<any> => {
    const db = drizzle(c.env.DB)
    const id = c.req.param('id')
    const category = await categoryService.getCategory(db, +id)
    return c.json(category)
})

category.openapi(
    createRoute({
        method: 'post',
        path: '/',
        tags: ['category'],
        requestBody: {
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            name: {type: 'string'},
                            description: {type: 'string', default: ''}
                        },
                        required: ['name'],
                    }
                }
            }
        },
        responses: {
            200: {
                description: 'Category',
                content: {
                    'application/json': {
                        schema: categoryResponse
                    }
                }
            }
        }
    }), async (c: Context): Promise<any> => {
    const db = drizzle(c.env.DB)
    const data = await c.req.json()
    const result = await categoryService.createCategory(db, data)
    return c.json(result)
})

category.openapi(
    createRoute({
        method: 'put',
        path: '/{id}',
        tags: ['category'],
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
                            description: {type: 'string', default: ''}
                        },
                        required: ['name'],
                    }
                }
            }
        },
        responses: {
            200: {
                description: 'Category',
                content: {
                    'application/json': {
                        schema: categoryResponse
                    }
                }
            }
        }
    }),
    async (c: Context): Promise<any> => {
    const db = drizzle(c.env.DB)
    const id = c.req.param('id')
    const data = await c.req.json()
    const result = await categoryService.updateCategory(db, +id, data)
    return c.json(result)
})

category.openapi(
    createRoute({
        method: 'delete',
        path: '/{id}',
        tags: ['category'],
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
                description: 'Category',
                content: {
                    'application/json': {
                        schema: categoryResponse
                    }
                }
            }
        }
    }),
    async (c: Context): Promise<any> => {
    const db = drizzle(c.env.DB)
    const id = c.req.param('id')
    const result = await categoryService.deleteCategory(db, +id)
    return c.json(result)
})

export default category



