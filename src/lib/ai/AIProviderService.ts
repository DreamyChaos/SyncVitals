// AI Provider Service - SyncVitals AI Communication Layer
// Provider Priority: Llama 3.1 70B → DeepSeek V4 Pro → Gemma 3n

export interface AIProviderConfig {
  name: string;
  apiKey: string;
  baseUrl: string;
  model: string;
  timeout?: number;
}

export interface AIProviderResult {
  success: boolean;
  provider: string;
  model: string;
  response?: string;
  error?: string;
  statusCode?: number;
  responseTimeMs?: number;
  wasFallback?: boolean;
}

export interface AIProviderLog {
  provider: string;
  model: string;
  status: "attempted" | "success" | "failed" | "timeout";
  statusCode?: number;
  error?: string;
  responseTimeMs?: number;
}

export interface AIResponse {
  success: boolean;
  provider: string;
  model: string;
  response: string;
  responseTimeMs: number;
  fallbackLevel: number;
  contextSizeKb: number;
}

export interface HealthContext {
  healthScore: number;
  healthAge: number;
  sleepHours: number;
  hydrationLiters: number;
  stressLevel: string;
  activityLevel: string;
  steps: number;
  calories: number;
  heartRate: number;
  riskFactors: string[];
  weeklyTrend: string;
  monthlyTrend: string;
  recentCheckIns: string;
  medicationData: string;
  timelineEvents: string;
}

const PROVIDER_TIMEOUT = 8000; // 8 seconds per provider
const MAX_TOTAL_WAIT = 15000; // 15 seconds max

const NVIDIA_NIM_ENDPOINT = "https://integrate.api.nvidia.com/v1/chat/completions";

export class AIProviderService {
  private static providers: AIProviderConfig[] = [
    {
      name: "Llama 3.1 70B",
      apiKey: process.env.LLAMA_31_API_KEY || "",
      baseUrl: NVIDIA_NIM_ENDPOINT,
      model: "abacusai/dracarys-llama-3.1-70b-instruct",
      timeout: PROVIDER_TIMEOUT,
    },
    {
      name: "DeepSeek V4 Pro",
      apiKey: process.env.DEEPSEEK_V4_PRO_API_KEY || "",
      baseUrl: NVIDIA_NIM_ENDPOINT,
      model: "deepseek-ai/deepseek-v4-pro",
      timeout: PROVIDER_TIMEOUT,
    },
    {
      name: "Gemma 3n e4b",
      apiKey: process.env.GEMMA_3N_API_KEY || "",
      baseUrl: NVIDIA_NIM_ENDPOINT,
      model: "google/gemma-3n-e4b-it",
      timeout: PROVIDER_TIMEOUT,
    },
  ];

  static getAvailableProviders(): { name: string; hasKey: boolean; model: string }[] {
    return AIProviderService.providers.map((p) => ({
      name: p.name,
      hasKey: !!p.apiKey,
      model: p.model,
    }));
  }

  static buildSystemPrompt(healthContext: HealthContext): string {
    return `You are SyncVitals AI, a premium health intelligence assistant.

Current User Health Data:
- Health Score: ${healthContext.healthScore}
- Health Age: ${healthContext.healthAge}
- Sleep: ${healthContext.sleepHours} hours
- Hydration: ${healthContext.hydrationLiters}L
- Stress: ${healthContext.stressLevel}
- Activity: ${healthContext.activityLevel}
- Steps: ${healthContext.steps}
- Heart Rate: ${healthContext.heartRate} bpm

Recent Risks:
${healthContext.riskFactors.length > 0 ? healthContext.riskFactors.map(r => `- ${r}`).join("\n") : "- None detected"}

Weekly Trend:
${healthContext.weeklyTrend}

Recent Check-ins:
${healthContext.recentCheckIns}

Medication Data:
${healthContext.medicationData}

Timeline Events:
${healthContext.timelineEvents}

Use this information when answering. Always prioritize user data over generic health knowledge.
Keep responses concise (150-250 words unless detail is requested).
Avoid long introductions - get straight to the health insight.`;
  }

