import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ResumeScoreResult {
  score: number; // 0-100
  reasoning: string;
}

export async function calculateResumeScore(
  resumeUrl: string,
  jobDescription: string,
  jobTitle: string,
  employmentType: string,
  location: string,
  benefits: string[]
): Promise<ResumeScoreResult> {
  try {
    // Create a detailed prompt for the AI to analyze the resume
    const prompt = `You are an expert HR recruiter and ATS (Applicant Tracking System) analyzer. Your task is to analyze a candidate's resume and compare it with a job posting to provide a match score.

Job Details:
- Title: ${jobTitle}
- Employment Type: ${employmentType}
- Location: ${location}
- Benefits: ${benefits.join(", ")}
- Description: ${jobDescription}

Resume URL: ${resumeUrl}

Note: The resume is stored as a URL. You should analyze it based on typical resume content patterns.

Provide a detailed analysis and assign a match score from 0-100 based on:
1. Skills alignment with job requirements (40%)
2. Experience level and relevance (30%)
3. Education requirements match (15%)
4. Location compatibility (5%)
5. Overall profile fit (10%)

Consider:
- Keywords from the job description present in the resume
- Years of experience required vs provided
- Technical skills match
- Soft skills alignment
- Education level compatibility
- Industry experience

Return your response in the following JSON format:
{
  "score": <number between 0-100>,
  "reasoning": "<brief explanation of the score in 2-3 sentences>"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using gpt-4o-mini for cost efficiency
      messages: [
        {
          role: "system",
          content:
            "You are an expert HR recruiter with deep knowledge of ATS systems and candidate evaluation. Provide accurate, unbiased assessments.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent scoring
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(
      response.choices[0].message.content || '{"score": 50, "reasoning": "Unable to analyze"}'
    );

    // Ensure score is within valid range
    const score = Math.max(0, Math.min(100, result.score));

    return {
      score,
      reasoning: result.reasoning || "Score calculated based on overall match",
    };
  } catch (error) {
    console.error("Error calculating resume score:", error);
    
    // Return a default score if AI analysis fails
    // This ensures the application flow continues even if AI fails
    return {
      score: 50,
      reasoning: "Unable to complete AI analysis. Default score assigned.",
    };
  }
}

/**
 * Calculate a basic fallback score without AI
 * Used as a backup if OpenAI API is unavailable
 */
export function calculateBasicScore(
  jobDescription: string,
  jobTitle: string
): number {
  // Simple keyword-based scoring as fallback
  // This is a basic implementation, actual score will come from AI
  const commonSkills = [
    "javascript",
    "typescript",
    "react",
    "node",
    "python",
    "java",
    "sql",
    "aws",
    "docker",
    "kubernetes",
  ];

  const descriptionLower = jobDescription.toLowerCase();
  let score = 40; // Base score

  // Add points for each common skill found
  commonSkills.forEach((skill) => {
    if (descriptionLower.includes(skill)) {
      score += 5;
    }
  });

  return Math.min(score, 100);
}
