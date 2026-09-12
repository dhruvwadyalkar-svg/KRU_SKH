import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import axios from 'axios'
import { validateLearningScope, BLOCKED_SCOPE_MESSAGE } from '@/lib/learningScopeGuard'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { analysis, targetRole, skills, userQuery } = body
    
    if (!analysis && !targetRole && (!skills || skills.length === 0)) {
      return NextResponse.json({ error: 'Analysis data or target role required' }, { status: 400 })
    }

    if (userQuery && userQuery.trim()) {
      const scopeCheck = await validateLearningScope(userQuery.trim())
      if (!scopeCheck.allowed) {
        return NextResponse.json({ error: BLOCKED_SCOPE_MESSAGE, blocked: true }, { status: 400 })
      }
    }

    const roadmap = await generateRoadmap({ analysis, targetRole, skills }, userQuery)

    return NextResponse.json({
      success: true,
      roadmap
    })

  } catch (error: any) {
    console.error('Roadmap generation error:', error)
    return NextResponse.json({ error: error.message || 'Roadmap generation failed' }, { status: 500 })
  }
}

async function generateRoadmap(
  params: { analysis?: any; targetRole?: string; skills?: string[] },
  userQuery?: string
) {
  const GROQ_API_KEY = process.env.GROQ_API_KEY || ''
  const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
  const AI_MODEL = process.env.AI_MODEL || 'llama-3.3-70b-versatile'

  const analysis = params.analysis || {}
  const targetRole = params.targetRole || analysis.target_role || 'Software Engineer'
  const missingSkills: string[] = params.skills || analysis.missing_skills || analysis.skills_to_learn?.map((s: any) => s.skill) || ['System Design', 'Docker', 'Cloud Infrastructure', 'CI/CD']
  const skillsToLearn: any[] = analysis.skills_to_learn || missingSkills.map((sk: string, i: number) => ({
    skill: sk,
    priority: i < 2 ? 'High' : 'Medium',
    learning_time: i < 2 ? '1 week' : '2 weeks'
  }))

  if (!GROQ_API_KEY) {
    return generateFallbackRoadmap(targetRole, missingSkills, userQuery)
  }

  const prompt = `You are a Principal Tech Lead and Career Architect. Create a rigorous, highly-actionable 4-5 week learning roadmap for target role: "${targetRole}".

TARGET ROLE: ${targetRole}
MISSING COMPETENCIES TO BRIDGE: ${missingSkills.join(', ')}

PRIORITIZED SKILLS:
${skillsToLearn.map((s: any) => `- ${s.skill} (Priority: ${s.priority || 'High'}, Time: ${s.learning_time || '1-2 weeks'})`).join('\n')}

${userQuery ? `STUDENT CUSTOMIZATION REQUEST: ${userQuery}\n` : ''}

CRITICAL RULES:
1. Provide a realistic daily schedule in hours and topic breakdown.
2. For each task, provide concrete, exact YouTube search queries (e.g., "Docker containerization complete course for beginners", "PostgreSQL database indexing and query optimization").
3. Output MUST be valid, parseable JSON with NO markdown commentary outside the JSON.

JSON STRUCTURE:
{
  "critical_skills": ["skill1", "skill2"],
  "roadmap": [
    {
      "week": 1,
      "title": "Week title",
      "focus": "Core focus",
      "skills": ["skill1", "skill2"],
      "tasks": [
        {
          "task": "Specific actionable technical exercise",
          "duration": "2.5 hours",
          "resources": [
            {
              "title": "Resource title",
              "type": "video",
              "search_query": "exact YouTube search query"
            }
          ]
        }
      ],
      "milestone": "Measurable outcome or mini-project"
    }
  ],
  "daily_schedule": {
    "hours_per_day": "2-3 hours/day",
    "breakdown": "30 mins concept study + 60 mins coding implementation + 30 mins review"
  },
  "tips": [
    "Build a production portfolio project integrating these skills",
    "Implement unit and integration tests from day one"
  ]
}`

  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        messages: [
          {
            role: 'system',
            content: 'You are an expert career architect. Return only pure JSON conforming to the requested schema.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: AI_MODEL,
        temperature: 0.3,
        max_tokens: 3500,
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 25000
      }
    )

    const content = response.data.choices?.[0]?.message?.content || ''
    return parseAndCleanJson(content, () => generateFallbackRoadmap(targetRole, missingSkills, userQuery))
  } catch (error: any) {
    console.warn('Groq roadmap call failed, generating robust fallback roadmap:', error.response?.data || error.message)
    return generateFallbackRoadmap(targetRole, missingSkills, userQuery)
  }
}

function parseAndCleanJson(raw: string, fallbackFn: () => any) {
  try {
    let clean = raw.trim()
    const codeBlockMatch = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
    if (codeBlockMatch) clean = codeBlockMatch[1].trim()

    const jsonMatch = clean.match(/\{[\s\S]*\}/)
    if (jsonMatch) clean = jsonMatch[0]

    // Remove illegal control chars inside strings if any
    clean = clean.replace(/[\u0000-\u001F]+/g, (match) => {
      if (match === '\n' || match === '\r' || match === '\t') return match
      return ''
    })

    const parsed = JSON.parse(clean)
    if (parsed.roadmap && Array.isArray(parsed.roadmap) && parsed.roadmap.length > 0) {
      return parsed
    }
    return fallbackFn()
  } catch {
    return fallbackFn()
  }
}

