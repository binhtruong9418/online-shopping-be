import {DrizzleD1Database} from "drizzle-orm/d1";
import {carts, orders, products} from "../schema";
import {eq} from "drizzle-orm/expressions";
import {HTTPException} from "hono/http-exception";
import {ORDER_STATUS} from "../config/enum";
import {count} from "drizzle-orm";

class OrderService {
    private static instance: OrderService;

    private constructor() {
        // Private constructor to prevent new instances
    }

    public static getInstance(): OrderService {
        if (!OrderService.instance) {
            OrderService.instance = new OrderService();
        }

        return OrderService.instance;
    }

    public async createOrder(db: DrizzleD1Database, data: any) {
        const {cartId} = data;
        const cart: any = await db.select().from(carts).where(eq(carts.id, cartId)).get();
        if (!cart) {
            throw new HTTPException(400, {message: 'Cart not found'})
        }

        const listProducts = cart.products.map((p: any) => {
            return {
                productId: p.productId,
                quantity: p.quantity
            }
        })

        const newOrder = await db.insert(orders).values({
            products: listProducts,
            status: ORDER_STATUS.PENDING,
            orderTime: new Date(),
            ...data
        }).returning().get();

        await Promise.all(newOrder.products.map(async (p: any) => {
            const product = await db.select().from(products).where(eq(products.id, p.productId)).get();
            if (product) {
                p.product = product;
            }
            return p;
        }))

        return newOrder;
    }

    public async getOrder(db: DrizzleD1Database, id: number) {
        if (isNaN(id)) {
            throw new HTTPException(400, {message: 'Invalid id'})
        }
        const order: any = await db.select().from(orders).where(eq(orders.id, id)).get()

        order.products = await Promise.all(order.products.map(async (p: any) => {
            const product = await db.select().from(products).where(eq(products.id, p.productId)).get();
            if (product) {
                p.product = product;
            }
            return p;
        }))

        return order;
    }

    public async getOrders(db: DrizzleD1Database, query: any) {
        const {page = 1, limit = 10} = query;

        if (page < 1 || limit < 1) {
            throw new HTTPException(400, {message: 'Invalid page or limit'})
        }

        const listOrder = await db.select()
            .from(orders)
            .offset((+page - 1) * +limit)
            .limit(+limit)

        const totalElements = await db.select({
            count: count()
        }).from(orders)

        return {
            items: listOrder ?? [],
            totalElements: totalElements[0].count
        }
    }
}
