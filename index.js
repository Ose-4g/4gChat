#!/usr/bin/env node
const { Command } = require('commander');
const { process_command } = require('./command_processor');
const { askai } = require('./openai');
const program = new Command();


// Add a command
// program
//   .argument('<user_prompt>')
//   .description('Ask the AI a question')
//   .option('-v, --verbose', 'Show the command to be processed')
//   .action((user_prompt, options) => {
//     // process the user prompt
//     if (options.verbose) {
//       message = message.toUpperCase();
//     }
//   });

// // Parse the arguments
// program.parse(process.argv);



// process_command('top')
//   .then(result => {
//     // result.code is the exit code, result.error is error info (if any)
//     console.log('Process finished with code:', result.code);
//     if (result.error) {
//       console.error('Error:', result.error);
//     }
//   })
//   .catch(err => {
//     console.error('Failed to run command:', err);
//   });

(async ()=>{
    await askai("I want to list all files in the current directory");
})()