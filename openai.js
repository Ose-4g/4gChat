const https = require('https');
require('dotenv').config();

/**
 * askai(prompt)
 *
 * Sends the user's prompt to the OpenAI Chat Completions API and returns
 * the assistant's reply as a string.
 *
 * Requires environment variable OPENAI_API_KEY to be set.
 *
 * @param {string} prompt - User prompt to send as the user message
 * @param {{ model?: string, temperature?: number, max_tokens?: number, systemMessage?: string }} [opts]
 * @returns {Promise<string>} assistant reply content
 */
async function askai(prompt, opts = {}) {
  if (typeof prompt !== 'string' || prompt.trim() === '') {
    throw new TypeError('prompt must be a non-empty string');
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  const model = opts.model || 'gpt-5';
  const systemMessage = opts.systemMessage || `
  you are an ai that generates shell commands for a user based on the user's request. 
  Only send back the shell command as a single line without any additional explanation.
  If it is not possible to generate a command or you need more context, respond with a sentence starting with ERROR and then add your explanation.
  `;
  const temperature = typeof opts.temperature === 'number' ? opts.temperature : 0;
  const max_tokens = typeof opts.max_tokens === 'number' ? opts.max_tokens : 300;

  const body = JSON.stringify({
    model,
    instructions: systemMessage,
    input: prompt,
  });

  const res = await new Promise((resolve, reject) => {
    const req = https.request('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Authorization': `Bearer ${apiKey}`
      }
    }, (resp) => {
      let data = '';
      resp.on('data', chunk => data += chunk);
      resp.on('end', () => {
        if (resp.statusCode && resp.statusCode >= 200 && resp.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(new Error('Failed to parse OpenAI response: ' + err.message));
          }
        } else {
          reject(new Error(`OpenAI API error ${resp.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });

  console.log(JSON.parse(JSON.stringify(res.output[1].content)))

  if (!res || !res.output || !res.output[0] || !res.output[0].content) {
    throw new Error('No assistant message in OpenAI response');
  }

  return res.output[0].content[0].text;
}

module.exports = { askai };
