"use client";

import React, { useState, useEffect } from "react";
import { Address, decodeEventLog, encodeFunctionData, Hex } from "viem";
import { getTransactionReceipt } from "@wagmi/core";
import { useRouter } from "next/navigation";
import spaceFactoryAbi from "@/abi/spaceFactory";
import { Item } from "@/components/new/ItemEditor";
import ItemListEditor from "@/components/new/ItemListEditor";
import styles from "./page.module.css";
import {
  useSendUserOperation,
  useSignerStatus,
  useSmartAccountClient,
} from "@alchemy/aa-alchemy/react";
import { accountType, gasManagerConfig } from "@/alchemy";
import { getConfig } from "@/wagmi";

const SPACE_FACTORY_ADDRESS = "0x497d9a170b4decf47338d925930d39f87e0e6a5b";

const CreateSpace: React.FC = () => {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [spaceAddress, setSpaceAddress] = useState<Address | null>(null);

  const { isConnected } = useSignerStatus();
  const { client } = useSmartAccountClient({
    type: accountType,
    gasManagerConfig,
  });

  const { sendUserOperation, sendUserOperationResult, isSendingUserOperation } =
    useSendUserOperation({ client, waitForTxn: true });

  const create = async () => {
    sendUserOperation({
      uo: {
        target: SPACE_FACTORY_ADDRESS,
        value: 0n,
        data: encodeFunctionData({
          abi: spaceFactoryAbi,
          functionName: "create",
          args: [
            items.map((item) => {
              return { label: item.label, value: item.value };
            }),
          ],
        }),
      },
    });
  };

  async function openSpacePage(hash: Hex) {
    const receipt = await getTransactionReceipt(getConfig(), {
      hash,
    });
    const creationLog = receipt.logs.find(
      (log) => log.address === SPACE_FACTORY_ADDRESS
    );
    if (creationLog) {
      const creationEvent = decodeEventLog({
        abi: spaceFactoryAbi,
        data: creationLog.data,
        topics: creationLog.topics,
      });
      const newSpaceAddress = creationEvent.args.space as Address;
      setSpaceAddress(newSpaceAddress);
      router.push(`/space/${newSpaceAddress}`);
    }
  }

  useEffect(() => {
    if (sendUserOperationResult && !spaceAddress) {
      openSpacePage(sendUserOperationResult.hash);
    }
  });

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <h1>Create Your Space</h1>
        <div className={styles.form}>
          <ItemListEditor initialModel={items} onChange={setItems} />
          <div>
            <button
              className={styles.button}
              disabled={!isConnected || isSendingUserOperation}
              onClick={create}
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateSpaceAuth: React.FC = () => {
  const { isConnected } = useSignerStatus();

  if (!isConnected) {
    return (
      <div className={styles.page}>
        <div className={styles.content}>
          <h1>Sign In</h1>
          <p>You need to authorize to create a space.</p>
        </div>
      </div>
    );
  }

  return <CreateSpace />;
};

export default CreateSpaceAuth;
