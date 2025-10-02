import { NextResponse } from "next/server";

// Shared types
type Msg = { role: "user" | "assistant" | "system"; content: string };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ReqBody = { model: string; messages: Msg[]; options?: Record<string, any> };

// Anthropic Adapter
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function anthropicAdapter(messages: Msg[], model: string, options: Record<string, any> = {}) {
    const userContent = messages.filter((m) => m.role === "user").map((m) => m.content).join("\n");

    const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
            "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
            model,
            max_tokens: 500,
            messages: [{ role: "user", content: userContent }],
            ...options,
        }),
    });

    if (!res.ok) throw new Error(`Anthropic error: ${await res.text()}`);
    const data = await res.json();

    return { role: "assistant", content: data.content?.[0]?.text ?? "" };
}

// Mistral Adapter
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function mistralAdapter(messages: Msg[], model: string, options: Record<string, any> = {}) {
    const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({ model, messages, ...options }),
    });

    if (!res.ok) throw new Error(`Mistral error: ${await res.text()}`);
    const data = await res.json();

    return { role: "assistant", content: data.choices?.[0]?.message?.content ?? "" };
}

// Ollama Adapter (local)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ollamaAdapter(messages: Msg[], model: string, options: Record<string, any> = {}) {
    const userContent = messages.filter((m) => m.role === "user").map((m) => m.content).join("\n");

    const res = await fetch(`${process.env.OLLAMA_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, prompt: userContent, stream: false, ...options }),
    });

    if (!res.ok) throw new Error(`Ollama error: ${await res.text()}`);
    const data = await res.json();

    return { role: "assistant", content: data.response ?? "" };
}

// API Route
export async function POST(req: Request) {
    try {
        const { model, messages, options } = (await req.json()) as ReqBody;
        if (!model || !messages) {
            return NextResponse.json({ error: "model and messages required" }, { status: 400 });
        }

        const [provider, modelId] = model.includes(":") ? model.split(":") : ["anthropic", model];

        let out;
        if (provider === "anthropic") {
            out = await anthropicAdapter(messages, modelId, options);
        } else if (provider === "mistral") {
            out = await mistralAdapter(messages, modelId, options);
        } else if (provider === "ollama") {
            out = await ollamaAdapter(messages, modelId, options);
        } else {
            throw new Error(`Unknown provider prefix: ${provider}`);
        }

        return NextResponse.json({ messages: [out] });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any 
    catch (err: any) {
        console.error("chat adapter error:", err);
        return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
    }
}
