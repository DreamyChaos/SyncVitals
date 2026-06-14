import { NextResponse } from "next/server";

export async function GET() {
  const deepseekKey = process.env.DEEPSEEK_V4_PRO_API_KEY;
  const llamaKey = process.env.LLAMA_31_API_KEY;
  const gemmaKey = process.env.GEMMA_3N_API_KEY;

  // Also check old/incorrect names
  const oldDeepseekFlash = process.env.DEEPSEEK_V4_FLASH_API_KEY;
  const oldMinimax = process.env.MINIMAX_API_KEY;
  const deepseekV4ProOld = process.env.DEEPSEEK_V4_PRO_API_KEY;

  const report = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    // Current expected variables
    expectedVariables: {
      DEEPSEEK_V4_PRO_API_KEY: {
        exists: !!deepseekKey,
        prefix: deepseekKey?.substring(0, 10) || null,
        valueLength: deepseekKey?.length || 0,
      },
      LLAMA_31_API_KEY: {
        exists: !!llamaKey,
        prefix: llamaKey?.substring(0, 10) || null,
        valueLength: llamaKey?.length || 0,
      },
      GEMMA_3N_API_KEY: {
        exists: !!gemmaKey,
        prefix: gemmaKey?.substring(0, 10) || null,
        valueLength: gemmaKey?.length || 0,
      },
    },
    // Old/incorrect variable names (should not exist)
    oldVariables: {
      DEEPSEEK_V4_FLASH_API_KEY: {
        exists: !!oldDeepseekFlash,
        value: oldDeepseekFlash ? "***" : null,
      },
      MINIMAX_API_KEY: {
        exists: !!oldMinimax,
        value: oldMinimax ? "***" : null,
      },
      DEEPSEEK_V4_PRO_API_KEY: {
        // This is the correct name, check again
        exists: !!deepseekV4ProOld,
        value: deepseekV4ProOld ? "***" : null,
      },
    },
    // Summary
    summary: {
      allKeysPresent:
        !!deepseekKey && !!llamaKey && !!gemmaKey,
      deepseekPresent: !!deepseekKey,
      llamaPresent: !!llamaKey,
      gemmaPresent: !!gemmaKey,
    },
  };

  return NextResponse.json(report);
}