import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Cache simple para evitar muchas llamadas en fetchHook repetidos
let cachedHook = null;
let lastHookTime = 0;

export const getHook = async (req, res) => {
    // Si hay un hook reciente (menos de 5 min), úsalo
    /*
    if (cachedHook && (Date.now() - lastHookTime < 1000 * 60 * 5)) {
        return res.json({ hook: cachedHook });
    }
    */

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Eres un generador de curiosidades ambientales. Genera UNA frase corta (máx 15 palabras), impactante o irónica sobre la huella de carbono, energía o residuos. Ejemplo: 'Tu ducha de 10 minutos gastó más agua que la que bebes en un mes'. Solo el texto, sin saludos ni comillas."
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 50,
        });

        const hook = completion.choices[0]?.message?.content?.trim() || "¿Sabías que tu huella digital también contamina?";

        cachedHook = hook;
        lastHookTime = Date.now();

        res.json({ hook });
    } catch (error) {
        console.error("Error generating hook:", error);
        res.json({ hook: "¿Sabías que un email tiene huella de carbono?" }); // Fallback
    }
};

export const chatMessage = async (req, res) => {
    const { message, history } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    try {
        // Preparar historial para contexto (limitar a últimos 6 mensajes para ahorrar tokens)
        const contextMessages = history ? history.slice(-6).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
        })) : [];

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Eres EcoBot, un asistente divertido, motivador y breve enfocado en reducir la huella de carbono. Tus respuestas son cortas (máx 100 palabras), y  útiles. Si te preguntan algo fuera del tema ambiental, responde amablemente que solo sabes de ecología."
                },
                ...contextMessages,
                {
                    role: "user",
                    content: message
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 150,
        });

        const responseText = completion.choices[0]?.message?.content || "Lo siento, me quedé sin energía solar para pensar. ¿Intentas de nuevo?";

        res.json({ reply: responseText });

    } catch (error) {
        console.error("Error in chat message:", error);
        res.status(500).json({
            error: "Failed to connect to EcoBot brain.",
            details: error.message
        });
    }
};
