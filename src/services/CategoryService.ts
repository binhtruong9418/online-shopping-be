import {DrizzleD1Database} from "drizzle-orm/d1";
import {categories} from "../schema";
import {count, sql} from "drizzle-orm";
import {eq} from "drizzle-orm/expressions";
import {HTTPException} from "hono/http-exception";

class CategoryService {
    private static instance: CategoryService;

    private constructor() {
        // Private constructor to prevent new instances
    }

    public static getInstance(): CategoryService {
        if (!CategoryService.instance) {
            CategoryService.instance = new CategoryService();
        }

        return CategoryService.instance;
    }

    public async getCategories(db: DrizzleD1Database, query: any) {
        const {page = 1, limit = 10} = query;
        if (page < 1 || limit < 1) {
            throw new HTTPException(400, {message: 'Invalid page or limit'})
        }
        const listCategory = await
            db.select()
                .from(categories)
                .offset((+page - 1) * +limit)
                .limit(+limit)
        const totalElements = await db.select({
            count: count()
        }).from(categories)

        return {
            items: listCategory ?? [],
            totalElements: totalElements[0].count
        }
    }

    public async getCategory(db: DrizzleD1Database, id: number) {
        if (isNaN(id)) {
            throw new HTTPException(400, {message: 'Invalid id'})
        }
        return db.select().from(categories).where(eq(categories.id, id)).get()
    }

    public async createCategory(db: DrizzleD1Database, data: any) {
        const category = await db.select().from(categories).where(eq(categories.name, data.name)).get()
        if (category) {
            throw new HTTPException(400, {message: 'Category already exists'})
        }
        return db.insert(categories).values(data).returning().get()
    }

    public async updateCategory(db: DrizzleD1Database, id: number, data: any) {
        if (isNaN(id)) {
            throw new HTTPException(400, {message: 'Invalid id'})
        }
        const category = await db.select().from(categories).where(eq(categories.id, id)).get()
        if (!category) {
            throw new HTTPException(404, {message: 'Category not found'})
        }
        const categoryWithSameName = await db.select().from(categories).where(eq(categories.name, data.name)).get()
        if (categoryWithSameName && categoryWithSameName.id !== id) {
            throw new HTTPException(400, {message: 'Category already exists'})
        }
        return db.update(categories).set(data).where(eq(categories.id, id)).returning().get()
    }

    public async deleteCategory(db: DrizzleD1Database, id: number) {
        if (isNaN(id)) {
            throw new HTTPException(400, {message: 'Invalid id'})
        }
        const category = await db.select().from(categories).where(eq(categories.id, id)).get()
        if (!category) {
            throw new HTTPException(404, {message: 'Category not found'})
        }
        return db.delete(categories).where(eq(categories.id, id)).returning().get()
    }
}

export default CategoryService;
