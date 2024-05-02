//import api module here
import {Hono} from "hono";
import {cors} from 'hono/cors'
import auth from "./auth";
import file from "./file";
import category from "./category";
import product from "./product";

const api = new Hono()
api.use(cors())

//import more modules here
api.route('/auth', auth)
api.route('/file', file)
api.route('/category', category)
api.route('/product', product)
export default api
