"use client";

import { QueryClient } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";

import { config } from "@/alchemy";
import {
  AlchemyAccountProvider,
  AlchemyAccountsProviderProps,
} from "@alchemy/aa-alchemy/react";

export function Providers(props: {
  children: ReactNode;
  initialState?: AlchemyAccountsProviderProps["initialState"];
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <AlchemyAccountProvider
      config={config}
      queryClient={queryClient}
      initialState={props.initialState}
    >
      {props.children}
    </AlchemyAccountProvider>
  );
}
