'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function TestPage() {
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testGet = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/test');
      const data = await response.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setResponse(error instanceof Error ? error.message : 'Failed to make GET request');
    } finally {
      setLoading(false);
    }
  };

  const testPost = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setResponse(error instanceof Error ? error.message : 'Failed to make POST request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      
      <Card className="p-4 mb-4">
        <div className="space-x-4">
          <Button onClick={testGet} disabled={loading}>
            Test GET
          </Button>
          <Button onClick={testPost} disabled={loading}>
            Test POST
          </Button>
        </div>
      </Card>

      {response && (
        <Card className="p-4">
          <h2 className="font-semibold mb-2">Response:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {response}
          </pre>
        </Card>
      )}
    </div>
  );
} 