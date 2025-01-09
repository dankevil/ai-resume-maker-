import { FormData } from "@/types/resume"

type AIProvider = "openrouter"

interface OptimizeOptions {
  provider: AIProvider
  jobDescription?: string
  targetRole?: string
  industry?: string
  experienceLevel?: string
}

interface ResumeValidationResult {
  isValid: boolean;
  data: FormData;
  errors: string[];
}

// Add detailed error types
interface AIError extends Error {
  code: 'PARSE_ERROR' | 'VALIDATION_ERROR' | 'API_ERROR' | 'NETWORK_ERROR';
  details?: any;
}

function createAIError(message: string, code: AIError['code'], details?: any): AIError {
  const error = new Error(message) as AIError;
  error.code = code;
  error.details = details;
  return error;
}

function validateAndRepairResume(data: FormData): ResumeValidationResult {
  const errors: string[] = [];
  const repairedData = { ...data };

  // Validate and repair personal section
  if (!repairedData.personal) {
    repairedData.personal = {
      firstName: data.personal?.firstName || "",
      lastName: data.personal?.lastName || "",
      email: data.personal?.email || "",
      phone: data.personal?.phone || "",
      location: data.personal?.location || "",
      summary: data.personal?.summary || "Professional with experience in the industry.",
    };
    errors.push("Personal section was missing or invalid");
  }

  // Ensure all required fields exist
  repairedData.personal = {
    ...repairedData.personal,
    firstName: repairedData.personal.firstName || "",
    lastName: repairedData.personal.lastName || "",
    email: repairedData.personal.email || "",
    phone: repairedData.personal.phone || "",
    location: repairedData.personal.location || "",
    summary: repairedData.personal.summary || "Professional with experience in the industry.",
  };

  // Validate and repair experience section
  if (!Array.isArray(repairedData.experience)) {
    repairedData.experience = [];
    errors.push("Experience section was invalid");
  }
  repairedData.experience = repairedData.experience.map(exp => ({
    id: exp.id || crypto.randomUUID(),
    company: exp.company || "Company Name",
    position: exp.position || "Position",
    location: exp.location || "",
    startDate: exp.startDate || "2024",
    endDate: exp.endDate || "Present",
    description: exp.description || "• Contributed to company projects and initiatives.",
    highlights: exp.highlights || [],
  }));

  // Validate and repair education section
  if (!Array.isArray(repairedData.education)) {
    repairedData.education = [];
    errors.push("Education section was invalid");
  }
  repairedData.education = repairedData.education.map(edu => ({
    id: edu.id || crypto.randomUUID(),
    school: edu.school || "School Name",
    degree: edu.degree || "Degree",
    field: edu.field || "Field of Study",
    location: edu.location || "",
    startDate: edu.startDate || "2024",
    endDate: edu.endDate || "Present",
  }));

  // Validate and repair skills section
  if (!Array.isArray(repairedData.skills)) {
    repairedData.skills = ["Professional Skills"];
    errors.push("Skills section was invalid");
  }

  return {
    isValid: errors.length === 0,
    data: repairedData,
    errors,
  };
}

const STRONG_ACTION_VERBS = {
  leadership: [
    "Led", "Managed", "Directed", "Supervised", "Coordinated", "Oversaw", "Spearheaded",
    "Orchestrated", "Guided", "Mentored", "Trained", "Facilitated", "Delegated"
  ],
  achievement: [
    "Achieved", "Improved", "Increased", "Reduced", "Decreased", "Generated", "Delivered",
    "Exceeded", "Expanded", "Optimized", "Enhanced", "Accelerated", "Maximized"
  ],
  technical: [
    "Developed", "Implemented", "Engineered", "Designed", "Architected", "Programmed",
    "Deployed", "Integrated", "Configured", "Maintained", "Debugged", "Resolved"
  ],
  analysis: [
    "Analyzed", "Evaluated", "Researched", "Investigated", "Assessed", "Identified",
    "Diagnosed", "Examined", "Reviewed", "Streamlined", "Monitored", "Measured"
  ],
  creation: [
    "Created", "Built", "Established", "Launched", "Initiated", "Introduced",
    "Pioneered", "Formulated", "Devised", "Conceptualized", "Innovated"
  ],
  communication: [
    "Presented", "Negotiated", "Collaborated", "Partnered", "Communicated", "Authored",
    "Documented", "Reported", "Influenced", "Persuaded", "Educated"
  ]
};

