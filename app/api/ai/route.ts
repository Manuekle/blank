export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

type RequestBody = {
  mode?: "ask" | "agent";
  context?: string[];
  messages?: ChatMessage[];
  files?: { tsx?: string; css?: string };
  spec?: { name?: string; id?: string; contentProp?: string | null };
};

const MAX_MESSAGES = 24;

const markers = {
  generated: ["blank:generated:start", "blank:generated:end"],
  custom: ["blank:custom:start", "blank:custom:end"],
};

const sharedRules = (
  spec: RequestBody["spec"],
) => `Component: ${spec?.name ?? "Component"}

Rules for every reply:
- Reply with JSON only. No markdown fences, no prose outside the JSON.
- Never rename the root class, never add dependencies, never use inline styles.

The stylesheet is split in two managed regions and both must survive untouched:
- /* blank:generated:start */ … /* blank:generated:end */ is generated from the visual editor DNA. If the request is about a property the visual editor owns (spacing, radius, colors, typography, shadows, border, motion), update the declarations inside the generated block so Design stays in sync.
- /* blank:custom:start */ … /* blank:custom:end */ is free-form. Put anything the visual editor does not model here.
- Never move hand-written CSS out of the custom block.`;

function askPrompt(spec: RequestBody["spec"], tsx: string, css: string) {
  return `You are Blank's component assistant. You are in Ask mode: you answer questions and suggest ideas, but you never edit files.

${sharedRules(spec)}

Reply shape: {"summary": string}
- "summary" is your answer: at most three short sentences, specific to the component.
- Suggestions use the component's real class names and CSS variables when possible.

Current TSX:
\`\`\`tsx
${tsx}
\`\`\`

Current CSS:
\`\`\`css
${css}
\`\`\``;
}

function agentPrompt(spec: RequestBody["spec"], tsx: string, css: string, context: string[]) {
  const allows = (path: string) => context.includes(path);

  return `You are Blank's component assistant. You are in Agent mode: you edit ONE React + TypeScript component and its CSS.

${sharedRules(spec)}

Reply shape: {"summary": string, "tsx"?: string, "css"?: string}
- "summary" is one short sentence describing the change (max 12 words).
- Only include "tsx" or "css" when that file actually changes, and only for files in context.
- Files in context: ${context.join(", ")}.
${allows("tsx") ? "" : "- The TSX is not editable for this request: never return \"tsx\".\n"}${allows("css") ? "" : "- The CSS is not editable for this request: never return \"css\".\n"}- Keep TSX valid: React + TypeScript only, single default-importable named export, the stylesheet import must stay "./styles.css".
- Keep the component accessible: real elements, labels, focus states.

Current TSX:
\`\`\`tsx
${tsx}
\`\`\`

Current CSS:
\`\`\`css
${css}
\`\`\``;
}

export async function POST(request: Request) {
  const key = process.env.OPENAI_API_KEY;

  if (!key) {
    return Response.json(
      {
        error:
          "The AI assistant is not configured. Add OPENAI_API_KEY (and optionally OPENAI_MODEL / OPENAI_BASE_URL) to the environment to enable it.",
      },
      { status: 501 },
    );
  }

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const mode = body.mode === "ask" ? "ask" : "agent";
  const tsx = body.files?.tsx ?? "";
  const css = body.files?.css ?? "";
  const messages = (body.messages ?? []).slice(-MAX_MESSAGES);

  if (!tsx || !css) return Response.json({ error: "Missing component files." }, { status: 400 });

  const requested = Array.isArray(body.context) ? body.context : [];
  const context = requested.filter((path) => path === "tsx" || path === "css");
  const allows = { tsx: context.includes("tsx"), css: context.includes("css") };

  const base = (process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  try {
    const response = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        temperature: mode === "ask" ? 0.4 : 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              mode === "ask"
                ? askPrompt(body.spec, tsx, css)
                : agentPrompt(body.spec, tsx, css, allows.tsx && allows.css ? ["tsx", "css"] : context),
          },
          ...messages,
        ],
      }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const detail =
        payload && typeof payload.error?.message === "string"
          ? payload.error.message
          : `AI request failed (${response.status})`;
      return Response.json({ error: detail }, { status: 502 });
    }

    const content = payload?.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      return Response.json({ error: "The assistant returned nothing usable." }, { status: 502 });
    }

    let parsed: { summary?: unknown; tsx?: unknown; css?: unknown };
    try {
      parsed = JSON.parse(content);
    } catch {
      return Response.json({ error: "The assistant reply was not valid JSON. Try again." }, { status: 502 });
    }

    const summary = typeof parsed.summary === "string" ? parsed.summary : "Updated the component.";

    if (mode === "ask") {
      return Response.json({ mode, summary, applied: false, files: [] });
    }

    const nextTsx = allows.tsx && typeof parsed.tsx === "string" ? parsed.tsx : undefined;
    const nextCss = allows.css && typeof parsed.css === "string" ? parsed.css : undefined;

    if (!nextTsx && !nextCss) {
      return Response.json({ mode, summary, applied: false, files: [] }, { status: 200 });
    }

    // The visual editor depends on these markers, so refuse a reply that breaks them.
    if (nextCss) {
      for (const marker of Object.values(markers)) {
        if (!marker.every((name) => nextCss.includes(name))) {
          return Response.json(
            { error: "The assistant broke the managed CSS markers, so the change was discarded. Try a more specific request." },
            { status: 502 },
          );
        }
      }
    }

    const files = [nextTsx ? "tsx" : null, nextCss ? "css" : null].filter((value): value is "tsx" | "css" => value !== null);

    return Response.json({
      mode,
      summary,
      tsx: nextTsx,
      css: nextCss,
      files,
      applied: files.length > 0,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to reach the AI provider." },
      { status: 502 },
    );
  }
}
