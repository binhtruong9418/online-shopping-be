import {Context, Hono} from 'hono'
import {DrizzleD1Database} from "drizzle-orm/d1";
import api from "./modules";
import {showRoutes} from "hono/dev";
import {HTTPException} from "hono/http-exception";
import {swaggerUI} from "@hono/swagger-ui";
import {OpenAPIHono} from "@hono/zod-openapi";


type Bindings = {
  DB: D1Database;
  database_id: string;
  database_name: string;
  BUCKET: R2Bucket;
};

type Variables = {
  db: DrizzleD1Database
}

const app = new OpenAPIHono<{ Bindings: Bindings, Variables: Variables }>()


// Use the middleware to serve Swagger UI at /ui
app.get('/doc', swaggerUI({ url: '/swagger-doc' }))
app.doc('/swagger-doc', {
  info: {
    title: 'Online shopping API',
    version: 'v1'
  },
  openapi: '3.1.0'
})

app.get('/', (c) => c.text("Hello, I'm Hono! I'm running on cloudflare workers!"))
app.notFound((c: Context) => c.json({message: 'Not Found', ok: false}, 404))
app.onError(async (err: any, c: Context) => {
  console.error(err)
  if (err instanceof HTTPException) {
    // Get the custom response
    const errorResponse = err.getResponse()
    const errorData = await errorResponse.text()
    return c.json({
      message: errorData,
      ok: false
    }, errorResponse.status)
  }
  return c.json({message: err.message, ok: false}, 500)
})

//load api routes
app.route('/api', api)
console.log('AVAILABLE ROUTES:')
showRoutes(app)
export default app
