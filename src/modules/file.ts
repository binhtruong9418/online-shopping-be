import {Context, Hono} from "hono";
import FileService from "../services/FileService";

const file = new Hono()

const fileService = FileService.getInstance()

file.put('/upload', async (c: Context) => {
  const bucket = c.env.BUCKET
  const data = await c.req.formData()
  const result = await fileService.uploadFile(bucket, data)
  return c.json(result)
})

file.get('/:key', async (c: Context) => {
  const bucket = c.env.BUCKET
  const key = c.req.param('key')
  return await fileService.getFile(c, bucket, key)
})
export default file
