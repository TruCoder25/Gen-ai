
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import Groq from "groq-sdk";
import {tavily} from '@tavily/core';



const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {

  const rl = readline.createInterface({ input, output });
  const messages = [
        { 
            role:'system',
            content: //`You are Pratibha, a smart review grader,Your task is to analyse given review and return the sentiment.classify the review as positive,neutral or negative.You must return the result in valid JSON structure
            // example:{"sentiment":"Negative"}`
            `you are a smart personal assistant who answers the asked questions 
            You have access to following tools:
            1.searchWeb({query}:{query:String}) // Search the latest information and realtime data on the internet

            `
        },

        // {
        //   role: "user",
        // //   content: "Who are you",
        // content: //`classify the review as positive or negative. Review: These headphones arrived quickly,but not working properly 
        // // Sentiment:`,
        // `Hai`,
        // },
  ]
 
  while(true)
  {
    const questions = await rl.question('You:')

    if(questions=='bye')
        break;

    messages.push({
        role:'user',
        content:questions,
    })
      while(true){
      const completion = await groq.chat.completions
      .create({ 
          temperature:0,
          // top_p:'',
          // stop:'ga',
          // max_completion_tokens:'',
          // frequency_penalty:'',
          // presence_penalty:'',
          // response_format:{'type':'json_object'},
        messages : messages,

        tools:[
                {

              type: "function",

              function: {

                  name: "webSearch",

                  description: "Search the latest information and realtime data on the internet",

                  parameters: {

                      type: "object",

                      properties: {

                          query: {

                              type: "string",

                              description: "The Search query to perfom search on",

                          }

                      },

                      required: ["query"],

                  },

              },

          }
        ],
        tool_choice:'auto',
        model: "llama-3.3-70b-versatile",
      })  

      // console.log(JSON.stringify(completion.choices[0].message,null,2))
      messages.push(completion.choices[0].message)
      const toolCalls = completion.choices[0].message.tool_calls

      if(!toolCalls)
      {
        console.log(`Assistant:${completion.choices[0].message.content}`)
        break;
      }

      for(const tool of toolCalls)
      {
        //  console.log('tool: ',tool);
        const functionName = tool.function.name;
        const functionParams = tool.function.arguments;
        
        if(functionName=='webSearch'){
          const toolResult = await  webSearch(JSON.parse(functionParams))

          // console.log("tool res :",toolResult);

          messages.push({
            tool_call_id : tool.id,
            role : 'tool',
            name:functionName,
            content:JSON.stringify(toolResult),
          })
          
        }

      }
    
      
      }
  }
  
  rl.close()
    
}

main();

async function webSearch({query}){

  console.log("Calling");
  
     
    const response = await tvly.search(query);

    // console.log("res",response);

    const finalResult = response.results.map(result=>result.content).join('\n\n')

    // console.log(finalResult);
    

     return finalResult;
}
