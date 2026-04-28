export default async function handler(req, res) {
  // Import the Vike server handler
  const { renderPage } = await import('../dist/server/entry.mjs')
  
  // Create page context
  const pageContext = {
    urlOriginal: req.url,
    headers: req.headers,
    method: req.method
  }
  
  try {
    // Render the page
    const result = await renderPage(pageContext)
    
    if (result.statusCode) {
      res.status(result.statusCode)
    }
    
    if (result.headers) {
      Object.entries(result.headers).forEach(([key, value]) => {
        res.setHeader(key, value)
      })
    }
    
    res.send(result.body)
  } catch (error) {
    console.error('SSR Error:', error)
    res.status(500).send('Internal Server Error')
  }
}
