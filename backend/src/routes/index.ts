import { users } from "./user";
import { blog } from "./blog";
import { Hono } from "hono";

const rootRouter=new Hono()

rootRouter.route('/user',users)
rootRouter.route('/blog',blog)

export{rootRouter}
