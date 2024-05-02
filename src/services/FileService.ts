import {HTTPException} from "hono/http-exception";
import {Context} from "hono";

class FileService {
    public static instance: FileService;

    constructor() {
        //init
    }

    public static getInstance() {
        if (!FileService.instance) {
            FileService.instance = new FileService();
        }
        return FileService.instance;
    }

    public async uploadFile(bucket: R2Bucket, data: any) {
        //get value from form data
        const file = data.get('file')

        if (!file) {
            throw new HTTPException(400, {message: 'File not found'})
        }

        const temp_filename = new Date().getTime().toString();
        const fileName = temp_filename + '_' + file.name.trim().replace(/ /g, '_');
        const fileData = await file.arrayBuffer()
        await bucket.put(
            fileName,
            fileData,
            {
                httpMetadata: {
                    contentType: file.type
                }
            }
        )

        return {
            key: fileName,
        }
    }

    public async getFile(c: Context, bucket: R2Bucket, key: string) {
        const object = await bucket.get(key)
        if (!object) {
            throw new HTTPException(404, {message: 'File not found'})
        }
        const data = await object.arrayBuffer()
        const contentType = object.httpMetadata?.contentType ?? "application/octet-stream"
        return c.body(data, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `disposition: attachment; filename="${key}`
            },
        })
    }
}

export default FileService;
