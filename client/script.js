import bot from './assets/bot.svg'
import user from './assets/user.svg'

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')

let loadInterval

function loader(element) {
    element.textContent = ''

    loadInterval = setInterval(() => {
        // Update the text content of the loading indicator
        element.textContent += '.';

        // If the loading indicator has reached three dots, reset it
        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

function typeText(element, text) {
    let index = 0

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index)
            index++
        } else {
            clearInterval(interval)
        }
    }, 20)
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
    )
}

const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const userPrompt = data.get('prompt');

    console.log('User Prompt:', userPrompt); // Log user input

    // Display user's chatstripe
    chatContainer.innerHTML += chatStripe(false, userPrompt);

    // Clear the textarea input
    form.reset();

    // Generate unique ID and display bot's chatstripe
    const uniqueId = generateUniqueId();
    chatContainer.innerHTML += chatStripe(true, "", uniqueId);

    // Focus scroll to the bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Get the specific message div
    const messageDiv = document.getElementById(uniqueId);

    // Display loading animation
    loader(messageDiv);

    try {
        const response = await fetch(
            `https://api.openai.com/v1/completions`,
            {
                body: JSON.stringify({"model": "text-davinci-003", "prompt": userPrompt, "temperature": 0, "max_tokens": 3000}),
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    Authorization: "Bearer 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",
                },
            }
        );

        clearInterval(loadInterval);
        messageDiv.innerHTML = " ";

        // console.log('API Response:', responseData); // Log the API response

        if (response.ok) {
            const responseData = await response.json();
            console.log('API Response:', responseData); // Log the API response
    
            const botResponse = responseData.choices[0].text.trim();
            console.log('Bot Response:', botResponse); // Log the bot response
            typeText(messageDiv, botResponse);
        } else {
            const err = await response.text();
            messageDiv.innerHTML = "Something went wrong";
            console.error(err);
        }
    } catch (error) {
        console.error('Error:', error);
        messageDiv.innerHTML = "Something went wrong";
    }
};


form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e)
    }
})