// Flatten action verbs for quick lookup
const ALL_ACTION_VERBS = Object.values(STRONG_ACTION_VERBS).flat();

// Add helper functions for verb detection
function isStrongActionVerb(word: string): boolean {
  // Check exact match
  if (ALL_ACTION_VERBS.includes(word)) return true;
  
  // Check common verb endings
  const verbBase = word.replace(/ed$|ing$|s$/, '');
  const variations = [
    verbBase + 'ed',
    verbBase + 'ing',
    verbBase + 's',
    verbBase
  ];
  
  return variations.some(variation => 
    ALL_ACTION_VERBS.some(verb => 
      verb.toLowerCase() === variation.toLowerCase()
    )
  );
}

function suggestStrongActionVerb(text: string): string {
  // Get the first word
  const firstWord = text.split(/\s+/)[0];
  
  // If it's already a strong verb, return the original text
  if (isStrongActionVerb(firstWord)) return text;
  
  // Find a suitable replacement based on context
  const words = text.toLowerCase().split(/\s+/);
  const context = {
    isLeadership: words.some(w => ['team', 'group', 'staff', 'member', 'direct'].includes(w)),
    isTechnical: words.some(w => ['code', 'system', 'software', 'database', 'application'].includes(w)),
    isAnalysis: words.some(w => ['data', 'analysis', 'research', 'study', 'report'].includes(w)),
    isCreation: words.some(w => ['new', 'create', 'build', 'develop', 'design'].includes(w)),
    isCommunication: words.some(w => ['client', 'customer', 'present', 'report', 'document'].includes(w))
  };

  let category = 'achievement'; // default category
  if (context.isLeadership) category = 'leadership';
  else if (context.isTechnical) category = 'technical';
  else if (context.isAnalysis) category = 'analysis';
  else if (context.isCreation) category = 'creation';
  else if (context.isCommunication) category = 'communication';

  const verbs = STRONG_ACTION_VERBS[category as keyof typeof STRONG_ACTION_VERBS];
  const replacement = verbs[Math.floor(Math.random() * verbs.length)];
  
  return `${replacement} ${text.slice(firstWord.length).trim()}`;
}

const SCHEMAS = {
  summary: {
    type: "object",
    properties: {
      summary: {
        type: "string",
        description: "Professional summary highlighting key achievements and experience",
        minLength: 50,
        maxLength: 500,
        pattern: "^[A-Z].*[.]$" // Must start with capital letter and end with period
      }
    },
    required: ["summary"],
    additionalProperties: false
  },

  experience: {
    type: "object",
    properties: {
      bulletPoints: {
        type: "array",
        items: {
          type: "string",
          description: "Achievement-focused bullet point starting with a strong action verb",
          minLength: 20,
          maxLength: 200,
          pattern: "^(Led|Managed|Developed|Created|Implemented|Achieved|Increased|Reduced|Improved|Designed|Built|Launched|Coordinated|Established|Generated|Delivered|Spearheaded|Orchestrated|Transformed|Streamlined).*" // Must start with strong action verb
        },
        minItems: 3,
        maxItems: 5,
        uniqueItems: true // Prevent duplicate bullet points
      },
      metrics: {
        type: "array",
        items: {
          type: "string",
          description: "Quantifiable achievement or metric",
          pattern: ".*\\d+.*" // Must contain at least one number
        },
        minItems: 1
      }
    },
    required: ["bulletPoints", "metrics"],
    additionalProperties: false
  },

  skills: {
    type: "object",
    properties: {
      skills: {
        type: "array",
        items: {
          type: "string",
          description: "Professional or technical skill",
          minLength: 2,
          maxLength: 50,
          pattern: "^[A-Z][A-Za-z0-9\\s/+#]+" // Must start with capital letter, allow common tech symbols
        },
        minItems: 8,
        maxItems: 12,
        uniqueItems: true // Prevent duplicate skills
      },
      categories: {
        type: "object",
        properties: {
          technical: {
            type: "array",
            items: { type: "string" },
            minItems: 3
          },
          soft: {
            type: "array",
            items: { type: "string" },
            minItems: 2
          }
        },
        required: ["technical", "soft"]
      }
    },
    required: ["skills", "categories"],
    additionalProperties: false
  }
};

