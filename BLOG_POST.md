# Building FlowState: An Autonomous Execution Agent with Gemini 1.5 Pro and Google Cloud

## Introduction: The Dream of Autonomous Execution

We’ve all been there: staring at a repetitive web workflow that feels like it should be automated, but traditional "No-Code" tools are too rigid and scripts are too brittle. 

**FlowState** was born from a simple question: *What if an AI could just "see" the screen and act like a human?*

This post dives into the architecture of FlowState and how we leveraged the Google AI ecosystem—specifically Gemini 1.5 Pro and Vertex AI—to turn natural language into reliable, autonomous execution.

> [!NOTE]
> This piece of content was created specifically for the purposes of entering the **Gemini Live Agent Challenge**. #GeminiLiveAgentChallenge

---

## Why Gemini 1.5 Pro? The Multimodal Advantage

Building an agent that interacts with the web requires two things: deep reasoning and visual understanding. 

Most models treat "web automation" as a text-only problem—parsing HTML tags and hoping the DOM doesn't change. We took a different approach. FlowState uses **Gemini 1.5 Pro** because of its native multimodality. Instead of just reading code, our agent "looks" at screenshots to understand spatial relationships (e.g., "The 'Login' button is next to the 'Forgot Password' link").

Gemini’s massive 2M token context window also allows us to feed it historical session data, ensuring the agent learns from past mistakes and optimizes its path over time.

---

## The Cloud-Native Architecture

To support a real-time, visual agent, we needed an infrastructure that could handle high-throughput WebSocket streams and heavy browser compute.

### 1. The Brain: Vertex AI & Google AI SDK
The core logic resides in our `perception.ts` and `planner.ts` modules. We use the `@google-cloud/vertexai` SDK to interface directly with Gemini. This gives us enterprise-grade reliability and low-latency inference.

### 2. The Memory: Google Cloud Firestore
Every intent, every screenshot, and every action is persisted in **Firestore**. Its real-time capabilities allow our frontend to stay perfectly synced with the agent's "thought process" as it executes.

### 3. The Vision: Playwright on Cloud Run
Running headful browsers is resource-intensive. We architected a specialized **Playwright Service** deployed on **Google Cloud Run**. By using Cloud Run's concurrency and high-memory configurations (4GiB+), we can scale out instances of "virtual eyes" instantly whenever a user starts a new session.

---

## The Execution Loop: Perception, Planning, Action

FlowState operates on a strict three-stage loop:

1.  **Perception**: Capture a screenshot and DOM state. Send both to Gemini to identify "where we are."
2.  **Planning**: Based on the user's goal and the current state, Gemini generates a precise JSON sequence of actions (click, type, navigate).
3.  **Verification**: After every action, the agent "looks" again to verify the UI changed as expected. If a popup appeared or an error occurred, the agent self-corrects.

---

## Automating the Future

By combining Google Cloud's robust compute with the reasoning power of Gemini 1.5 Pro, we've built more than just a scraper—we've built a partner. FlowState doesn't just automate tasks; it understands intent.

We are incredibly excited to see where this journey takes us. If you're building in the AI space, there has never been a better time to leverage the Google Cloud stack.

Check out the code and the live demo here: [https://github.com/Muhammad-Tayyab-Bhutto/flowstate](https://github.com/Muhammad-Tayyab-Bhutto/flowstate)

---

### Tech Stack Summary:
- **Language Models**: Gemini 1.5 Pro (Vertex AI)
- **Backend**: Fastify (Node.js) on Cloud Run
- **Database**: Firestore
- **Frontend**: Next.js & Tailwind (Vercel)
- **Automation**: Playwright