function generateFallbackRoadmap(targetRole: string, missingSkills: string[], userQuery?: string) {
  const skills = missingSkills.length > 0 ? missingSkills : ['Full-Stack Engineering', 'Database Systems', 'DevOps & Cloud', 'System Design']
  const critical = skills.slice(0, 3)

  return {
    critical_skills: critical,
    roadmap: [
      {
        week: 1,
        title: `Foundations of ${skills[0] || 'Core Architecture'}`,
        focus: `Master fundamentals and patterns in ${skills[0] || 'Core Architecture'} for ${targetRole}`,
        skills: [skills[0] || 'Core Fundamentals', skills[1] || 'Design Patterns'].filter(Boolean),
        tasks: [
          {
            task: `Study syntax, memory model, and idiomatic conventions in ${skills[0]}`,
            duration: '2 hours',
            resources: [
              {
                title: `${skills[0]} Complete Crash Course`,
                type: 'video',
                search_query: `${skills[0]} crash course for beginners full tutorial`
              }
            ]
          },
          {
            task: `Build a CLI or micro-service demonstrating clean architectural principles`,
            duration: '3 hours',
            resources: [
              {
                title: `Building production applications with ${skills[0]}`,
                type: 'video',
                search_query: `${skills[0]} real world project build step by step`
              }
            ]
          }
        ],
        milestone: `Functional GitHub repository with automated tests demonstrating mastery of ${skills[0]}`
      },
      {
        week: 2,
        title: `Intermediate Mastery & Practical Implementation`,
        focus: `Deep-dive into ${skills[1] || 'API & Data Layers'} with real-world scenarios`,
        skills: [skills[1] || 'Database & ORM', 'Error Handling & Async'].filter(Boolean),
        tasks: [
          {
            task: `Implement relational schema, indexing, and connection pooling`,
            duration: '2.5 hours',
            resources: [
              {
                title: `Production database design and optimization`,
                type: 'video',
                search_query: `${skills[1] || 'Database'} best practices and indexing tutorial`
              }
            ]
          },
          {
            task: `Integrate REST / GraphQL endpoints with strict validation and middleware`,
            duration: '3 hours',
            resources: [
              {
                title: `RESTful API Architecture & Authentication`,
                type: 'video',
                search_query: `Secure API architecture JWT authentication best practices`
              }
            ]
          }
        ],
        milestone: `Fully authenticated backend service with validation, logging, and error boundaries`
      },
      {
        week: 3,
        title: `Cloud Infrastructure & Containerization`,
        focus: `Containerize and configure automated deployments for your services`,
        skills: [skills[2] || 'Docker', skills[3] || 'CI/CD Pipelines'].filter(Boolean),
        tasks: [
          {
            task: `Write multi-stage Dockerfiles for development and optimized production builds`,
            duration: '2 hours',
            resources: [
              {
                title: `Docker Multi-stage Builds Tutorial`,
                type: 'video',
                search_query: `Docker multi stage build tutorial production ready`
              }
            ]
          },
          {
            task: `Setup GitHub Actions workflow to run linting, unit tests, and build artifacts`,
            duration: '2.5 hours',
            resources: [
              {
                title: `GitHub Actions CI/CD Pipeline from scratch`,
                type: 'video',
                search_query: `GitHub Actions CI CD pipeline tutorial step by step`
              }
            ]
          }
        ],
        milestone: `Automated CI/CD pipeline building and verifying Docker containers on push`
      },
      {
        week: 4,
        title: `System Design & Recruiter Interview Readiness`,
        focus: `Scalability, caching, high-availability, and mock interview preparation`,
        skills: ['System Design', 'Redis Caching', 'Interview Walkthroughs'],
        tasks: [
          {
            task: `Design an end-to-end architecture diagram addressing rate limiting and caching`,
            duration: '3 hours',
            resources: [
              {
                title: `System Design Interview Framework`,
                type: 'video',
                search_query: `System design interview blueprint for software engineers`
              }
            ]
          },
          {
            task: `Conduct simulated technical interview explaining architecture trade-offs`,
            duration: '2 hours',
            resources: [
              {
                title: `${targetRole} Mock Technical Interview`,
                type: 'video',
                search_query: `${targetRole} mock interview full feedback`
              }
            ]
          }
        ],
        milestone: `Complete production capstone project deployed live with documentation and architecture diagrams`
      }
    ],
    daily_schedule: {
      hours_per_day: '2.5 hours/day',
      breakdown: '45 mins core concepts & architecture + 75 mins hands-on coding + 30 mins debugging & code review'
    },
    tips: [
      `Commit code daily to GitHub to demonstrate consistent growth to ${targetRole} recruiters`,
      `Focus on writing clean, self-documenting code with comprehensive unit test coverage`,
      `Document technical hurdles and your decision-making rationale in your project README`
    ]
  }
}