export function validateContent(content: any, schema: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Type validation
  if (schema.type === "object" && typeof content !== "object") {
    errors.push(`Expected object, got ${typeof content}`);
    return { isValid: false, errors };
  }

  // Required properties
  if (schema.required) {
    for (const required of schema.required) {
      if (!(required in content)) {
        errors.push(`Missing required property: ${required}`);
      }
    }
  }

  // Property validation
  if (schema.properties) {
    for (const [key, propSchema] of Object.entries<any>(schema.properties)) {
      if (key in content) {
        // String validation
        if (propSchema.type === "string") {
          if (propSchema.minLength && content[key].length < propSchema.minLength) {
            errors.push(`${key} is too short (min ${propSchema.minLength} characters)`);
          }
          if (propSchema.maxLength && content[key].length > propSchema.maxLength) {
            errors.push(`${key} is too long (max ${propSchema.maxLength} characters)`);
          }
          if (propSchema.pattern && !new RegExp(propSchema.pattern).test(content[key])) {
            errors.push(`${key} does not match required pattern`);
          }
        }
        // Array validation
        if (propSchema.type === "array") {
          if (!Array.isArray(content[key])) {
            errors.push(`${key} must be an array`);
          } else {
            if (propSchema.minItems && content[key].length < propSchema.minItems) {
              errors.push(`${key} must have at least ${propSchema.minItems} items`);
            }
            if (propSchema.maxItems && content[key].length > propSchema.maxItems) {
              errors.push(`${key} must have at most ${propSchema.maxItems} items`);
            }
            if (propSchema.uniqueItems && new Set(content[key]).size !== content[key].length) {
              errors.push(`${key} must not contain duplicates`);
            }
            // Validate array items
            if (propSchema.items) {
              content[key].forEach((item: any, index: number) => {
                const itemValidation = validateContent(item, propSchema.items);
                if (!itemValidation.isValid) {
                  errors.push(`${key}[${index}]: ${itemValidation.errors.join(", ")}`);
                }
              });
            }
          }
        }
      }
    }
  }

  return { isValid: errors.length === 0, errors };
}

const PROMPTS = {
  summary: (data: FormData, options: OptimizeOptions) => ({
    prompt: `Optimize this professional summary for a ${options.experienceLevel || ''} role 
${options.targetRole ? `as ${options.targetRole}` : ''} 
${options.industry ? `in the ${options.industry} industry` : ''}.
${options.jobDescription ? `\nJob description: ${options.jobDescription}` : ''}

Current summary:
${data.personal.summary}

Generate a concise, professional summary (3-4 sentences) that highlights achievements, uses strong action verbs, and aligns with the target role.`,
    schema: SCHEMAS.summary
  }),

  experience: (exp: FormData["experience"][number], options: OptimizeOptions) => ({
    prompt: `Optimize this job experience description for a ${options.experienceLevel || ''} role
${options.targetRole ? `as ${options.targetRole}` : ''} 
${options.industry ? `in the ${options.industry} industry` : ''}.
${options.jobDescription ? `\nJob description: ${options.jobDescription}` : ''}

Current role: ${exp.position} at ${exp.company}
Current description:
${exp.description}

Generate 3-5 bullet points that start with strong action verbs and quantify achievements.`,
    schema: SCHEMAS.experience
  }),

  skills: (data: FormData, options: OptimizeOptions) => ({
    prompt: `Optimize these skills for a ${options.experienceLevel || ''} role
${options.targetRole ? `as ${options.targetRole}` : ''} 
${options.industry ? `in the ${options.industry} industry` : ''}.
${options.jobDescription ? `\nJob description: ${options.jobDescription}` : ''}

Current skills:
${data.skills.join(", ")}

Generate a list of 8-12 relevant technical and soft skills, prioritized by importance.`,
    schema: SCHEMAS.skills
  })
};

