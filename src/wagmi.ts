import { http, cookieStorage, createConfig, createStorage } from "wagmi";
import { baseSepolia, sepolia } from "wagmi/chains";
import { coinbaseWallet } from "wagmi/connectors";

export function getEnsConfig() {
  return createConfig({
    chains: [sepolia],
    transports: {
      [sepolia.id]: http(),
    },
  });
}

export function getConfig() {
  return createConfig({
    chains: [baseSepolia],
    connectors: [coinbaseWallet()],
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    transports: {
      [baseSepolia.id]: http(),
    },
  });
}

declare module "wagmi" {
  interface Register {
    config: ReturnType<typeof getConfig>;
  }
}
