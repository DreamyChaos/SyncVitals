import { NextRequest, NextResponse } from "next/server";
import { ChatAIProrityService } from "@/lib/ai/ChatAIProviderService";
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

    console.log("\n[API/quick-chat] Quick response request");

    const systemPrompt = healthContext
      ? buildSystemPrompt(healthContext)
      : "You are SyncVitals AI, a health assistant.";

    const result = await ChatAIProrityService.generateResponse(systemPrompt, userMessage);

    console.log("[API/quick-chat] Success:", result.success);
    console.log("[API/quick-chat] Provider:", result.provider);

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
    console.error("[API/quick-chat] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}