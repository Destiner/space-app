"use client";

import { QueryClient } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

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
    <DndProvider backend={HTML5Backend}>
      <AlchemyAccountProvider
        config={config}
        queryClient={queryClient}
        initialState={props.initialState}
      >
        {props.children}
      </AlchemyAccountProvider>
    </DndProvider>
  );
}
