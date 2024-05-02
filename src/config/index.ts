import {z} from "zod";

export const PaginationDto = z.object({
    page: z.string().optional(),
    limit: z.string().optional()
})
