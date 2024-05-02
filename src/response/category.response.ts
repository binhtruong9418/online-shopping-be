import {z} from "@hono/zod-openapi";

const categoryResponse = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string()
})

export default categoryResponse
