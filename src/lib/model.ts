import { gateway, wrapLanguageModel } from "ai"
import { devToolsMiddleware } from "@ai-sdk/devtools"

const isDev = process.env.NODE_ENV === "development"

export function createModel(modelId: string) {
  const baseModel = gateway(modelId)
  return isDev
    ? wrapLanguageModel({ model: baseModel, middleware: devToolsMiddleware() })
    : baseModel
}
