import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  console.log('Received POST request to /api/test');
  
  return new Response(JSON.stringify({ 
    message: 'POST request successful',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// Also add a GET method to test if the route is accessible
export async function GET(req: NextRequest) {
  console.log('Received GET request to /api/test');
  
  return new Response(JSON.stringify({ 
    message: 'GET request successful',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
} 