  static async generateResponse(
    systemPrompt: string,
    userMessage: string,
    healthContext?: HealthContext,
    onLog?: (log: AIProviderLog) => void
  ): Promise<AIResponse> {
    const logs: AIProviderLog[] = [];
    const totalStartTime = Date.now();

    // Build full system prompt with health context
    const fullSystemPrompt = healthContext
      ? AIProviderService.buildSystemPrompt(healthContext)
      : systemPrompt;

    const fullMessage = `${fullSystemPrompt}\n\nUser: ${userMessage}\n\nAssistant:`;
    const contextSizeKb = (fullMessage.length / 1024).toFixed(1);

    console.log("\n" + "=".repeat(80));
    console.log("[SyncVitals AI] INCOMING REQUEST");
    console.log("=".repeat(80));
    console.log(`[SyncVitals AI] Context Size: ${contextSizeKb} KB`);
    console.log(`[SyncVitals AI] User Message: "${userMessage.substring(0, 100)}..."`);
    console.log("=".repeat(80));

    const logEvent = (log: AIProviderLog) => {
      logs.push(log);
      onLog?.(log);
    };

    let fallbackLevel = 0;

    for (let i = 0; i < AIProviderService.providers.length; i++) {
      const provider = AIProviderService.providers[i];

      if (i > 0) fallbackLevel = i;

      if (!provider.apiKey) {
        console.log(`[SyncVitals AI] SKIP ${provider.name}: No API key`);
        continue;
      }

      const providerStartTime = Date.now();

      console.log(`\n[SyncVitals AI] Attempting: ${provider.name}`);
      console.log(`[SyncVitals AI] Model: ${provider.model}`);
      console.log(`[SyncVitals AI] Timeout: ${provider.timeout}ms`);

      logEvent({
        provider: provider.name,
        model: provider.model,
        status: "attempted",
      });

      const result = await AIProviderService.callProvider(provider, fullMessage, providerStartTime);

      const elapsed = Date.now() - totalStartTime;

      console.log(`[SyncVitals AI] Result: ${result.success ? "SUCCESS" : "FAILED"}`);
      console.log(`[SyncVitals AI] Response Time: ${result.responseTimeMs}ms`);
      console.log(`[SyncVitals AI] Total Elapsed: ${elapsed}ms`);

      if (result.success) {
        logEvent({
          provider: result.provider,
          model: result.model,
          status: "success",
          responseTimeMs: result.responseTimeMs,
        });

        console.log(`\n[SyncVitals AI] RESPONSE from ${result.provider}:`);
        console.log(`[SyncVitals AI] ${result.response?.substring(0, 200)}...`);

        return {
          success: true,
          provider: result.provider,
          model: result.model,
          response: result.response!,
          responseTimeMs: result.responseTimeMs!,
          fallbackLevel,
          contextSizeKb: parseFloat(contextSizeKb),
        };
      }

      if (result.error?.includes("timeout")) {
        console.log(`[SyncVitals AI] TIMEOUT on ${provider.name}`);
        logEvent({
          provider: result.provider,
          model: result.model,
          status: "timeout",
          error: result.error,
          responseTimeMs: result.responseTimeMs,
        });
      } else {
        logEvent({
          provider: result.provider,
          model: result.model,
          status: "failed",
          statusCode: result.statusCode,
          error: result.error,
          responseTimeMs: result.responseTimeMs,
        });
      }

      // Check if we've exceeded max wait time
      if (elapsed >= MAX_TOTAL_WAIT) {
        console.log(`[SyncVitals AI] MAX WAIT TIME (${MAX_TOTAL_WAIT}ms) EXCEEDED`);
        break;
      }
    }

    const totalTime = Date.now() - totalStartTime;

    console.error(`\n${"=".repeat(80)}`);
    console.error(`[SyncVitals AI] ALL PROVIDERS FAILED`);
    console.error(`[SyncVitals AI] Total Time: ${totalTime}ms`);
    console.error(`[SyncVitals AI] Fallback Level: ${fallbackLevel}`);
    console.error("=".repeat(80));

    return {
      success: false,
      provider: "None",
      model: "None",
      response: "Unable to generate response. All AI providers failed.",
      responseTimeMs: totalTime,
      fallbackLevel,
      contextSizeKb: parseFloat(contextSizeKb),
    };
  }

  private static async callProvider(
    provider: AIProviderConfig,
    message: string,
    startTime: number
  ): Promise<AIProviderResult> {
    const requestBody = {
      model: provider.model,
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
      max_tokens: 500,
      temperature: 0.6,
      top_p: 0.85,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), provider.timeout);

      const response = await fetch(provider.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${provider.apiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const responseTimeMs = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          provider: provider.name,
          model: provider.model,
          error: `HTTP ${response.status}: ${errorText.substring(0, 200)}`,
          statusCode: response.status,
          responseTimeMs,
        };
      }

      const data = await response.json();

      if (data.choices && data.choices[0] && data.choices[0].message) {
        return {
          success: true,
          provider: provider.name,
          model: provider.model,
          response: data.choices[0].message.content,
          responseTimeMs,
        };
      }

      return {
        success: false,
        provider: provider.name,
        model: provider.model,
        error: `Invalid response format`,
        responseTimeMs,
      };
    } catch (error) {
      const responseTimeMs = Date.now() - startTime;

      if (error instanceof Error && error.name === "AbortError") {
        return {
          success: false,
          provider: provider.name,
          model: provider.model,
          error: "timeout",
          responseTimeMs,
        };
      }

      return {
        success: false,
        provider: provider.name,
        model: provider.model,
        error: error instanceof Error ? error.message : "Unknown error",
        responseTimeMs,
      };
    }
  }
}