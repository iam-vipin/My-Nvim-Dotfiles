import { AxiosError } from "axios";
import type { TSSOErrorCodes } from "@plane/constants";

export function isSSOError(
  error: unknown
): error is AxiosError & { response: { data: { error_code: TSSOErrorCodes; error_message: string } } } {
  return !!(
    error instanceof AxiosError &&
    "response" in error &&
    error.response &&
    "data" in error.response &&
    "error_code" in error.response.data &&
    "error_message" in error.response.data
  );
}
