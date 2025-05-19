import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Mistral } from "@mistralai/mistralai";

import "dotenv/config"; // .env 

const apiKey = process.env.MISTRAL_API_KEY;

if (!apiKey) {
    console.error(" MISTRAL_API_KEY is missing in .env file!");
    process.exit(1);
}

const client = new Mistral({ apiKey: apiKey });

console.log(" API ready");



const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post("/ask-ai", async (req, res) => {
    try {
        const { prompt } = req.body;
        console.log("Received prompt:", prompt);

        const result = await client.chat.stream({
            model: "mistral-small-latest",
            messages: [
                {
                    role: "system",
                    content: `You are Jemy, a helpful medical assistant for an appointment booking platform 

Users of this platform can:
- Search for doctors by specialty or city or name 
- Click the "Take Appointment" button on a doctor's profile.
- Personalize their appointment (choose date, time, reason).
- Confirm the booking.
- Receive SMS and email reminders.

User profiles include:
- Their personal info.
- List of added patients (e.g., family).
- Past and upcoming appointments.
- Uploaded medical documents.

Only answer questions about using the platform. Keep answers clear and under 30 words.`
                },
                { role: "user", content: prompt }],
        });

        let fullResponse = "";
        for await (const chunk of result) {
            fullResponse += chunk.data.choices[0].delta.content;
        }

        console.log("AI Response:", fullResponse);
        res.json({ response: fullResponse });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
    }
});


app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
