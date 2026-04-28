export default async function handler(req, res) {
  try {
    // Import the Vike server handler
    const vikeServer = await import('../dist/server/entry.mjs')
    
    // Create page context
    const pageContext = {
      urlOriginal: req.url,
      headers: req.headers,
      method: req.method
    }
    
    // Try different possible exports
    let result
    if (vikeServer.render) {
      result = await vikeServer.render(pageContext)
    } else if (vikeServer.default) {
      result = await vikeServer.default(pageContext)
    } else if (vikeServer.handler) {
      result = await vikeServer.handler(pageContext)
    } else {
      // Log available exports for debugging
      console.log('Available exports:', Object.keys(vikeServer))
      throw new Error('No render function found in Vike server')
    }
    
    if (result.statusCode) {
      res.status(result.statusCode)
    }
    
    if (result.headers) {
      Object.entries(result.headers).forEach(([key, value]) => {
        res.setHeader(key, value)
      })
    }
    
    res.send(result.body || result.html || result.documentHtml)
  } catch (error) {
    console.error('SSR Error:', error)
    res.status(500).send(`Internal Server Error: ${error.message}`)
  }
}
