import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign } from "hono/jwt";
import { signinInput, signupInput } from "@avanindratiwari/blogging-common";

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  }
}>();



// signup route

userRouter.post("/signup", async (c) => {

  
  


  
  const prisma = new PrismaClient({
    datasourceUrl:c.env.DATABASE_URL
  }).$extends(withAccelerate())
  const body = await c.req.json();
  const {success}= signupInput.safeParse(body)
  if (!success) {
    c.status(411)
    return c.json({
      message:"Input not correct"
    })
    
  }
   try {
    const User= await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        password: body.password,
      },
    });
  
    const userid = User.id;
  
    const token = await sign({id:userid}, c.env.JWT_SECRET)
  
    return c.json({
      jwt: token
    });

    
    
   } catch (error) {

    c.status(403);
    return c.json({error: "error while signing up"})
    
   }
 
});



// signin route

userRouter.post("/signin", async (c) => {

  const prisma = new PrismaClient({
    //@ts-ignore
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();
  const {success}= signinInput.safeParse(body)
  if (!success) {
    c.status(411)
    return c.json({
      message:"Input not correct"
    })
    
  }
  try {
    const UserExists= await prisma.user.findUnique({
      where:{
      email:body.email,
      password:body.password
      }
    })
    if (!UserExists) {
      c.status(403)
      return c.text('user does not exist')
    }else {
      const jwt = await sign({id:UserExists.id}, c.env.JWT_SECRET)
      return c.json({jwt})
    }
    
  } catch (error) {
    c.status(411);
    return c.text('Invalid')
  }


  
});





// jwt
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImIwYjFhOTQ1LTcwNDgtNGM3Ny05MWZhLTc4ZGM2ZGYyZjg2ZSJ9.__8ZkGoXkuc7CsmA0_HM3MZtBBzIf17qpKFuH8PoVW4