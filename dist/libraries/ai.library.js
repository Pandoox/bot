import axios from 'axios';
import { OpenAI } from 'openai';
import { showConsoleLibraryError } from '../utils/general.util.js';
import getBotTexts from '../utils/bot.texts.util.js';
export async function questionAI(text) {
    try {
        const apiKeysResponse = await axios.get('https://bit.ly/lbot-api-keys', { responseType: 'json' });
        const apiKeys = apiKeysResponse.data;
        let error;
        for await (let key of apiKeys.togetherai) {
            try {
                const openai = new OpenAI({
                    baseURL: "https://api.together.xyz/v1",
                    apiKey: key.secret_key,
                });
                const responseOpenAI = await openai.chat.completions.create({
                    messages: [{ role: 'user', content: text }],
                    model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
                    stream: false
                });
                return responseOpenAI.choices[0].message.content;
            }
            catch (err) {
                error = err;
            }
        }
        throw error;
    }
    catch (err) {
        showConsoleLibraryError(err, 'questionAI');
        throw new Error(getBotTexts().library_error);
    }
}
export async function imageAI(text) {
    try {
        const apiKeysResponse = await axios.get('https://bit.ly/lbot-api-keys', { responseType: 'json' });
        const apiKeys = apiKeysResponse.data;
        let error;
        for await (let key of apiKeys.togetherai) {
            try {
                const openai = new OpenAI({
                    baseURL: "https://api.together.xyz/v1",
                    apiKey: key.secret_key,
                });
                const responseOpenAI = await openai.images.generate({
                    model: 'stabilityai/stable-diffusion-xl-base-1.0',
                    size: '512x512',
                    prompt: text
                });
                return responseOpenAI.data[0].url;
            }
            catch (err) {
                error = err;
            }
        }
        throw error;
    }
    catch (err) {
        showConsoleLibraryError(err, 'imageAI');
        throw new Error(getBotTexts().library_error);
    }
}
