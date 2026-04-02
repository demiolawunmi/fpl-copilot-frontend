import { backendFetch, isApiError, type ApiError } from "./client";

export type CopilotBlendJobStatus = "queued" | "running" | "completed" | "failed";

export interface CopilotSourceWeights {
  fplcopilot: number;
  airsenal: number;
}

export interface CopilotBlendSubmitRequest {
  schema_version: string;
  correlation_id: string;
  source_weights: CopilotSourceWeights;
  task: "hybrid";
  force_refresh?: boolean;
}

export interface CopilotBlendSubmitAcceptedResponse {
  schema_version: string;
  correlation_id: string;
  job_id: string;
  status: "queued";
}

export interface CopilotHybridCore {
  summary: string;
  confidence: number;
}

export interface CopilotTransferPlayerRef {
  player_id: number;
  player_name: string;
}

export interface CopilotRecommendedTransfer {
  transfer_id: string;
  out: CopilotTransferPlayerRef;
  in: CopilotTransferPlayerRef;
  reason: string;
  projected_points_delta: number;
}

export interface CopilotAskCopilotResponse {
  answer: string;
  rationale: string[];
  confidence: number;
}

export interface CopilotDegradedMode {
  is_degraded: boolean;
  code?: "LLM_TIMEOUT" | "SCHEMA_VALIDATION_FAILED" | "PROVIDER_ERROR" | "FALLBACK";
  message?: string;
  fallback_used: boolean;
}

export interface CopilotHybridResultPayload {
  schema_version: string;
  correlation_id: string;
  core: CopilotHybridCore;
  recommended_transfers: CopilotRecommendedTransfer[];
  ask_copilot: CopilotAskCopilotResponse;
  degraded_mode: CopilotDegradedMode;
}

export interface CopilotErrorField {
  field: string;
  message: string;
}

export interface CopilotErrorDetail {
  code:
    | "VALIDATION_ERROR"
    | "NOT_FOUND"
    | "JOB_FAILED"
    | "LLM_TIMEOUT"
    | "SCHEMA_VALIDATION_FAILED";
  message: string;
  retryable: boolean;
  field_errors: CopilotErrorField[];
}

export interface CopilotErrorResponse {
  schema_version: string;
  correlation_id: string;
  error: CopilotErrorDetail;
}

export interface CopilotBlendJobStatusResponse {
  schema_version: string;
  correlation_id: string;
  job_id: string;
  status: CopilotBlendJobStatus;
  result: CopilotHybridResultPayload | null;
  error: CopilotErrorResponse | null;
}

function normalizeApiError(error: unknown, method: string, path: string): ApiError {
  if (isApiError(error)) {
    return error;
  }

  return {
    name: "ApiError",
    message: error instanceof Error ? error.message : "Backend request failed",
    status: 0,
    statusText: "NETWORK_ERROR",
    method,
    path,
    details: error,
  };
}

export async function submitCopilotBlendJob(
  body: CopilotBlendSubmitRequest,
): Promise<CopilotBlendSubmitAcceptedResponse> {
  const path = "/api/copilot/blend-jobs";
  try {
    return await backendFetch<CopilotBlendSubmitAcceptedResponse>(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    throw normalizeApiError(error, "POST", path);
  }
}

export async function getCopilotBlendJobStatus(
  jobId: string,
): Promise<CopilotBlendJobStatusResponse> {
  const path = `/api/copilot/blend-jobs/${encodeURIComponent(jobId)}`;
  try {
    return await backendFetch<CopilotBlendJobStatusResponse>(path);
  } catch (error) {
    throw normalizeApiError(error, "GET", path);
  }
}

export const pollCopilotBlendJob = getCopilotBlendJobStatus;

export async function getCopilotBlendJobResult(
  jobId: string,
): Promise<CopilotHybridResultPayload | null> {
  const status = await getCopilotBlendJobStatus(jobId);
  return status.status === "completed" ? status.result : null;
}
