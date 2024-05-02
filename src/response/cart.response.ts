import {z} from "@hono/zod-openapi";
import productResponse from "./product.response";

const cartResponse = z.object({
    id: z.string(),
    products: z.array(
        z.object({
            productId: z.string(),
            quantity: z.number(),
            product: productResponse
        })
    )
})

export default cartResponse;
