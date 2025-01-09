import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import Anthropic from '@anthropic-ai/sdk';

const optimizeSchema = z.object({
  content: z.object({
    personal: z.object({
      fullName: z.string(),
      email: z.string().email(),
      phone: z.string(),
      location: z.string(),
      aboutMe: z.string().optional().default(''),
      summary: z.string(),
      highlights: z.array(z.string()).optional(),
      achievements: z.array(z.string()).optional(),
    }),
    education: z.array(
      z.object({
        school: z.string(),
        degree: z.string(),
        field: z.string(),
        startDate: z.string(),
        endDate: z.string().optional().default(''),
        achievements: z.array(z.string()).optional(),
        highlights: z.array(z.string()).optional(),
      })
    ),
    experience: z.array(
      z.object({
        company: z.string(),
        position: z.string(),
        location: z.string(),
        startDate: z.string(),
        endDate: z.string().optional().default(''),
        description: z.string(),
        achievements: z.array(z.string()).optional(),
        highlights: z.array(z.string()).optional(),
        impact: z.string().optional(),
      })
    ),
    skills: z.array(z.string()),
  }),
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240222';

async function optimizeField(content: string, fieldType: string, context: any = {}) {
  try {
    let prompt = '';
    if (fieldType === "professional summary") {
      prompt = `Generate a compelling professional summary for a ${context.latestRole || 'web developer'} with the following details:
        - Skills: ${context.skills.join(', ')}
        - Latest Role: ${context.latestRole || 'Web Developer'} at ${context.latestCompany || 'GirnarSoft'}
        - Total Experience: ${context.totalExperience}
        - Education: ${context.education}
        
        Generate a detailed 3-4 sentence summary that:
        1. Highlights technical expertise and years of experience
        2. Showcases key achievements and skills
        3. Mentions career goals and passion for technology
        4. Emphasizes value proposition and industry impact
        
        Current content to enhance: "${content || 'No content provided'}"`;
    } else if (fieldType === "about me") {
      prompt = `Generate a personalized "About Me" section for a ${context.latestRole || 'web developer'} with:
        - Technical Background: ${context.skills.join(', ')}
        - Current Role: ${context.latestRole || 'Web Developer'} at ${context.latestCompany || 'GirnarSoft'}
        - Experience Level: ${context.totalExperience}
        - Educational Background: ${context.education}
        
        Create a 4-5 sentence personal statement that:
        1. Shows passion for technology and web development
        2. Highlights expertise in ${context.skills.slice(0, 3).join(', ')} and related technologies
        3. Mentions personal projects or interests in AI/technology
        4. Describes career aspirations and commitment to learning
        5. Emphasizes problem-solving abilities and innovative thinking
        
        Current content to enhance: "${content || 'No content provided'}"`;
    } else if (fieldType === "job description") {
      prompt = `Generate a detailed job description for a ${context.position} role at ${context.company} with:
        - Position: ${context.position}
        - Company: ${context.company}
        - Duration: ${context.duration}
        - Technologies: ${context.skills.join(', ')}
        
        Create a comprehensive description that:
        1. Starts with strong action verbs
        2. Details 3-4 major responsibilities
        3. Mentions specific projects and technologies used
        4. Includes metrics and achievements (estimated)
        5. Shows impact on business objectives
        
        Current content to enhance: "${content || 'No content provided'}"`;
    }

    const message = await anthropic.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 1500,
      temperature: 0.7,
      system: `You are a professional resume optimizer and content generator. Your task is to ${content ? 'enhance' : 'generate'} content that is detailed, specific, and impactful.
        
        ${prompt}
        
        Return ONLY the optimized/generated text without any explanation or additional formatting.`,
      messages: [{ role: 'user', content: prompt }]
    });

    const messageContent = message.content[0];
    if ('text' in messageContent) {
      return messageContent.text || content || "Generated content not available";
    }
    return content || "Generated content not available";
  } catch (error) {
    console.error(`Failed to optimize ${fieldType}:`, error);
    return content || "Generated content not available";
  }
}

