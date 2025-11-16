#!/usr/bin/env node
const { Command } = require('commander');
const { process_command } = require('./command_processor');
const { askai } = require('./openai');
const program = new Command();


// Add a command
program
  .argument('<user_prompt>')
  .description('Ask the AI a question')
  .action((user_prompt) => {
    (async ()=>{
        try {
            const data = await askai(user_prompt);
            const json = JSON.parse(data);
            if(json.success){
                console.log("Executing command:", json.response);
                const commandResult = await process_command(json.response);
                if(commandResult.error){
                    console.error("Command execution error:", commandResult.error);
                    return;
                }
                console.log(commandResult.stdout);
            }
            else{
                console.error("AI could not provide a command:", json.remark);
            }
        } catch (error) {
            console.log(error.message);
        }
    })()
  });

// Parse the arguments
program.parse(process.argv);



