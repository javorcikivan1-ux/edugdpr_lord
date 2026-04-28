export default async function handler(req, res) {
  try {
    // Import the Vike server handler
    const { render } = await import('../dist/server/entry.mjs')
    
    // Create page context
    const pageContext = {
      urlOriginal: req.url,
      headers: req.headers,
      method: req.method
    }
    
    // Render the page
    const result = await render(pageContext)
    
    if (result.statusCode) {
      res.status(result.statusCode)
    }
    
    if (result.headers) {
      Object.entries(result.headers).forEach(([key, value]) => {
        res.setHeader(key, value)
      })
    }
    
    res.send(result.body || result.html)
  } catch (error) {
    console.error('SSR Error:', error)
    res.status(500).send(`Internal Server Error: ${error.message}`)
  }
}
