import {Context, Hono} from "hono";
import ProductService from "../services/ProductService";
import {drizzle} from "drizzle-orm/d1";
import {zValidator} from "@hono/zod-validator";
import {z} from "zod";
import {PaginationDto} from "../config";

const product = new Hono()
const productService = ProductService.getInstance()

product.get('/',
    zValidator('query', PaginationDto),
    async (c: Context) => {
        const db = drizzle(c.env.DB)
        const query = c.req.query()
        const products = await productService.getProducts(db, query)
        return c.json(products)
    })

product.get('/:id',
    zValidator('param', z.object({
        id: z.string()
    })),
    async (c: Context) => {
        const db = drizzle(c.env.DB)
        const id = c.req.param('id')
        const product = await productService.getProduct(db, +id)
        return c.json(product)
    })

product.post('/',
    zValidator('json', z.object({
        name: z.string().min(3),
        price: z.number().positive(),
        categoryId: z.number().positive(),
        description: z.string().optional(),
        images: z.array(z.string()).optional(),
        discount: z.number().default(0)
    })),
    async (c: Context) => {
        const db = drizzle(c.env.DB)
        const data = await c.req.json()
        const result = await productService.createProduct(db, data)
        return c.json(result)
    })

product.put('/:id',
    zValidator('param', z.object({
        id: z.string()
    })),
    zValidator('json', z.object({
        name: z.string().min(3).optional(),
        price: z.number().positive().optional(),
        category: z.string().optional(),
        description: z.string().optional(),
        images: z.string().optional(),
        discount: z.number().default(0).optional()
    })),
    async (c: Context) => {
        const db = drizzle(c.env.DB)
        const id = c.req.param('id')
        const data = await c.req.json()
        const result = await productService.updateProduct(db, +id, data)
        return c.json(result)
    })

product.delete('/:id',
    zValidator('param', z.object({
        id: z.string()
    })),
    async (c: Context) => {
        const db = drizzle(c.env.DB)
        const id = c.req.param('id')
        const result = await productService.deleteProduct(db, +id)
        return c.json(result)
    })

export default product
