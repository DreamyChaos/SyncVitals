import { NextRequest, NextResponse } from "next/server";
import { AIProviderService, HealthContext } from "@/lib/ai/AIProviderService";

export interface ChatRequest {
  userMessage: string;
  systemPrompt?: string;
  healthContext?: HealthContext;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { userMessage, systemPrompt, healthContext } = body;

    if (!userMessage || typeof userMessage !== "string") {
      return NextResponse.json(
        { success: false, error: "userMessage is required and must be a string" },
        { status: 400 }
      );
    }

    console.log("\n" + "=".repeat(80));
    console.log("[API/chat] Received chat request");
    console.log("[API/chat] User message:", userMessage.substring(0, 100));
    console.log("[API/chat] Health context:", healthContext ? "PROVIDED" : "NONE");
    console.log("=".repeat(80));

    const result = await AIProviderService.generateResponse(
      systemPrompt || "",
      userMessage,
      healthContext
    );

    console.log("\n" + "=".repeat(80));
    console.log("[API/chat] Response generated");
    console.log("[API/chat] Success:", result.success);
    console.log("[API/chat] Provider:", result.provider);
    console.log("[API/chat] Response Time:", result.responseTimeMs, "ms");
    console.log("[API/chat] Fallback Level:", result.fallbackLevel);
    console.log("[API/chat] Context Size:", result.contextSizeKb, "KB");
    console.log("=".repeat(80));

    if (result.success) {
      return NextResponse.json({
        success: true,
        response: result.response,
        provider: result.provider,
        responseTime: result.responseTimeMs,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: result.response,
      },
      { status: 500 }
    );
  } catch (error) {
    console.error("[API/chat] Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}