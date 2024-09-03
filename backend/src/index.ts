import { Hono } from 'hono'
import { userRouter } from './routes/user';
import blogRouter  from './routes/blog';
import { cors } from 'hono/cors';



const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  },
  Variables: {
    userId:string
  }
}>();

app.use('/*', cors())







app.route("/api/v1/user", userRouter);
app.route("/api/v1/blog", blogRouter);

export default app


// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAzZDA1ZGM0LWYxY2ItNGUwOS1iMzJlLWJhYTQyY2JjNzc5ZSJ9.9K8XUfJaxbZoistxfDGYrIqGd9e28JkFOX_OevL8x2g


// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM1NmVlNjQ0LWUxMjEtNDdhMC04ZDE0LTU4YTE4MjIyZmVhNyJ9.cdBX7QJfbHb5W525bjf2LcHEdKT6zQcijJoE8pLDo7I