const fs = require('fs');
const path = require('path');
const os = require('os');
const { OpenAI } = require('openai');


/**
 * Retrieve the OpenAI API key from a JSON config file located at
 * ~/.4gchatConfig.json or fall back to the environment.
 *
 * Expected file format:
 * {
 *   "OPENAI_API_KEY": "your-key-here"
 *   "OS": "linux"
 * }
 *
 * This function will silently ignore parse errors and return null if the
 * file or value is not available. Prefer this over throwing during start-up
 * so callers can decide how to handle a missing key.
 *
 * @returns {string|null} The API key or null when not found.
 */
const getConfig = () => {
  try {
    const home = os.homedir();
    const cfgPath = path.join(home, '.4gchatConfig.json');

    if (!fs.existsSync(cfgPath)) return null;

    const raw = fs.readFileSync(cfgPath, { encoding: 'utf8' });
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    // if (parsed && typeof parsed.OPENAI_API_KEY === 'string' && parsed.OPENAI_API_KEY.trim() !== '') {
    //   return parsed.OPENAI_API_KEY.trim();
    // }

    return parsed;
  } catch (err) {
    // Ignore errors (file may be missing or malformed); return null so
    // callers can fallback to environment variables if desired.
    return {};
  }
};

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
  const config = getConfig();
  if (!config || typeof config.OPENAI_API_KEY !== 'string' || config.OPENAI_API_KEY.trim() === '') {
    throw new Error('OPENAI_API_KEY is not set in ~/.4gchatConfig.json or the environment');
  }

  const apiKey = config.OPENAI_API_KEY;

  const os = config && typeof config.OS == 'string' && config.OS.trim()!==''  ? config.OS.toLowerCase() : 'linux';

  const model = 'gpt-5';
  const systemMessage = `
you are an ai that generates shell commands for a user based on the user's request.
The user's OS is ${os}.
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
