// Chat AI Provider Service - Quick Answers
// Provider Priority: Gemma (fast) → Llama → DeepSeek (fallback)
// Timeout: 5s / 12s / 5s per provider, 20s total max

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
}

export interface AIProviderLog {
  provider: string;
  model: string;
  status: "attempted" | "success" | "failed" | "timeout";
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

const CHAT_TIMEOUT_GEMMA = 5000;
const CHAT_TIMEOUT_LLAMA = 12000;
const CHAT_TIMEOUT_DEEPSEEK = 12000;
const CHAT_MAX_TOTAL = 20000;

const NVIDIA_NIM_ENDPOINT = "https://integrate.api.nvidia.com/v1/chat/completions";

export class ChatAIProrityService {
  private static providers: AIProviderConfig[] = [
    {
      name: "Gemma 3n e4b",
      apiKey: process.env.GEMMA_3N_API_KEY || "",
      baseUrl: NVIDIA_NIM_ENDPOINT,
      model: "google/gemma-3n-e4b-it",
      timeout: CHAT_TIMEOUT_GEMMA,
    },
    {
      name: "Llama 3.1 70B",
      apiKey: process.env.LLAMA_31_API_KEY || "",
      baseUrl: NVIDIA_NIM_ENDPOINT,
      model: "abacusai/dracarys-llama-3.1-70b-instruct",
      timeout: CHAT_TIMEOUT_LLAMA,
    },
    {
      name: "DeepSeek V4 Pro",
      apiKey: process.env.DEEPSEEK_V4_PRO_API_KEY || "",
      baseUrl: NVIDIA_NIM_ENDPOINT,
      model: "deepseek-ai/deepseek-v4-pro",
      timeout: CHAT_TIMEOUT_DEEPSEEK,
    },
  ];

  static async generateResponse(
    systemPrompt: string,
    userMessage: string,
    onLog?: (log: AIProviderLog) => void
  ): Promise<AIResponse> {
    const logs: AIProviderLog[] = [];
    const totalStartTime = Date.now();

    const fullMessage = `${systemPrompt}\n\nUser: ${userMessage}\n\nAssistant:`;
    const contextSizeKb = (fullMessage.length / 1024).toFixed(1);

    console.log("\n[Chat AI] Quick response request");
    console.log("[Chat AI] Context: " + contextSizeKb + " KB");

    for (let i = 0; i < ChatAIProrityService.providers.length; i++) {
      const provider = ChatAIProrityService.providers[i];

      if (!provider.apiKey) {
        console.log(`[Chat AI] SKIP ${provider.name}: No key`);
        continue;
      }

      const providerStartTime = Date.now();

      const logEvent = (log: AIProviderLog) => {
        logs.push(log);
        onLog?.(log);
      };

      logEvent({ provider: provider.name, model: provider.model, status: "attempted" });

      const result = await ChatAIProrityService.callProvider(provider, fullMessage, providerStartTime);

      console.log(`[Chat AI] ${provider.name}: ${result.success ? "SUCCESS" : "FAILED"} (${result.responseTimeMs}ms)`);

      if (result.success) {
        logEvent({ provider: result.provider, model: result.model, status: "success", responseTimeMs: result.responseTimeMs });
        return {
          success: true,
          provider: result.provider,
          model: result.model,
          response: result.response!,
          responseTimeMs: result.responseTimeMs!,
          fallbackLevel: i,
          contextSizeKb: parseFloat(contextSizeKb),
        };
      }

      logEvent({
        provider: result.provider,
        model: result.model,
        status: result.error?.includes("timeout") ? "timeout" : "failed",
        responseTimeMs: result.responseTimeMs,
      });

      if (Date.now() - totalStartTime >= CHAT_MAX_TOTAL) {
        console.log(`[Chat AI] MAX TIME (${CHAT_MAX_TOTAL}ms) EXCEEDED`);
        break;
      }
    }

    return {
      success: false,
      provider: "None",
      model: "None",
      response: "Unable to generate response. All AI providers failed.",
      responseTimeMs: Date.now() - totalStartTime,
      fallbackLevel: 3,
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
      messages: [{ role: "user", content: message }],
      max_tokens: 400,
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
        return {
          success: false,
          provider: provider.name,
          model: provider.model,
          error: `HTTP ${response.status}`,
          statusCode: response.status,
          responseTimeMs,
        };
      }

      const data = await response.json();

      if (data.choices?.[0]?.message?.content) {
        return {
          success: true,
          provider: provider.name,
          model: provider.model,
          response: data.choices[0].message.content,
          responseTimeMs,
        };
      }

      return { success: false, provider: provider.name, model: provider.model, error: "Invalid format", responseTimeMs };
    } catch (error) {
      const responseTimeMs = Date.now() - startTime;
      if (error instanceof Error && error.name === "AbortError") {
        return { success: false, provider: provider.name, model: provider.model, error: "timeout", responseTimeMs };
      }
      return { success: false, provider: provider.name, model: provider.model, error: error instanceof Error ? error.message : "Unknown", responseTimeMs };
    }
  }
}