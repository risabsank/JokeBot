# JokeBot

JokeBot is a command-line and API-driven chatbot framework designed to interface with multiple large language model providers, including Anthropic, Mistral, and Ollama. It provides a unified adapter layer for sending user prompts to different model APIs and receiving structured responses.  

This project is implemented in TypeScript with Next.js for the backend API route, and Node.js for command-line testing. It demonstrates how to standardize request formatting across heterogeneous providers while maintaining flexibility for different runtime environments.

---

## Features

- Unified adapter for multiple providers:
  - **Anthropic** (Claude models)
  - **Mistral** (chat completions)
  - **Ollama** (local inference with Llama and other models)
  - **Local adapter** (routes requests through the Next.js API)
- Command-line test client for direct provider calls
- Backend API route for standardized message handling
- Error handling with provider-specific reporting
- Support for configurable model selection and runtime options

---

## Project Structure

- **`app/api/chat/route.ts`**  
  Next.js API route that receives requests, validates parameters, and routes them to the appropriate provider adapter.

- **`adapters` (within route file)**  
  Contains provider-specific functions:
  - `anthropicAdapter`  
    Sends requests to the Anthropic Messages API.  
  - `mistralAdapter`  
    Calls Mistral’s Chat Completions API.  
  - `ollamaAdapter`  
    Interfaces with a local Ollama instance for text generation.  

- **`test.js`**  
  Node.js script for testing. It allows sending prompts directly from the command line to a specified provider or through the local adapter.

---

## Installation

Clone the repository and install dependencies:

```
git clone https://github.com/risabsank/JokeBot.git
cd JokeBot
npm install
```
---

## Environment Variables

Set the following environment variables depending on which providers you intend to use:

```
ANTHROPIC_API_KEY – API key for Anthropic

MISTRAL_API_KEY – API key for Mistral

OLLAMA_URL – Base URL for Ollama (default: http://localhost:11434)
```

These must be defined in your shell environment or .env.local when running under Next.js.

---

## Usage

# Running the API
Start the Next.js development server:

```
npm run dev
```

This exposes the unified API endpoint at:

```
POST http://localhost:3000/api/chat
```

Request body format:

```
{
  "model": "anthropic:claude-3-5-sonnet-20240620",
  "messages": [{ "role": "user", "content": "Tell me a joke" }]
}
```

Response format:

```
{
  "messages": [
    { "role": "assistant", "content": "Here is a joke response." }
  ]
}
```

# Running the Test Client
The test.js script allows you to query providers directly.

Examples:

```
# Call Anthropic
./test.js anthropic "Tell me a programming joke"

# Call Mistral
./test.js mistral "Write a short story about a robot"

# Call Ollama
./test.js ollama "Explain quantum physics simply"

# Call through local unified adapter
./test.js local "Generate a haiku about the ocean"
```

# Error Handling
The adapters include explicit error handling. If a provider returns an error, the unified API will respond with an error object and HTTP status 500. The test client prints descriptive error messages to the console.

Copy code

Would you like me to also add a **diagram section** (using Mermaid syntax) that shows the request fl
