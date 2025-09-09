

import Groq from "groq-sdk";
import {tavily} from '@tavily/core';
import NodeCache from "node-cache";

const cache = new NodeCache({stdTTL: 60*60*24});


const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generate(userMessage,threadId) {

 
  const baseMessages = [
        { 
            role:'system',
            content:
            `you are a smart personal assistant who answers the asked questions 
            You have access to following tools:
            1.searchWeb({query}:{query:String}) // Search the latest information and realtime data on the internet

            `
        },

  ]
 
  const messages = cache.get(threadId)
?? baseMessages;

    messages.push({
        role:'user',
        content:userMessage,
    })

    const MAX_RETRIES = 10;
    let count = 0;

      while(true){
        if(count>MAX_RETRIES)
        {
            return "I could not find the result, please try again";
        }
        count++;
      const completion = await groq.chat.completions
      .create({ 
          temperature:0,
          
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

      messages.push(completion.choices[0].message)
      const toolCalls = completion.choices[0].message.tool_calls

      if(!toolCalls)
      {
        cache.set(threadId,messages)
        console.log(cache);
        
        return completion.choices[0].message.content;
        
      }

      for(const tool of toolCalls)
      {
       
        const functionName = tool.function.name;
        const functionParams = tool.function.arguments;
        
        if(functionName=='webSearch'){
          const toolResult = await  webSearch(JSON.parse(functionParams))

          messages.push({
            tool_call_id : tool.id,
            role : 'tool',
            name:functionName,
            content:toolResult,
          })
          
        }

      }
    
      
      }
  }
    

async function webSearch({query}){

  console.log("Calling");
  
     
    const response = await tvly.search(query);


    const finalResult = response.results.map(result=>result.content).join('\n\n')

     return finalResult;
}
