//import api module here
import {cors} from 'hono/cors'
import auth from "./auth";
import file from "./file";
import category from "./category";
import product from "./product";
import {OpenAPIHono} from "@hono/zod-openapi";
import cart from "./cart";

const api = new OpenAPIHono()
api.use(cors())

//import more modules here
api.route('/auth', auth)
api.route('/file', file)
api.route('/category', category)
api.route('/product', product)
api.route('/cart', cart)
export default api
