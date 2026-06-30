import { ChatSDK } from "@repo/sdk-core";
import type { ChatSDKConfig } from "@repo/sdk-core";

export { ChatSDK } from "@repo/sdk-core";
export type { ChatSDKConfig, SSOAuthConfig, ChatSDK as ChatSDKType } from "@repo/sdk-core";

/**
 * Initialize the chat SDK for tenant web applications.
 */
export function createChatSDK(config: ChatSDKConfig) {
  return new ChatSDK(config);
}
