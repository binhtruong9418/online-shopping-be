import { z } from '@hono/zod-openapi';

const ProductResponse = z.object({
    id: z.number(),
    name: z.string(),
    price: z.number(),
    category: z.string(),
    description: z.string(),
    images: z.array(z.string()),
    discount: z.number()
})

export default ProductResponse
