import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /api/resume/ocr)
  const path = request.nextUrl.pathname

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  // Create the response
  const response = NextResponse.next()

  // Add CORS headers to all responses
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', '*')

  return response
}

// Configure which paths should be processed by this middleware
export const config = {
  matcher: [
    '/api/:path*',
    '/api/resume/ocr',
  ],
} 