function cleanText(text: string): string {
  return text
    .trim()
    // Remove any markdown formatting
    .replace(/[*_~`]/g, '')
    // Remove multiple spaces
    .replace(/\s+/g, ' ')
    // Remove any "Response:" or similar prefixes
    .replace(/^(Response|Answer|Summary|Output):\s*/i, '')
    // Remove any quotes
    .replace(/^["']|["']$/g, '');
}

function extractContent(text: string, tag: string): string {
  const regex = new RegExp(`\\[${tag}\\]([\\s\\S]*?)\\[\\/${tag}\\]`);
  const match = text.match(regex);
  return match ? match[1].trim() : text.trim();
}

function parseExperienceDescription(text: string): string {
  try {
    const data = JSON.parse(text);
    return data.bulletPoints.map((point: string) => `• ${point}`).join('\n');
  } catch (error) {
    console.error("Failed to parse experience description:", error);
    return "• Contributed to company projects and initiatives.";
  }
}

function parseSkills(text: string): string[] {
  try {
    const data = JSON.parse(text);
    return data.skills;
  } catch (error) {
    console.error("Failed to parse skills:", error);
    return ["Professional Skills"];
  }
}

function parseSummary(text: string): string {
  try {
    const data = JSON.parse(text);
    return data.summary;
  } catch (error) {
    console.error("Failed to parse summary:", error);
    return "Professional with experience in the industry.";
  }
}

function ensureValidDescription(description: string): string {
  if (!description || typeof description !== 'string') {
    return "• Contributed to company projects and initiatives.";
  }

  const lines = description.split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return "• Contributed to company projects and initiatives.";
  }

  // Ensure each line starts with a bullet point
  const formattedLines = lines.map(line => 
    line.startsWith('•') ? line : `• ${line}`
  );

  // Ensure we have at least one bullet point
  if (formattedLines.length === 0) {
    formattedLines.push("• Contributed to company projects and initiatives.");
  }

  return formattedLines.join('\n');
}

function ensureValidSkills(skills: string[]): string[] {
  if (!Array.isArray(skills) || skills.length === 0) {
    return ["Professional Skills"];
  }

  return skills
    .filter(skill => typeof skill === 'string' && skill.trim().length > 0)
    .map(skill => skill.trim())
    .filter((skill, index, array) => array.indexOf(skill) === index) // Remove duplicates
    .slice(0, Math.min(12, Math.max(8, skills.length)));
}

function ensureValidSummary(summary: string | undefined): string {
  if (!summary || typeof summary !== 'string') {
    return "Professional with experience in the industry.";
  }

  const cleaned = cleanText(summary);
  if (cleaned.length < 10) {
    return "Professional with experience in the industry.";
  }

  return cleaned;
}

async function callOpenRouterAPI(prompt: string, schema: any): Promise<string> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://resume-maker.vercel.app",
        "X-Title": "Resume Maker AI",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3-8b-instruct:free",
        messages: [
          {
            role: "system",
            content: `You are a professional resume writer who provides structured, well-formatted responses. Always include quantifiable metrics and achievements. Format your response as valid JSON matching this schema: ${JSON.stringify(schema, null, 2)}`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        top_p: 0.8,
        frequency_penalty: 0.2,
        presence_penalty: 0.1,
        repetition_penalty: 1.1,
        top_k: 40,
        max_tokens: 1000,
        stream: false,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw createAIError(
        `Failed to call OpenRouter API: ${response.status} ${errorText}`,
        'API_ERROR',
        { status: response.status, body: errorText }
      );
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid API response structure:', data);
      throw createAIError(
        'Invalid response format from OpenRouter API',
        'PARSE_ERROR',
        { response: data }
      );
    }

    const content = data.choices[0].message.content;
    
    // Try to extract JSON from the response
    let parsedContent;
    try {
      // First, try parsing the entire response
      parsedContent = JSON.parse(content);
    } catch (e) {
      // If that fails, try to find and extract JSON from the text
      const jsonMatch = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          parsedContent = JSON.parse(jsonMatch[0]);
        } catch (e2) {
          console.error('Failed to parse extracted JSON:', e2);
          throw createAIError(
            'Failed to parse API response JSON',
            'PARSE_ERROR',
            { content, error: e2 }
          );
        }
      } else {
        // If no JSON found, try to format the text as JSON
        parsedContent = formatResponseAsJson(content, schema);
      }
    }

    // Validate the parsed content
    const validation = validateContent(parsedContent, schema);
    if (!validation.isValid) {
      console.warn('Response validation failed:', validation.errors);
      // Try to repair the content instead of throwing
      parsedContent = repairContent(parsedContent, schema);
    }

    return JSON.stringify(parsedContent);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw createAIError(
        'Failed to parse API response',
        'PARSE_ERROR',
        { originalError: error }
      );
    }
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw createAIError(
        'Network error while calling OpenRouter API',
        'NETWORK_ERROR',
        { originalError: error }
      );
    }
    throw error;
  }
}

function formatResponseAsJson(text: string, schema: any): any {
  // Handle different schema types
  if (schema.type === "object") {
    const result: any = {};
    
    // Extract key-value pairs from text
    for (const [key, prop] of Object.entries<any>(schema.properties)) {
      if (prop.type === "string") {
        result[key] = extractStringProperty(text, key);
      } else if (prop.type === "array") {
        result[key] = extractArrayProperty(text, key);
      }
    }
    
    return result;
  }
  
  // Default to wrapping text in appropriate structure
  return { [Object.keys(schema.properties)[0]]: text };
}

function extractStringProperty(text: string, key: string): string {
  // Try to find content after key name or similar variations
  const patterns = [
    new RegExp(`${key}:\\s*"([^"]+)"`, 'i'),
    new RegExp(`${key}:\\s*(.+)(?=\\n|$)`, 'i'),
    new RegExp(`${key}[^:]*:\\s*(.+)(?=\\n|$)`, 'i')
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  
  return "";
}

