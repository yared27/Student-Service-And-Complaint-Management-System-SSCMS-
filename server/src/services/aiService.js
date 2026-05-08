const DEFAULT_AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

function getAiServiceUrl() {
  return String(DEFAULT_AI_SERVICE_URL || "").replace(/\/$/, "");
}

export async function predictRequestAdvisory(text) {
  const cleanText = String(text || "").trim();
  if (!cleanText) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch(`${getAiServiceUrl()}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: cleanText }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const fallbackText = await response.text().catch(() => "");
      throw new Error(`AI service error (${response.status}): ${fallbackText || "unexpected response"}`);
    }

    const payload = await response.json();

    // AI returns only priority and duplicate_score.
    const rawPriority = String(payload?.priority || "").toUpperCase() || null;
    const duplicateScore = Number(payload?.duplicate_score || 0);

    return {
      priority: rawPriority,
      duplicateScore,
      isDuplicate: duplicateScore > 0.7,
    };
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("AI service request timed out.");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
