import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, sign, verify } from 'hono/jwt'

const blog = new Hono<{
	Bindings: {
		DATABASE_URL: string,
    JWT_SECRET:string,
	},
  Variables:{
    userId:string
  }
}>();


blog.use('/*',async(c,next)=>{
  const header=await c.req.header('authorization') || ""
  if(!header){
    c.status(403);
    return c.json({error:"Authorization fail"})
  }
  const auth=header.split(" ")
  const result=await verify(auth[1],c.env.JWT_SECRET)
  if(result){
    c.set("userId",result.id)
    await next();
  }
  else{
    c.status(403)
    return c.json({error:"Authorization fail"})
  }

})
blog.post('/',async(c)=>{
  const userId=c.get("userId")
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate())
  const body=await c.req.json()
  const blog=await prisma.post.create({
    data:{
      title:body.title,
      content:body.content,
      authorId:userId,
      
    }
  })

    return c.json({
      id:blog.id
    })
  })
blog.put('/',async(c)=>{
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate())
const body=await c.req.json()
const blog=await prisma.post.update({
  where:{
    id:body.id,
  },
  data:{
    title:body.title,
    content:body.content,
   
  }
})
return c.json({
  id:blog.id
})
  })
  blog.get('/bulk',async(c)=>{
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  
  const blog=await prisma.post.findMany()
      return c.json({blog})
      
    })

blog.get('/:id',async(c)=>{
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate())
const id=await c.req.param('id')
const blog=await prisma.post.findFirst({
  where:{
    id:id,
  }
})
    return c.json({blog})
  })


export{blog}