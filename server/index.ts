import express from 'express'
import compression from 'compression'
import { renderPage } from 'vike/server'
import { root } from './root.js'

const isProduction = process.env.NODE_ENV === 'production'
const PORT = process.env.PORT || 52525
const router = express.Router();

const app = express()

app.use(compression())
app.use(express.urlencoded({ extended: false }));
app.use('/api', router);

startServer()

async function startServer() {

  // Vite integration
  if (isProduction) {
    // In production, we need to serve our static assets ourselves.
    // (In dev, Vite's middleware serves our static assets.)
    const sirv = (await import('sirv')).default
    app.use(sirv(`${root}/dist/client`))
  } else {
    // We instantiate Vite's development server and integrate its middleware to our server.
    // ⚠️ We instantiate it only in development. (It isn't needed in production and it
    // would unnecessarily bloat our production server.)
    const vite = await import('vite')
    const viteDevMiddleware = (
      await vite.createServer({
        root,
        server: { middlewareMode: true }
      })
    ).middlewares
    app.use(viteDevMiddleware)
  }

  // ...
  // Other middlewares (e.g. some RPC middleware such as Telefunc)
  // ...

  // Vike middleware. It should always be our last middleware (because it's a
  // catch-all middleware superseding any middleware placed after it).
  app.get('*', async (req, res) => {
    const pageContextInit = {
      urlOriginal: req.originalUrl,
      headersOriginal: req.headers
    }
    const pageContext = await renderPage(pageContextInit)
    if (pageContext.errorWhileRendering) {
      // Install error tracking here, see https://vike.dev/error-tracking
    }
    const { httpResponse } = pageContext
    if (res.writeEarlyHints) res.writeEarlyHints({ link: httpResponse.earlyHints.map((e) => e.earlyHintLink) })
    httpResponse.headers.forEach(([name, value]) => res.setHeader(name, value))
    res.status(httpResponse.statusCode)
    // For HTTP streams use pageContext.httpResponse.pipe() instead, see https://vike.dev/streaming
    res.send(httpResponse.body)
  })

  app.listen(PORT)
  console.log(`Server running at PORT ${PORT}`)
}
