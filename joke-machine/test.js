#!/usr/bin/env node

// test.js
import fetch from "node-fetch";

// Get args: provider, prompt
const [, , provider = "anthropic", ...promptParts] = process.argv;
const prompt = promptParts.join(" ") || "Tell me a joke";

async function run() {
    let url, body, headers;

    if (provider.startsWith("anthropic")) {
        url = "https://api.anthropic.com/v1/messages";
        headers = {
            "Content-Type": "application/json",
            "x-api-key": process.env.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
        };
        body = {
            model: "claude-3-5-sonnet-20240620",
            max_tokens: 200,
            messages: [{ role: "user", content: prompt }],
        };
    } else if (provider.startsWith("mistral")) {
        url = "https://api.mistral.ai/v1/chat/completions";
        headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.MISTRAL_API_KEY}`,
        };
        body = {
            model: "mistral-medium-latest",
            messages: [{ role: "user", content: prompt }],
        };
    } else if (provider.startsWith("ollama")) {
        url = process.env.OLLAMA_URL || "http://localhost:11434/api/generate";
        headers = { "Content-Type": "application/json" };
        body = {
            model: "llama2",
            prompt,
            stream: false,
        };
    } else if (provider.startsWith("local")) {
        // Calls your own Next.js unified adapter
        url = "http://localhost:3000/api/chat";
        headers = { "Content-Type": "application/json" };
        body = {
            model: "anthropic:claude-3-5-sonnet-20240620",
            messages: [{ role: "user", content: prompt }],
        };
    } else {
        console.error("Unknown provider. Use anthropic | mistral | ollama | local");
        process.exit(1);
    }

    try {
        const res = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
        });
        const data = await res.json();
        console.log("✅ Response:\n", JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("❌ Error:", err.message);
    }
}

run();
