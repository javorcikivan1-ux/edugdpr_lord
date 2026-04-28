import { renderPage } from 'vike/server'

export default async function handler(req, res) {
  const pageContextInit = {
    urlOriginal: req.url
  }
  
  const pageContext = await renderPage(pageContextInit)
  const httpResponse = pageContext.httpResponse
  
  if (!httpResponse) {
    res.statusCode = 404
    res.end('Not found')
    return
  }
  
  const { body, statusCode, headers } = httpResponse
  headers.forEach(([name, value]) => {
    res.setHeader(name, value)
  })
  res.statusCode = statusCode
  res.end(body)
}
