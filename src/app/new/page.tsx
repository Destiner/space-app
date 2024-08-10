"use client";

import React, { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { Address, decodeEventLog } from "viem";
import { useRouter } from "next/navigation";
import spaceFactoryAbi from "@/abi/spaceFactory";
import { Item } from "@/components/new/ItemEditor";
import ItemListEditor from "@/components/new/ItemListEditor";
import styles from "./page.module.css";

const SPACE_FACTORY_ADDRESS = "0xdfe6cea709b58e2a112729a1a4cf8a7a8eb7c508";

const CreateSpace: React.FC = () => {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [spaceAddress, setSpaceAddress] = useState<Address | null>(null);

  const { isConnected } = useAccount();

  const { data: hash, writeContract } = useWriteContract();

  const { data: receipt } = useWaitForTransactionReceipt({ hash });

  const create = async () => {
    writeContract({
      address: SPACE_FACTORY_ADDRESS,
      abi: spaceFactoryAbi,
      functionName: "create",
      args: [
        items.map((item) => {
          return { label: item.label, value: item.value };
        }),
      ],
    });
  };

  useEffect(() => {
    if (receipt && !spaceAddress) {
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
  }, [receipt, spaceAddress, router]);

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <h1>Create Your Space</h1>
        <div className={styles.form}>
          <ItemListEditor initialModel={items} onChange={setItems} />
          <div>
            <button
              className={styles.button}
              disabled={!isConnected}
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

export default CreateSpace;
