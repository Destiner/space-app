"use client";

import React, { useState, useEffect, useMemo } from "react";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { useQuery } from "@tanstack/react-query";
import request from "graphql-request";
import {
  Address,
  encodeFunctionData,
  encodePacked,
  getAddress,
  Hex,
  keccak256,
} from "viem";

import easAbi from "@/abi/eas";
import spaceAbi from "@/abi/space";
import ItemEditor, { type Item } from "@/components/__common/ItemEditor";
import { graphql } from "@/gql/gql";
import { accountType, gasManagerConfig } from "@/alchemy";

import styles from "./page.module.css";
import { readContract } from "@wagmi/core";
import {
  useAccount,
  useSendUserOperation,
  useSignerStatus,
  useSmartAccountClient,
} from "@alchemy/aa-alchemy/react";
import { getConfig } from "@/wagmi";
import ReorderableItemList from "@/components/space/ReorderableList";

const easContractAddress = "0x4200000000000000000000000000000000000021";
const schemaUID =
  "0x5e331c5631c07b6df8b7e28a30cf3ea91d33af545e84e3b0aaf4c12dc3fea507";

const spaceAttestationQuery = graphql(/* GraphQL */ `
  query SpaceAttestation($recipient: String, $context: String) {
    personalAttestation: attestations(
      where: {
        schemaId: {
          equals: "0x5e331c5631c07b6df8b7e28a30cf3ea91d33af545e84e3b0aaf4c12dc3fea507"
        }
        recipient: { equals: $recipient }
        attester: { equals: $context }
      }
    ) {
      id
    }
    attestations(
      where: {
        schemaId: {
          equals: "0x5e331c5631c07b6df8b7e28a30cf3ea91d33af545e84e3b0aaf4c12dc3fea507"
        }
        recipient: { equals: $recipient }
      }
      take: 10
    ) {
      attester
    }
  }
`);

type Props = {
  params: {
    address: string;
  };
};

