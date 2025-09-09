const input = document.querySelector('#input');
const chatContainer = document.querySelector('#chat-container')

const ask = document.querySelector('#ask')

const threadId = Date.now().toString(36) + Math.random().toString(36).substring(2,8)



input?.addEventListener('keyup',handleEnter)
ask?.addEventListener('click', handleAsk);
const loading  = document.createElement('div');
loading.className = 'my-6 animate-pulse'
loading.textContent = 'Thinking...'



async function generate(text){

    const msg = document.createElement('div')
    msg.className = `my-6 bg-neutral-800 p-3 rounded-xl ml-auto max-w-fit`
    msg.textContent = text

    chatContainer?.appendChild(msg)
    input.value=''

    //call server   

    chatContainer.appendChild(loading)

    const assistantMessage = await callServer(text) 
     const assistantmsg = document.createElement('div')
    assistantmsg.className = `max-w-fit` 
    assistantmsg.textContent = assistantMessage

    loading.remove();

    chatContainer?.appendChild(assistantmsg)
 


    // console.log(assistantMessage);
    
}

async function callServer(inputText)
{
    const response = await fetch(' http://localhost:3001/chat',{
        method : "POST",
        headers : {
            'content-type' : 'application/json'
        },
        body : JSON.stringify({threadId:threadId,message : inputText})
    })

    if(!response.ok){
        throw new Error("Error generating response")
    }

    const result = await response.json();

    return result.message;
}

async function handleAsk(e)
{
    const text = input?.value.trim();

    if(!text)
        return;

    await generate(text);
}

async function handleEnter(e)
{
    if(e.key === 'Enter')
    {
        const text = input?.value.trim();

        if(!text)
            return;


        await generate(text);
    }
}