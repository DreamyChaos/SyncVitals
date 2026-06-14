import { NextRequest, NextResponse } from "next/server";
import { DeepAnalysisAIService } from "@/lib/ai/DeepAnalysisAIService";
import { HealthContext, buildSystemPrompt } from "@/lib/ai/HealthContextBuilder";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userMessage, healthContext } = body;

    if (!userMessage || typeof userMessage !== "string") {
      return NextResponse.json(
        { success: false, error: "userMessage is required" },
        { status: 400 }
      );
    }

    console.log("\n[API/deep-analysis] Premium analysis request");
    console.log("[API/deep-analysis] User message:", userMessage.substring(0, 100));

    const systemPrompt = healthContext
      ? buildSystemPrompt(healthContext)
      : "You are SyncVitals AI, a premium health intelligence assistant.";

    const result = await DeepAnalysisAIService.generateResponse(systemPrompt, userMessage);

    console.log("[API/deep-analysis] Success:", result.success);
    console.log("[API/deep-analysis] Provider:", result.provider);
    console.log("[API/deep-analysis] Time:", result.responseTimeMs, "ms");

    if (result.success) {
      return NextResponse.json({
        success: true,
        response: result.response,
        provider: result.provider,
        responseTime: result.responseTimeMs,
      });
    }

    return NextResponse.json(
      { success: false, error: result.response },
      { status: 500 }
    );
  } catch (error) {
    console.error("[API/deep-analysis] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}