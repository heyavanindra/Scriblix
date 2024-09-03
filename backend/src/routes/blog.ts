import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";
import { createPostInput, updatePostInput } from "@avanindratiwari/blogging-common";

const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

// middleware auth check
blogRouter.use("/*", async (c, next) => {
  const header = c.req.header("authorization") || "";
  const token = header?.split(" ")[1];

  const user = await verify(token, c.env.JWT_SECRET);
  if (user) {
    
    c.set("userId", user.id as string);
    await next();
  } else {
    c.status(403);
    return c.json({ error: "unauthorized" });
  }
});

blogRouter.get("/bulk", async (c) => {
  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const blog = await prisma.posts.findMany({
      select:{
        content:true,
        title:true,
        id:true,
        author: {
          select:{
            name:true
          }
        }
      }
    });
    return c.json({
      blog,
    }); 
  } catch (error) {
    return c.json({
      message: "something went wrong",
    });
  }
});

blogRouter.post('/put', async (c) => {
  
	const userId = c.get('userId') as string;
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());

	const body = await c.req.json();
  const {success}= createPostInput.safeParse(body)
  if (!success) {
    c.status(411)
    return c.json({
      message:"incorrect input"
    })
  }
	const post = await prisma.posts.create({
		data: {
			title: body.title,
			content: body.content,
			authorId: userId
		}
	});
	return c.json({
		id: post.id
	});
})


// get a specific blog

blogRouter.get("/:id", async(c) => {
  const userid = c.req.param("id");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const blog = await prisma.posts.findFirst({
    where: {
        id: userid
    },
    select: {
        id: true,
        title: true,
        content: true,
        author: {
            select: {
                name: true
            }
        }
    }
})
return c.json({
  blog
});
});

// blogs


blogRouter.put("/update", async (c) => {
  const body = await c.req.json();
  const {success}= updatePostInput.safeParse(body)
  if (!success) {
    c.status(411)
    return c.json({
      message:'incorrect input'
    })
  }
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const blog = await prisma.posts.update({
    where: {
      id: body.id,
    },
    data: {
      title: body.title,
      content: body.content,
    },
  });
  return c.json({
    id: blog.id,
  });
});

// all blog


export default blogRouter;
