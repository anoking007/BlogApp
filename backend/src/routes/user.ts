import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign} from 'hono/jwt'
import { signupInput,signinInput } from '@arghyaghosh/common-app'



const users = new Hono<{
	Bindings: {
		DATABASE_URL: string,
    JWT_SECRET:string,
	}
}>();


users.post('/signup', async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    
    const body=await c.req.json();
    const result=signupInput.safeParse(body)
if(!result.success){
  c.status(400)
  return c.json({
    error:"invalid input"
  })
}
    const userPayload=await prisma.user.create({
      data:{
        email:body.email,
        password:body.password,
      }
    })


    const token=await sign({id:userPayload.id},c.env.JWT_SECRET)
    return c.text(token)
  })
  users.post('/signin',async(c)=>{
    const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const body=await c.req.json()
  const result=signinInput.safeParse(body)
if(!result.success){
  c.status(400)
  return c.json({
    error:"invalid input"
  })
}
  const userPayload=await prisma.user.findUnique({
    where:{
      email:body.email,
      password:body.password
    }
  })
  if(!userPayload){
    c.status(403);
    return c.json({error:"user not found"})
  }
  const token=await sign({id:userPayload.id},c.env.JWT_SECRET)

    return c.text(token)
  })

  export  {users}