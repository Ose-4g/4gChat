require('dotenv').config({quiet: true});
const {OpenAI} = require('openai');


/**
 * Send a prompt to the OpenAI Responses API and return the raw response text.
 *
 * Validates input and the presence of OPENAI_API_KEY, then calls the Responses
 * API with a system instruction that asks the model to produce shell commands
 * in a specific JSON format.
 *
 * @param {string} prompt - Non-empty user prompt describing the desired shell command.
 * @returns {Promise<string>} The raw text returned by the OpenAI Responses API (response.output_text).
 * @throws {TypeError} If prompt is not a non-empty string.
 * @throws {Error} If OPENAI_API_KEY is not set or an API error/unexpected error occurs.
 */
async function askai(prompt) {
  if (typeof prompt !== 'string' || prompt.trim() === '') {
    throw new TypeError('prompt must be a non-empty string');
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  const model = 'gpt-5';
  const systemMessage = `
you are an ai that generates shell commands for a user based on the user's request.
The user is using a linux machine.
You will always send back a json in this format
{
  "success": boolean
  "response": string
  "remark": string
}

if you are able to get a shell command successfully for the user, "success" will be true
"response" is the shell command we want the user to run
"remark" will be empty if "success" is true. If "success" is false, then "remark" will be the explanation why it couldnt be done.
`;

  try {
    const openai = new OpenAI({ apiKey });
    const response = await openai.responses.create({
      model,
      instructions: systemMessage,
      input: prompt,
      reasoning: {
        effort: 'minimal'
      }
    });

    return response.output_text;
  } catch (error) {
    // Prefer a simple message regardless of OpenAI SDK error types
    if (error && error.message) {
      throw new Error(`OpenAI API Error: ${error.message}`);
    }

    throw new Error('Unexpected Error');
  }
}

module.exports = { askai };
