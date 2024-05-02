import {Context, Hono} from "hono";
import CategoryService from "../services/CategoryService";
import {drizzle} from "drizzle-orm/d1";
import {zValidator} from "@hono/zod-validator";
import {z} from "zod";
import {PaginationDto} from "../config";

const category = new Hono()
const categoryService = CategoryService.getInstance()

category.get('/', zValidator('query', PaginationDto), async (c: Context) => {
    const db = drizzle(c.env.DB)
    const query = c.req.query()
    const categories = await categoryService.getCategories(db, query)
    return c.json(categories)
})

category.get('/:id', zValidator('param', z.object({
    id: z.string()
})), async (c: Context) => {
    const db = drizzle(c.env.DB)
    const id = c.req.param('id')
    const category = await categoryService.getCategory(db, +id)
    return c.json(category)
})

category.post('/', zValidator('json', z.object({
    name: z.string().min(3),
    description: z.string().optional()
})), async (c: Context) => {
    const db = drizzle(c.env.DB)
    const data = await c.req.json()
    const result = await categoryService.createCategory(db, data)
    return c.json(result)
})

category.put('/:id', zValidator('param', z.object({
    id: z.string()
})), zValidator('json', z.object({
    name: z.string().min(3),
    description: z.string().optional()
})), async (c: Context) => {
    const db = drizzle(c.env.DB)
    const id = c.req.param('id')
    const data = await c.req.json()
    const result = await categoryService.updateCategory(db, +id, data)
    return c.json(result)
})

category.delete('/:id', zValidator('param', z.object({
    id: z.string()
})), async (c: Context) => {
    const db = drizzle(c.env.DB)
    const id = c.req.param('id')
    const result = await categoryService.deleteCategory(db, +id)
    return c.json(result)
})

export default category



