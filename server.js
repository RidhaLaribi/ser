import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Mistral } from "@mistralai/mistralai";

import "dotenv/config"; // ✅ Load .env using import

const apiKey = process.env.MISTRAL_API_KEY;  // ✅ Get API key

if (!apiKey) {
    console.error("❌ MISTRAL_API_KEY is missing in .env file!");
    process.exit(1);  // Stop execution if the key is missing
}

const client = new Mistral({ apiKey: apiKey });  // ✅ Use API key

console.log("✅ Mistral API is ready!");



const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post("/ask-ai", async (req, res) => {
    try {
        const { prompt } = req.body;
        console.log("Received prompt:", prompt);  // ✅ Debug log

        const result = await client.chat.stream({
            model: "mistral-small-latest",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful medical assistant. Only answer medical questions and do not provide general knowledge."
                },
                { role: "user", content: prompt }],
        });

        let fullResponse = "";
        for await (const chunk of result) {
            fullResponse += chunk.data.choices[0].delta.content;
        }

        console.log("AI Response:", fullResponse);  // ✅ Debug log
        res.json({ response: fullResponse });

    } catch (error) {
        console.error("Error:", error);  // ✅ Debug log
        res.status(500).json({ error: error.message });
    }
});


app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
