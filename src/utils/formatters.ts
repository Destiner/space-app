import { Address } from "viem";

function formatAddress(value: Address): string {
  return `${value.substring(0, 6)}...${value.substring(value.length - 4)}`;
}

// eslint-disable-next-line import/prefer-default-export
export { formatAddress };
