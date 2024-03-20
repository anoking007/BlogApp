import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
const prisma = new PrismaClient()
import { Hono } from 'hono'
import { rootRouter } from './routes'
const app = new Hono()

app.route("/api/v1",rootRouter)



export default app
