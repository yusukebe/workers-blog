import { Hono } from 'hono'
import { html, raw } from 'hono/html'
import { blog } from './middleware'

const app = new Hono()

app.get('/', (c) => c.html(html`<a href="/blog">Blog</a>`))
app.get(
  '/blog/*',
  blog({
    wrapper: (content) =>
      html`<html>
        <body>
          <h1>My Blog</h1>
          <div>${raw(content)}</div>
        </body>
      </html>`,
  })
)

export default app
