const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = 'gemini-2.5-flash';
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

/**
 * Core helper to make direct fetch calls to the Gemini API
 * @param {Object} payload Payload to send to Gemini API
 * @returns {Promise<string>} Plain text response from the API
 */
async function fetchGemini(payload) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured. Please make sure VITE_GEMINI_API_KEY is set in your .env file.');
  }

  try {
    const response = await fetch(`${BASE_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errMsg);
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResponse) {
      throw new Error('Received an empty response from the AI model.');
    }

    return textResponse;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}

/**
 * Core AI Study Tutor Persona Instructions
 */
const SYSTEM_INSTRUCTION = {
  parts: [
    {
      text: `You are EduVerse AI, a friendly, encouraging, and highly knowledgeable AI study companion.
Your goal is to help students master concepts, solve doubts, and enjoy the learning journey.
Always explain things in a clear, friendly, and pedagogical tone.
Use analogies and simplify complex ideas. Avoid dry academic explanations.
If the student asks you a programming question, explain the logic simply, comment the code cleanly, and structure the code blocks using markdown.
If the student's query is completely unrelated to education, science, mathematics, literature, coding, or academic career advice, politely redirect them back to the learning path.`
    }
  ]
};

/**
 * Doubt Solver: General academic chat with memory
 * @param {string} prompt The new student prompt
 * @param {Array} chatHistory Array of past messages formatted for Gemini: [{ role: 'user'|'model', parts: [{ text: '...' }] }]
 */
export async function askChat(prompt, chatHistory = []) {
  // Format past history for API
  // Ensure roles are 'user' and 'model' (Gemini expects 'model' instead of 'assistant')
  const formattedHistory = chatHistory.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : msg.role,
    parts: [{ text: msg.content }]
  }));

  const payload = {
    contents: [
      ...formattedHistory,
      { role: 'user', parts: [{ text: prompt }] }
    ],
    systemInstruction: SYSTEM_INSTRUCTION,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    }
  };

  return await fetchGemini(payload);
}

/**
 * Topic Explainer: Custom breakdowns by educational levels
 * @param {string} topic The concept to explain
 * @param {string} level Beginner, Intermediate, or Advanced
 */
export async function explainTopic(topic, level = 'Beginner') {
  const customPrompt = `Explain the topic: "${topic}" to a student who needs an explanation at an "${level}" level.
Include:
1. A relatable real-world analogy.
2. A simple, step-by-step conceptual breakdown.
3. A clear, practical example (with code if it is a tech/programming topic).
4. A short "Quick Recap" summary at the end.

Keep it highly engaging, structured, and visually organized with clear markdown headings, bold points, and bulleted lists.`;

  const payload = {
    contents: [
      { role: 'user', parts: [{ text: customPrompt }] }
    ],
    systemInstruction: SYSTEM_INSTRUCTION,
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 2048,
    }
  };

  return await fetchGemini(payload);
}

/**
 * Summarizer: Extract 5-8 core bullet points from notes or files
 * @param {string} text Long educational text or code snippet to summarize
 */
export async function summarizeText(text) {
  const customPrompt = `You are a professional notes editor. Summarize the following educational content, lecture notes, or code.
Provide:
1. A single-sentence summary of the overall topic.
2. A bulleted list of 5 to 8 key takeaways that capture all critical points, formulas, or concepts.
3. A "Developer/Learner Note" box containing a practical tip on how to remember or apply this material.

Content to summarize:
---
${text}
---`;

  const payload = {
    contents: [
      { role: 'user', parts: [{ text: customPrompt }] }
    ],
    systemInstruction: SYSTEM_INSTRUCTION,
    generationConfig: {
      temperature: 0.5,
      maxOutputTokens: 1500,
    }
  };

  return await fetchGemini(payload);
}

/**
 * Custom Quiz Generator: Builds a valid JSON array of playable questions
 * @param {string} topic Topic for the quiz
 * @param {number} questionsCount Number of questions
 * @param {string} difficulty Easy, Medium, Hard
 * @returns {Promise<Array>} Parsed JSON array of quiz questions
 */
export async function generateQuiz(topic, questionsCount = 5, difficulty = 'Medium') {
  const jsonPrompt = `Generate a multiple choice quiz about the topic: "${topic}" designed for a "${difficulty}" level.
The quiz must contain exactly ${questionsCount} questions.
You must return a JSON array where each object has this exact structure:
[
  {
    "q": "Question text here?",
    "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
    "correct": 0,
    "explanation": "Detailed explanation of why this option is correct, written in an encouraging, educational tone."
  }
]
Important rules:
1. "correct" MUST be a 0-indexed integer corresponding to the index of the correct answer in the "options" array.
2. Provide exactly 4 options for every question.
3. Return ONLY a valid JSON array. Do not include markdown code block syntax (like \`\`\`json), do not include any preamble, introduction, or postscript. Just the plain JSON array.`;

  const payload = {
    contents: [
      { role: 'user', parts: [{ text: jsonPrompt }] }
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.7,
      maxOutputTokens: 2048,
    }
  };

  const jsonResponseText = await fetchGemini(payload);
  
  try {
    const parsedQuiz = JSON.parse(jsonResponseText.trim());
    if (!Array.isArray(parsedQuiz)) {
      throw new Error('AI response is not a valid list of questions.');
    }
    // Standardize question objects to support both "q" and "question" properties
    const standardizedQuiz = parsedQuiz.map(item => ({
      ...item,
      q: item.q || item.question || '',
      question: item.question || item.q || ''
    }));
    return standardizedQuiz;
  } catch (error) {
    console.error('Failed to parse quiz JSON from Gemini:', jsonResponseText);
    throw new Error('The AI generated a quiz, but the format was slightly invalid. Please try generating it again!');
  }
}