function extractArrayProperty(text: string, key: string): string[] {
  // Try to find bullet points or comma-separated lists
  const bulletPoints = text.match(/[•\-\*]\s*([^\n]+)/g);
  if (bulletPoints) {
    return bulletPoints.map(point => point.replace(/^[•\-\*]\s*/, '').trim());
  }
  
  const keyMatch = text.match(new RegExp(`${key}:\\s*([^\\n]+)`, 'i'));
  if (keyMatch) {
    return keyMatch[1].split(/,\s*/).map(item => item.trim());
  }
  
  return [];
}

function repairContent(content: any, schema: any): any {
  const repaired: any = {};
  
  for (const [key, prop] of Object.entries<any>(schema.properties)) {
    if (prop.type === "string") {
      repaired[key] = content[key] || "";
    } else if (prop.type === "array") {
      repaired[key] = Array.isArray(content[key]) ? content[key] : [];
    } else if (prop.type === "object") {
      repaired[key] = repairContent(content[key] || {}, prop);
    }
  }
  
  return repaired;
}

export async function optimizeResume(data: FormData, options: OptimizeOptions = { provider: "openrouter" }): Promise<FormData> {
  try {
    // First, validate and repair the input data
    const { isValid, data: validData, errors } = validateAndRepairResume(data);
    if (!isValid) {
      console.warn("Input data needed repairs:", errors);
    }

    // Optimize summary with fallback
    let optimizedSummary: string;
    try {
      const { prompt, schema } = PROMPTS.summary(validData, options);
      const summaryResponse = await callOpenRouterAPI(prompt, schema);
      optimizedSummary = parseSummary(summaryResponse);
    } catch (error) {
      console.error("Failed to optimize summary:", error);
      optimizedSummary = ensureValidSummary(validData.personal.summary);
    }

    // Optimize experience with fallback
    const optimizedExperience = await Promise.all(
      validData.experience.map(async (exp) => {
        try {
          const { prompt, schema } = PROMPTS.experience(exp, options);
          const description = await callOpenRouterAPI(prompt, schema);
          const parsedDescription = parseExperienceDescription(description);
          return {
            ...exp,
            description: ensureValidDescription(parsedDescription),
          };
        } catch (error) {
          console.error(`Failed to optimize experience for ${exp.company}:`, error);
          return {
            ...exp,
            description: ensureValidDescription(exp.description),
          };
        }
      })
    );

    // Optimize skills with fallback
    let optimizedSkills: string[];
    try {
      const { prompt, schema } = PROMPTS.skills(validData, options);
      const skillsResponse = await callOpenRouterAPI(prompt, schema);
      optimizedSkills = parseSkills(skillsResponse);
      if (optimizedSkills.length < 8) {
        optimizedSkills = ensureValidSkills(validData.skills);
      }
    } catch (error) {
      console.error("Failed to optimize skills:", error);
      optimizedSkills = ensureValidSkills(validData.skills);
    }

    // Final validation of the optimized content
    const finalResult = {
      ...validData,
      personal: {
        ...validData.personal,
        summary: optimizedSummary,
      },
      experience: optimizedExperience,
      skills: optimizedSkills,
    };

    // One final validation check
    const { isValid: isFinalValid, data: finalValidData } = validateAndRepairResume(finalResult);
    return finalValidData;

  } catch (error) {
    console.error("Optimization error:", error);
    // Return the validated original data as fallback
    const { data: fallbackData } = validateAndRepairResume(data);
    return fallbackData;
  }
} 