async function generateHighlightsAndAchievements(content: string, type: string, context: any = {}) {
  try {
    let prompt = '';
    if (type === "personal profile") {
      prompt = `Based on the profile of a ${context.latestRole || 'web developer'} with:
        - Skills: ${context.skills.join(', ')}
        - Latest Role: ${context.latestRole || 'Web Developer'} at ${context.latestCompany || 'GirnarSoft'}
        - Experience: ${context.totalExperience}
        - Education: ${context.education}
        
        Generate impressive highlights and achievements that:
        1. Showcase technical expertise
        2. Include specific metrics and numbers
        3. Highlight project successes
        4. Demonstrate business impact`;
    } else if (type === "job experience") {
      prompt = `For a ${context.position} role at ${context.company} with duration ${context.duration}, generate:
        1. Technical achievements using ${context.skills.join(', ')}
        2. Project successes and metrics
        3. Team contributions and leadership
        4. Business impact and improvements`;
    } else if (type === "education") {
      prompt = `For a ${context.degree} in ${context.field} from ${context.school}, generate:
        1. Academic achievements
        2. Relevant coursework
        3. Technical projects
        4. Leadership roles`;
    }

    const message = await anthropic.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 1500,
      temperature: 0.7,
      system: `You are a professional resume content generator. Generate impressive achievements and highlights based on the following context.
        
        ${prompt}
        
        Format the response as a JSON object with:
        {
          "highlights": [
            "Implemented X using Y, resulting in Z% improvement",
            "Led development of A using B, achieving C",
            "Designed and deployed D, reducing E by F%"
          ],
          "achievements": [
            "Increased performance by X% through Y optimization",
            "Reduced deployment time by Z% by implementing A"
          ],
          "impact": "Drove significant business value through technical innovation and leadership"
        }
        
        Ensure all points are specific, measurable, and impressive.`,
      messages: [{ role: 'user', content: prompt }]
    });

    const messageContent = message.content[0];
    if ('text' in messageContent) {
      const result = JSON.parse(messageContent.text || "{}");
      return {
        highlights: result.highlights || [
          "Implemented modern web technologies resulting in improved performance",
          "Led development of key features using cutting-edge tools",
          "Designed and optimized systems for better efficiency"
        ],
        achievements: result.achievements || [
          "Increased application performance through optimization",
          "Reduced development cycle time through process improvements"
        ],
        impact: result.impact || "Delivered significant technical improvements and business value"
      };
    }
    return {
      highlights: [
        "Implemented modern web technologies resulting in improved performance",
        "Led development of key features using cutting-edge tools",
        "Designed and optimized systems for better efficiency"
      ],
      achievements: [
        "Increased application performance through optimization",
        "Reduced development cycle time through process improvements"
      ],
      impact: "Delivered significant technical improvements and business value"
    };
  } catch (error) {
    console.error(`Failed to generate highlights for ${type}:`, error);
    return {
      highlights: [
        "Implemented modern web technologies resulting in improved performance",
        "Led development of key features using cutting-edge tools",
        "Designed and optimized systems for better efficiency"
      ],
      achievements: [
        "Increased application performance through optimization",
        "Reduced development cycle time through process improvements"
      ],
      impact: "Delivered significant technical improvements and business value"
    };
  }
}

async function optimizeExperience(experience: any, context: any = {}) {
  const optimizedDesc = await optimizeField(
    experience.description, 
    "job description",
    {
      position: experience.position,
      company: experience.company,
      duration: `${experience.startDate} - ${experience.endDate || 'Present'}`,
      skills: context.skills
    }
  );
  
  const extras = await generateHighlightsAndAchievements(
    optimizedDesc,
    "job experience",
    {
      position: experience.position,
      company: experience.company,
      duration: `${experience.startDate} - ${experience.endDate || 'Present'}`,
      skills: context.skills
    }
  );
  
  return {
    ...experience,
    description: optimizedDesc,
    highlights: extras.highlights,
    achievements: extras.achievements,
    impact: extras.impact
  };
}

async function optimizeEducation(education: any, context: any = {}) {
  const extras = await generateHighlightsAndAchievements(
    `${education.degree} in ${education.field} from ${education.school}`,
    "education",
    {
      degree: education.degree,
      field: education.field,
      school: education.school,
      duration: `${education.startDate} - ${education.endDate || 'Present'}`,
      skills: context.skills
    }
  );
  
  return {
    ...education,
    highlights: extras.highlights,
    achievements: extras.achievements
  };
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content } = optimizeSchema.parse(body);

    // Create context for AI optimization
    const context = {
      skills: content.skills,
      totalExperience: content.experience.length > 0 ? 
        `${content.experience.length} positions` : 
        "Entry level",
      latestRole: content.experience[0]?.position || "",
      latestCompany: content.experience[0]?.company || "",
      education: content.education.map(edu => 
        `${edu.degree} in ${edu.field} from ${edu.school}`
      ).join(", ")
    };

    // Optimize each section independently
    const personalExtras = await generateHighlightsAndAchievements(
      content.personal.summary + "\n" + (content.personal.aboutMe || ''),
      "personal profile",
      context
    );

    const optimizedContent = {
      personal: {
        ...content.personal,
        summary: await optimizeField(content.personal.summary, "professional summary", context),
        aboutMe: await optimizeField(content.personal.aboutMe, "about me", context),
        highlights: personalExtras.highlights,
        achievements: personalExtras.achievements,
      },
      education: await Promise.all(content.education.map(edu => optimizeEducation(edu, context))),
      experience: await Promise.all(content.experience.map(exp => optimizeExperience(exp, context))),
      skills: content.skills,
    };

    return NextResponse.json({ data: optimizedContent });
  } catch (error) {
    console.error("Resume optimization error:", error);
    return NextResponse.json(
      { 
        error: "Failed to optimize resume", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
} 