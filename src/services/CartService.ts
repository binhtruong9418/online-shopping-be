import {DrizzleD1Database} from "drizzle-orm/d1";
import {carts, products} from "../schema";
import {HTTPException} from "hono/http-exception";
import {eq} from "drizzle-orm/expressions";
import {UPDATE_CART_ACTION} from "../config/enum";

class CartService {
    private static instance: CartService;

    private constructor() {
        // Private constructor to prevent new instances
    }

    public static getInstance(): CartService {
        if (!CartService.instance) {
            CartService.instance = new CartService();
        }

        return CartService.instance;
    }

    public async createCart(db: DrizzleD1Database) {
        return db.insert(carts).values({
            products: [],
        }).returning().get();
    }

    public async getCart(db: DrizzleD1Database, id: number) {
        if (isNaN(id)) {
            throw new HTTPException(400, {message: 'Invalid id'})
        }
        const cart: any = await db.select().from(carts).where(eq(carts.id, id)).get()

        cart.products = await Promise.all(cart.products.map(async (p: any) => {
            const product = await db.select().from(products).where(eq(products.id, p.productId)).get();
            if (product) {
                p.product = product;
            }
            return p;
        }))

        return cart;
    }

    public async updateCart(db: DrizzleD1Database, id: number, data: any) {
        if (isNaN(id)) {
            throw new HTTPException(400, {message: 'Invalid id'})
        }
        const {productId, quantity, type} = data;
        const productExits = await db.select().from(products).where(eq(products.id, productId)).get();
        if (!productExits) {
            throw new HTTPException(400, {message: 'Product not found'})
        }

        const cart = await db.select().from(carts).where(eq(carts.id, id)).get();
        if (!cart) {
            throw new HTTPException(400, {message: 'Cart not found'})
        }

        const {products: cartProducts }: any = cart;
        const productIndex = cartProducts.findIndex((p: any) => p.productId === productId);

        if (productIndex === -1) {
            cartProducts.push({
                productId,
                quantity,
            });
        } else {
            switch (type) {
                case UPDATE_CART_ACTION.INCREASE:
                    cartProducts[productIndex].quantity += quantity;
                    break;
                case UPDATE_CART_ACTION.DECREASE:
                    cartProducts[productIndex].quantity -= quantity;
                    break;
                case UPDATE_CART_ACTION.REMOVE:
                    cartProducts.splice(productIndex, 1);
                    break;
            }
        }

        await db.update(carts).set({products: cartProducts}).where(eq(carts.id, id)).execute();

        await Promise.all(cartProducts.map(async (p: any) => {
            const product = await db.select().from(products).where(eq(products.id, p.productId)).get();
            if (product) {
                p.product = product;
            }
            return p;
        }))

        return cart;
    }

    public async clearCart(db: DrizzleD1Database, id: number) {
        if (isNaN(id)) {
            throw new HTTPException(400, {message: 'Invalid id'})
        }

        const cart = await db.select().from(carts).where(eq(carts.id, id)).get();

        if (!cart) {
            throw new HTTPException(400, {message: 'Cart not found'})
        }

        return db.update(carts).set({products: []}).where(eq(carts.id, id)).returning().get()
    }

    public async deleteCart(db: DrizzleD1Database, id: number) {
        if (isNaN(id)) {
            throw new HTTPException(400, {message: 'Invalid id'})
        }

        const cart = await db.select().from(carts).where(eq(carts.id, id)).get();

        if (!cart) {
            throw new HTTPException(400, {message: 'Cart not found'})
        }

        await db.delete(carts).where(eq(carts.id, id)).execute();

        return cart;
    }
}

export default CartService;
