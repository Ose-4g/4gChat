#!/usr/bin/env node
const { Command } = require('commander');
const { process_command } = require('./command_processor');
const { askai } = require('./openai');

const program = new Command();


// CLI: Accept a single user prompt, ask the AI to produce a shell command
// in a predefined JSON format, and run it if the AI indicated success.
program
    .argument('<user_prompt>')
    .description('Ask the AI to generate a shell command and run it')
    .action(async (user_prompt) => {
        try {
            const data = await askai(user_prompt);

            // The AI returns a JSON string with { success, response, remark }
            const json = JSON.parse(data);

            if (json.success) {
                console.log('Executing command:', json.response);
                const commandResult = await process_command(json.response);

                if (commandResult.error) {
                    console.error('Command execution error:', commandResult.error);
                    process.exitCode = 2;
                    return;
                }

                process.stdout.write(commandResult.stdout || '');
                return;
            }

            console.error('AI could not provide a command:', json.remark);
            process.exitCode = 1;
        } catch (error) {
            // Print a short error message; stack traces are not shown so this
            // tool remains friendly to end-users.
            console.error(error.message || String(error));
            process.exitCode = 1;
        }
    });


// Parse the CLI arguments and run the action.
program.parse(process.argv);



