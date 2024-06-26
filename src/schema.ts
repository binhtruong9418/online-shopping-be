import {integer, sqliteTable, text,} from 'drizzle-orm/sqlite-core';
import {relations, sql} from "drizzle-orm";
import {ORDER_STATUS, PAYMENT_METHOD} from "./config/enum";

export const users = sqliteTable('users', {
    id: integer('id').primaryKey({autoIncrement: true}),
    name: text('name'),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    role: text('role').notNull().default('USER'),
    createdAt: integer('created_at', {mode: 'timestamp'}).notNull().default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at', {mode: 'timestamp'}).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const categories = sqliteTable('categories', {
    id: integer('id').primaryKey({autoIncrement: true}),
    name: text('name').notNull().unique(),
    description: text('description'),
    createdAt: integer('created_at', {mode: 'timestamp'}).notNull().default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at', {mode: 'timestamp'}).notNull().default(sql`(strftime('%s', 'now'))`),
})

export const products = sqliteTable('products', {
    id: integer('id').primaryKey({autoIncrement: true}),
    name: text('name').notNull(),
    description: text('description'),
    price: integer('price').notNull(),
    images: text('images').notNull(),
    discount: integer('discount').notNull().default(0),
    currentPrice: integer('current_price').notNull(),
    category: text('category').references(() => categories.name),
    createdAt: integer('created_at', {mode: 'timestamp'}).notNull().default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at', {mode: 'timestamp'}).notNull().default(sql`(strftime('%s', 'now'))`),
})


type CartDetails = {
    productId: number;
    quantity: number;
}

export const carts = sqliteTable('carts', {
    id: integer('id').primaryKey({autoIncrement: true}),
    products: text('products', {mode: 'json'}).$type<CartDetails[]>().default([]),
    createdAt: integer('created_at', {mode: 'timestamp'}).notNull().default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at', {mode: 'timestamp'}).notNull().default(sql`(strftime('%s', 'now'))`),
})

type ShippingDetail = {
    address: string;
    province: string;
    district: string;
    ward: string;
    name: string;
    phone: string;
    email?: string;
}

export const orders = sqliteTable('orders', {
    id: integer('id').primaryKey({autoIncrement: true}),
    products: text('products', {mode: 'json'}).$type<CartDetails[]>().notNull(),
    note: text('note'),
    status: text('status', {
        enum:
            [
                ORDER_STATUS.PENDING,
                ORDER_STATUS.PAID,
                ORDER_STATUS.CANCELLED,
                ORDER_STATUS.CONFIRMED,
                ORDER_STATUS.REFUNDED,
                ORDER_STATUS.DELIVERING,
                ORDER_STATUS.DELIVERED
            ]
    }).notNull().default(ORDER_STATUS.PENDING),
    orderTime: integer('order_time').notNull(),
    confirmTime: integer('confirm_time'),
    deliveryTime: integer('delivery_time'),
    successTime: integer('success_time'),
    shippingDetail: text('shipping_detail', {mode: 'json'}).$type<ShippingDetail>().notNull(),
    paymentMethod: text('payment_method', {
        enum: [PAYMENT_METHOD.COD, PAYMENT_METHOD.VNPAY]
    }).notNull(),
    createdAt: integer('created_at', {mode: 'timestamp'}).notNull().default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at', {mode: 'timestamp'}).notNull().default(sql`(strftime('%s', 'now'))`),
})