const Space: React.FC<Props> = ({ params }: Props) => {
  const { address } = params;
  const { address: accountAddress } = useAccount({
    type: accountType,
  });

  const [formVisible, setFormVisible] = useState(false);
  const [item, setItem] = useState<Item | undefined>(undefined);
  const [nameEditorVisible, setNameEditorVisible] = useState(false);
  const [name, setName] = useState("");
  const [bioEditorVisible, setBioEditorVisible] = useState(false);
  const [bio, setBio] = useState("");

  const { isConnected } = useSignerStatus();
  const { client } = useSmartAccountClient({
    type: accountType,
    gasManagerConfig,
  });

  const getLinkId = (link: { value: string; label: string }): bigint => {
    return BigInt(
      keccak256(encodePacked(["string", "string"], [link.label, link.value]))
    );
  };

  const ownerRequest = useQuery({
    queryKey: ["owner", address],
    queryFn: async () => {
      return await readContract(getConfig(), {
        abi: spaceAbi,
        address: address as Address,
        functionName: "owner",
        args: [],
      });
    },
  });
  const nameRequest = useQuery({
    queryKey: ["name", address],
    queryFn: async () => {
      return await readContract(getConfig(), {
        abi: spaceAbi,
        address: address as Address,
        functionName: "name",
        args: [],
      });
    },
  });
  const bioRequest = useQuery({
    queryKey: ["bio", address],
    queryFn: async () => {
      return await readContract(getConfig(), {
        abi: spaceAbi,
        address: address as Address,
        functionName: "bio",
        args: [],
      });
    },
  });
  const linksRequest = useQuery({
    queryKey: ["links", address],
    queryFn: async () => {
      return await readContract(getConfig(), {
        abi: spaceAbi,
        address: address as Address,
        functionName: "getLinks",
        args: [0n, 100n],
      });
    },
  });
  const linkItems = useMemo<Item[]>(() => {
    if (linksRequest.data) {
      return linksRequest.data.map((link) => ({
        label: link.label,
        value: link.value,
        id: parseInt(getLinkId(link).toString()),
      }));
    }
    return [];
  }, [linksRequest.data]);

  const { sendUserOperation, sendUserOperationResult, isSendingUserOperation } =
    useSendUserOperation({ client, waitForTxn: true });

  const owner = useMemo(() => ownerRequest.data, [ownerRequest]);
  const isOwner = useMemo<boolean>(
    () => owner === accountAddress,
    [owner, accountAddress]
  );

  const { data: spaceAttestations } = useQuery({
    queryKey: ["spaceAttestations", owner, accountAddress],
    queryFn: async () =>
      request(
        "https://base-sepolia.easscan.org/graphql",
        spaceAttestationQuery,
        {
          recipient: getAddress(address),
          context: accountAddress,
        }
      ),
  });

  const isEndorsed = useMemo<boolean>(
    () =>
      spaceAttestations
        ? spaceAttestations.personalAttestation.length > 0
        : false,
    [spaceAttestations]
  );

  useEffect(() => {
    if (sendUserOperationResult) {
      linksRequest.refetch();
      nameRequest.refetch();
      bioRequest.refetch();
    }
  });

  useEffect(() => {
    setBio(bioRequest.data || "");
  }, [bioRequest.data]);

  useEffect(() => {
    setName(nameRequest.data || "");
  }, [nameRequest.data]);

  const removeItem = (index: number) => {
    if (!linksRequest.data || !address) return;
    const prevItem = linksRequest.data[index - 1];
    const prevId = prevItem ? getLinkId(prevItem) : 0n;
    sendUserOperation({
      uo: {
        target: address as Address,
        data: encodeFunctionData({
          abi: spaceAbi,
          functionName: "removeLink",
          args: [prevId],
        }),
      },
    });
  };

  const addItem = () => {
    if (!linksRequest.data || !address || !item) return;
    const prevItem = linksRequest.data[linksRequest.data.length - 1];
    const prevId = prevItem ? getLinkId(prevItem) : 0n;
    sendUserOperation({
      uo: {
        target: address as Address,
        data: encodeFunctionData({
          abi: spaceAbi,
          functionName: "addLink",
          args: [prevId, item.label, item.value],
        }),
      },
    });
    setFormVisible(false);
  };

  const endorse = () => {
    if (!address) return;
    const schemaEncoder = new SchemaEncoder("string reason");
    const encodedData = schemaEncoder.encodeData([
      { name: "reason", value: "", type: "string" },
    ]) as Hex;
    sendUserOperation({
      uo: {
        target: easContractAddress,
        data: encodeFunctionData({
          abi: easAbi,
          functionName: "attest",
          args: [
            {
              schema: schemaUID,
              data: {
                data: encodedData,
                revocable: true,
                recipient: address as Address,
                refUID:
                  "0x0000000000000000000000000000000000000000000000000000000000000000",
                value: 0n,
                expirationTime: 0n,
              },
            },
          ],
        }),
      },
    });
  };

  const saveName = () => {
    if (!address) return;
    sendUserOperation({
      uo: {
        target: address as Address,
        data: encodeFunctionData({
          abi: spaceAbi,
          functionName: "setName",
          args: [name],
        }),
      },
    });
    setNameEditorVisible(false);
  };

  const saveBio = () => {
    if (!address) return;
    sendUserOperation({
      uo: {
        target: address as Address,
        data: encodeFunctionData({
          abi: spaceAbi,
          functionName: "setBio",
          args: [bio],
        }),
      },
    });
    setBioEditorVisible(false);
  };

  function handleCancelNameClick() {
    setNameEditorVisible(false);
    setName(nameRequest.data || "");
  }

  function handleCancelBioClick() {
    setBioEditorVisible(false);
    setBio(bioRequest.data || "");
  }

  function handleCancelClick() {
    setFormVisible(false);
    setItem(undefined);
  }

  function handleSaveClick() {
    addItem();
    setItem(undefined);
  }

  function handleItemsChange(items: Item[], dragItem: Item, hoverItem: Item) {
    // Get the item that was moved
    const movedItem = dragItem;
    const oldIndex = linkItems.findIndex((item) => item.id === movedItem.id);
    // Get the old preceding (prev) item
    const oldPrevItem = oldIndex > 0 ? linkItems[oldIndex - 1] : undefined;
    const oldPrevItemId = oldPrevItem ? getLinkId(oldPrevItem) : 0n;
    // Get the new preceding (prev) item
    const hoverItemIndex = linkItems.findIndex(
      (item) => item.id === hoverItem.id
    );
    const newPrevItem =
      hoverItemIndex > 0 ? linkItems[hoverItemIndex - 1] : undefined;
    const newPrevItemId = newPrevItem ? getLinkId(newPrevItem) : 0n;
    // Call "reorderLink" with the old preceding item's ID and the new preceding item's ID
    sendUserOperation({
      uo: {
        target: address as Address,
        data: encodeFunctionData({
          abi: spaceAbi,
          functionName: "reorderLink",
          args: [oldPrevItemId, newPrevItemId],
        }),
      },
    });
  }

  function handleItemRemove(item: Item) {
    const index = linkItems.findIndex((i) => i.id === item.id);
    removeItem(index);
  }

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.view}>
          <div className={styles.personal}>
            <div className={styles.name}>
              {nameRequest.data && !nameEditorVisible && (
                <div>{nameRequest.data}</div>
              )}
              {isOwner && (
                <div className={styles.nameEditor}>
                  {nameEditorVisible ? (
                    <>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                      />
                      <div className={styles.buttons}>
                        <button className={styles.button} onClick={saveName}>
                          Save
                        </button>
                        <button
                          className={styles.button}
                          onClick={() => handleCancelNameClick()}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      className={styles.button}
                      disabled={!isConnected || isSendingUserOperation}
                      onClick={() => setNameEditorVisible(true)}
                    >
                      {nameRequest.data ? "Edit" : "Add name"}
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className={styles.bio}>
              {bioRequest.data && !bioEditorVisible && (
                <div>{bioRequest.data}</div>
              )}
              {isOwner && (
                <div className={styles.bioEditor}>
                  {bioEditorVisible ? (
                    <>
                      <input
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Your bio"
                      />
                      <div className={styles.buttons}>
                        <button className={styles.button} onClick={saveBio}>
                          Save
                        </button>
                        <button
                          className={styles.button}
                          onClick={() => handleCancelBioClick()}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      className={styles.button}
                      disabled={!isConnected || isSendingUserOperation}
                      onClick={() => setBioEditorVisible(true)}
                    >
                      {bioRequest.data ? "Edit" : "Add bio"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          {accountAddress && !isOwner && (
            <div>
              {!isEndorsed ? (
                <button
                  className="button"
                  disabled={!isConnected || isSendingUserOperation}
                  onClick={endorse}
                >
                  Endorse
                </button>
              ) : (
                <div className={styles.endorsed}>Endorsed by you</div>
              )}
            </div>
          )}
          {linksRequest.data && (
            <div className={styles.list}>
              {isOwner ? (
                <ReorderableItemList
                  items={linkItems}
                  onItemsChange={handleItemsChange}
                  onItemRemove={handleItemRemove}
                  disabled={isSendingUserOperation}
                />
              ) : (
                linksRequest.data.map((link, index) => (
                  <div key={index} className={styles.item}>
                    <div className={styles.link}>
                      <div className={styles.label}>{link.label}</div>
                      <div className={styles.value}>{link.value}</div>
                    </div>
                  </div>
                ))
              )}
              {isOwner && (
                <div>
                  {formVisible ? (
                    <>
                      <ItemEditor initialItem={item} onChange={setItem} />
                      <div className={styles.buttons}>
                        <button
                          disabled={isSendingUserOperation}
                          className={`${styles.button} ${styles.ghost} ${styles.large}`}
                          onClick={() => handleSaveClick()}
                        >
                          Save
                        </button>
                        <button
                          className={`${styles.button} ${styles.ghost} ${styles.large}`}
                          onClick={() => handleCancelClick()}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      className={`${styles.button} ${styles.ghost} ${styles.large}`}
                      onClick={() => setFormVisible(true)}
                    >
                      Add
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Space;
