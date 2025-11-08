const { spawn } = require('child_process');


/**
 * Run a shell command using /bin/bash and stream output to the parent process.
 *
 * @param {string} command - The command string to run in a Linux shell
 * @returns {Promise<{ code: number, error: null | { message: string, killed: boolean } }>} 
 */
function process_command(command) {
  return new Promise((resolve, reject) => {
    if (typeof command !== 'string' || command.trim() === '') {
      return reject(new TypeError('command must be a non-empty string'));
    }

    // Spawn a shell and stream output
    const child = spawn(command, {
      shell: '/bin/bash',
      stdio: 'inherit'
    });

    let finished = false;
    let errorObj = null;

    child.on('error', (err) => {
      errorObj = { message: err.message, killed: !!child.killed };
    });

    child.on('close', (code, signal) => {
      if (finished) return;
      finished = true;
      resolve({
        code: typeof code === 'number' ? code : (signal ? 1 : 0),
        error: errorObj
      });
    });

    // If the parent is killed, ensure child is killed as well
    process.once('exit', () => {
      try { child.kill(); } catch (e) { /* ignore */ }
    });
  });
}

module.exports = { process_command };
