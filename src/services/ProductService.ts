import {DrizzleD1Database} from "drizzle-orm/d1";
import {HTTPException} from "hono/http-exception";
import {categories, products} from "../schema";
import {count, getTableColumns} from "drizzle-orm";
import {eq} from "drizzle-orm/expressions";

class ProductService {
    private static instance: ProductService;

    private constructor() {
        // Private constructor to prevent new instances
    }

    public static getInstance(): ProductService {
        if (!ProductService.instance) {
            ProductService.instance = new ProductService();
        }

        return ProductService.instance;
    }

    public async getProducts(db: DrizzleD1Database, query: any) {
        const {page = 1, limit = 10} = query;
        if (page < 1 || limit < 1) {
            throw new HTTPException(400, {message: 'Invalid page or limit'})
        }
        const listProduct = await db.select()
            .from(products)
            .offset((+page - 1) * +limit)
            .limit(+limit)


        const totalElements = await db.select({
            count: count()
        }).from(products)


        return {
            items: listProduct ?? [],
            totalElements: totalElements[0].count
        }
    }

    public async getProduct(db: DrizzleD1Database, id: number) {
        if (isNaN(id)) {
            throw new HTTPException(400, {message: 'Invalid id'})
        }
        const product = await db.select({
            ...getTableColumns(products)
        })
            .from(products)
            .where(eq(products.id, id))
            .get()
        if (!product) {
            throw new HTTPException(404, {message: 'Product not found'})
        }

        return product
    }

    public async createProduct(db: DrizzleD1Database, data: any) {
        const categoryExists = await db.select().from(categories).where(eq(categories.id, data.categoryId)).get()
        if (!categoryExists) {
            throw new HTTPException(400, {message: 'Category not found'})
        }

        if (data.discount < 0 || data.discount > 100) {
            throw new HTTPException(400, {message: 'Invalid discount'})
        }
        const currentPrice = data.price * (100 - data.discount) / 100

        const newProduct = {
            ...data,
            currentPrice,
            images: JSON.stringify(data.images)
        }

        return db.insert(products).values(newProduct).returning().get()
    }

    public async updateProduct(db: DrizzleD1Database, id: number, data: any) {
        if (isNaN(id)) {
            throw new HTTPException(400, {message: 'Invalid id'})
        }
        const product = await db.select().from(products).where(eq(products.id, id)).get()
        if (!product) {
            throw new HTTPException(404, {message: 'Product not found'})
        }

        if (data.discount && (data.discount < 0 || data.discount > 100)) {
            throw new HTTPException(400, {message: 'Invalid discount'})
        }
        const currentPrice = data.price * (100 - data.discount) / 100
        const updatedProduct = {
            ...data,
            currentPrice,
            images: JSON.stringify(data.images)
        }

        return db.update(products).set(updatedProduct).where(eq(products.id, id)).returning().get()
    }

    public async deleteProduct(db: DrizzleD1Database, id: number) {
        const product = await db.select().from(products).where(eq(products.id, id)).get()
        if (!product) {
            throw new HTTPException(404, {message: 'Product not found'})
        }
        return db.delete(products).where(eq(products.id, id)).returning().get()
    }
}

export default ProductService;
