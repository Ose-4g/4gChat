const util = require('util');
const { exec } = require('child_process');
const execAsync = util.promisify(exec);


/**
 * Execute a shell command and return structured output.
 *
 * Executes the provided shell command via child_process.exec (promisified). The
 * returned object contains either stdout or an error (stderr or exec error).
 *
 * @param {string} command - Non-empty shell command to execute.
 * @returns {Promise<{ error: string|null, stdout: string|null }>}
 * @throws {TypeError} If command is not a non-empty string.
 */
async function process_command(command) {
  if (typeof command !== 'string' || command.trim() === '') {
    throw new TypeError('command must be a non-empty string');
  }

  try {
    // Increase maxBuffer for commands producing more output if needed.
    const { stdout, stderr } = await execAsync(command, { maxBuffer: 10 * 1024 * 1024, shell: '/bin/bash' });

    const data = { error: null, stdout: null };
    if (stderr) data.error = stderr;
    if (stdout) data.stdout = stdout;
    return data;
  } catch (err) {
    // err may include stdout/stderr properties depending on the failure.
    return {
      error: err.stderr ?? err.message ?? String(err),
      stdout: err.stdout ?? null
    };
  }
}

module.exports = { process_command };
