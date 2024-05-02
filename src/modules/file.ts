import {Context, Hono} from "hono";
import FileService from "../services/FileService";
import {createRoute, OpenAPIHono} from "@hono/zod-openapi";

const file = new OpenAPIHono()

const fileService = FileService.getInstance()

file.openapi(
    createRoute({
        method: 'post',
        path: '/upload',
        tags: ['file'],
        requestBody: {
            content: {
                'multipart/form-data': {
                    schema: {
                        type: 'object',
                        properties: {
                            file: {
                                type: 'string',
                                format: 'binary'
                            }
                        }
                    }
                }
            }
        },
        responses: {
            200: {
                description: 'Upload file',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                key: {
                                    type: 'string'
                                },
                            }
                        }
                    }
                }
            }
        }
    }), async (c: Context) => {
        const bucket = c.env.BUCKET
        const data = await c.req.formData()
        const result = await fileService.uploadFile(bucket, data)
        return c.json(result)
    })

file.openapi(
    createRoute({
        method: 'get',
        path: '/{key}',
        tags: ['file'],
        parameters: [
            {
                name: 'key',
                in: 'path',
                required: true,
                schema: {
                    type: 'string'
                }
            }
        ],
        responses: {
            200: {
                description: 'File',
                content: {
                    'application/octet-stream': {
                        schema: {
                            type: 'string',
                            format: 'binary'
                        }
                    }
                }
            }
        }
    }),
    async (c: Context): Promise<any> => {
        const bucket = c.env.BUCKET
        const key = c.req.param('key')
        return await fileService.getFile(c, bucket, key)
    }
)
export default file
