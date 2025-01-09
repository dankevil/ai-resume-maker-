import { NextRequest } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import pdfParse from 'pdf-parse';
import { createWorker, type Worker } from 'tesseract.js';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Configure model with safety settings
const modelConfig = {
  model: 'gemini-1.5-flash',
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
  generationConfig: {
    temperature: 0.1,
    topP: 0.1,
    topK: 16,
  },
};

const PROMPT = `You are a resume parser. Extract the following information from the text in a structured format. If a field is not found in the text, leave it empty. Format the response as valid JSON:

{
  "personal": {
    "firstName": "",
    "lastName": "",
    "email": "",
    "phone": "",
    "location": "",
    "summary": ""
  },
  "education": [
    {
      "school": "",
      "degree": "",
      "field": "",
      "startDate": "",
      "endDate": "",
      "location": ""
    }
  ],
  "experience": [
    {
      "company": "",
      "position": "",
      "startDate": "",
      "endDate": "",
      "location": "",
      "description": "",
      "highlights": []
    }
  ],
  "skills": []
}

Instructions:
1. Split full names into firstName and lastName. If only one name is found, treat it as firstName.
2. Format dates as YYYY-MM. If only year is found, use YYYY-01.
3. Extract key skills from experience descriptions and any skills sections.
4. Keep descriptions concise but informative.
5. Include all relevant information found in the text.
6. For phone numbers, maintain the original format found in the text.
7. For email addresses, preserve the exact format and case.
8. Ensure the output is valid JSON that matches the exact structure above.`;

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    if (!data || typeof data.text !== 'string') {
      throw new Error('Invalid PDF data');
    }
    return data.text.trim();
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF');
  }
}

async function extractTextFromImage(buffer: Buffer, fileType: string): Promise<string> {
  let worker: Worker | null = null;
  let tempPath: string | null = null;

  try {
    // Create a temporary file with proper extension
    const ext = fileType.split('/')[1] || 'png';
    tempPath = join(tmpdir(), `upload-${Date.now()}.${ext}`);
    await fs.writeFile(tempPath, buffer);

    // Initialize worker with better logging
    worker = await createWorker({
      logger: m => console.log('Tesseract:', m),
      errorHandler: e => console.error('Tesseract error:', e),
    });

    await worker.loadLanguage('eng');
    await worker.initialize('eng');

    // Perform OCR with better quality settings
    const { data: { text } } = await worker.recognize(tempPath);
    const cleanedText = text.trim();
    console.log('Extracted text length:', cleanedText.length);
    return cleanedText;
  } catch (error) {
    console.error('Error performing OCR:', error);
    throw new Error('Failed to perform OCR');
  } finally {
    // Clean up
    if (worker) {
      await worker.terminate();
    }
    if (tempPath) {
      try {
        await fs.unlink(tempPath);
      } catch (error) {
        console.error('Error cleaning up temp file:', error);
      }
    }
  }
}

// Configure the API route
export const config = {
  api: {
    bodyParser: false,
    responseLimit: '50mb',
  },
};

// Set runtime and dynamic configuration
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// Handle GET requests
export async function GET() {
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 
      'Content-Type': 'application/json',
      ...corsHeaders 
    },
  });
}

// Update the existing POST handler
export async function POST(request: NextRequest) {
  console.log('Received POST request to /api/resume/ocr');

  const headers = {
    'Content-Type': 'application/json',
    ...corsHeaders,
  };

  try {
    // Validate API key first
    if (!process.env.GOOGLE_API_KEY) {
      console.error('Missing GOOGLE_API_KEY environment variable');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Server configuration error'
        }),
        { status: 500, headers }
      );
    }

    const formData = await request.formData().catch(error => {
      console.error('Error parsing form data:', error);
      throw new Error('Invalid form data');
    });

    const file = formData.get('file') as File | null;

    if (!file) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No file uploaded'
        }), 
        {
          status: 400,
          headers,
        }
      );
    }

    // Log file details
    console.log('Processing file:', {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // Validate file type
    const fileType = file.type.toLowerCase();
    if (!fileType.startsWith('image/') && fileType !== 'application/pdf') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Unsupported file type. Only PDF and image files (JPG, PNG) are supported.'
        }),
        {
          status: 400,
          headers,
        }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Add more detailed logging for text extraction
    let text: string;
    try {
      if (fileType === 'application/pdf') {
        console.log('Processing PDF file...');
        text = await extractTextFromPDF(buffer);
      } else {
        console.log('Processing image file...');
        text = await extractTextFromImage(buffer, fileType);
      }

      console.log('Extracted text length:', text?.length || 0);
      
      if (!text || text.trim().length === 0) {
        throw new Error('No text extracted from file');
      }
    } catch (error) {
      console.error('Text extraction failed:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to extract text from file',
          details: error instanceof Error ? error.message : 'Unknown error'
        }),
        { status: 500, headers }
      );
    }

    // Improve AI processing error handling
    console.log('Starting AI processing...');
    const model = genAI.getGenerativeModel(modelConfig);

    try {
      const result = await model.generateContent([
        { text: PROMPT },
        { text: '\n\nText to parse:\n' + text },
      ]);

      const responseText = result.response?.text();
      if (!responseText) {
        throw new Error('Empty response from AI');
      }

      // Validate JSON before parsing
      try {
        const parsedData = JSON.parse(responseText);
        // Validate and clean up the parsed data
        if (!parsedData.personal || !parsedData.education || !parsedData.experience || !parsedData.skills) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Invalid data structure in response'
            }),
            {
              status: 500,
              headers,
            }
          );
        }

        // Clean up and validate data
        const cleanedData = {
          success: true,
          data: {
            personal: {
              firstName: parsedData.personal.firstName || '',
              lastName: parsedData.personal.lastName || '',
              email: parsedData.personal.email || '',
              phone: parsedData.personal.phone || '',
              location: parsedData.personal.location || '',
              summary: parsedData.personal.summary || '',
            },
            education:
              Array.isArray(parsedData.education) && parsedData.education.length > 0
                ? parsedData.education
                : [
                    {
                      school: '',
                      degree: '',
                      field: '',
                      startDate: '',
                      endDate: '',
                      location: '',
                    },
                  ],
            experience:
              Array.isArray(parsedData.experience) && parsedData.experience.length > 0
                ? parsedData.experience
                : [
                    {
                      company: '',
                      position: '',
                      startDate: '',
                      endDate: '',
                      location: '',
                      description: '',
                      highlights: [],
                    },
                  ],
            skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
          }
        };

        console.log('Successfully parsed and validated data');
        return new Response(JSON.stringify(cleanedData), {
          status: 200,
          headers,
        });
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Invalid JSON response from AI',
            details: jsonError instanceof Error ? jsonError.message : 'Unknown error'
          }),
          { status: 500, headers }
        );
      }
    } catch (aiError) {
      console.error('AI processing error:', aiError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'AI processing failed',
          details: aiError instanceof Error ? aiError.message : 'Unknown error'
        }),
        { status: 500, headers }
      );
    }
  } catch (error) {
    console.error('General error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Request processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers }
    );
  }
} 