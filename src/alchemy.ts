import { z } from "zod";
import { AlchemyGasManagerConfig } from "@alchemy/aa-alchemy";
import {
  SupportedAccountTypes,
  cookieStorage,
  createConfig,
} from "@alchemy/aa-alchemy/config";
import { SmartAccountClientOptsSchema, baseSepolia } from "@alchemy/aa-core";
import { QueryClient } from "@tanstack/react-query";

export const chain = baseSepolia;
export const config = createConfig({
  rpcUrl: "/api/rpc/chain/" + chain.id,
  sessionConfig: {
    expirationTimeMs: 60 * 60 * 1000,
  },
  signerConnection: {
    rpcUrl: "/api/rpc/",
  },
  chain,
  ssr: true,
  storage: cookieStorage,
});

export const queryClient = new QueryClient();
export const accountType: SupportedAccountTypes = "MultiOwnerModularAccount";
export const gasManagerConfig: AlchemyGasManagerConfig = {
  policyId: process.env.NEXT_PUBLIC_ALCHEMY_GAS_MANAGER_POLICY_ID!,
};
// additional options for our account client
type SmartAccountClienOptions = z.infer<typeof SmartAccountClientOptsSchema>;
export const accountClientOptions: Partial<SmartAccountClienOptions> = {
  txMaxRetries: 20,
};
