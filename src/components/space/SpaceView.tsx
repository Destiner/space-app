"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import request from "graphql-request";
import { Address, encodePacked, getAddress, keccak256 } from "viem";

import spaceAbi from "@/abi/space";
import useSpaceCache from "@/hooks/useSpaceCache";
import ItemEditor, { type Item } from "@/components/__common/ItemEditor";
import { graphql } from "@/gql/gql";
import { accountType } from "@/alchemy";

import styles from "./SpaceView.module.css";
import { readContract } from "@wagmi/core";
import { useAccount, useSignerStatus } from "@alchemy/aa-alchemy/react";
import { getConfig } from "@/wagmi";
import ReorderableItemList from "@/components/space/ReorderableList";

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
  address: string;
};

const Space: React.FC<Props> = ({ address }: Props) => {
  const { address: accountAddress } = useAccount({
    type: accountType,
  });

  const {
    state,
    setInitialName,
    setInitialBio,
    setInitialLinks,
    setInitialIsEndorsed,
    setInitialEndorsementReason,
    updateBio,
    updateName,
    updateLinks,
    updateIsEndorsed,
    updateEndorsementReason,
    isSaved,
  } = useSpaceCache(address as Address);

  const [formVisible, setFormVisible] = useState(false);
  const [item, setItem] = useState<Item | undefined>(undefined);
  const [nameEditorVisible, setNameEditorVisible] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [bioEditorVisible, setBioEditorVisible] = useState(false);
  const [bioInput, setBioInput] = useState("");

  const { isConnected } = useSignerStatus();

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

  const owner = useMemo(() => ownerRequest.data, [ownerRequest]);
  const isOwner = useMemo<boolean>(
    () => owner === accountAddress,
    [owner, accountAddress]
  );

  const attestationsRequest = useQuery({
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

  // const isEndorsed = useMemo<boolean>(
  //   () =>
  //     spaceAttestations
  //       ? spaceAttestations.personalAttestation.length > 0
  //       : false,
  //   [spaceAttestations]
  // );

  useEffect(() => {
    linksRequest.refetch();
    nameRequest.refetch();
    bioRequest.refetch();
    attestationsRequest.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setInitialBio(bioRequest.data || "");
    setBioInput(bioRequest.data || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bioRequest.data]);

  useEffect(() => {
    setInitialName(nameRequest.data || "");
    setNameInput(nameRequest.data || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameRequest.data]);

  useEffect(() => {
    setInitialLinks(
      (linksRequest.data || []).map((link) => ({
        label: link.label,
        value: link.value,
        id: getLinkId(link),
      }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linksRequest.data]);

  useEffect(() => {
    const attestationData = attestationsRequest.data;
    if (!attestationData) return;
    const isEndorsed = attestationData.personalAttestation.length > 0;
    setInitialIsEndorsed(isEndorsed);
    setInitialEndorsementReason("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attestationsRequest.data]);

  const removeItem = (index: number) => {
    if (!state.links || !address) return;
    const prevItem = state.links[index - 1];
    const prevId = prevItem ? getLinkId(prevItem) : 0n;
    updateLinks({ type: "remove", prevId });
  };

  const addItem = () => {
    if (!state.links || !address || !item) return;
    const prevItem = state.links[state.links.length - 1];
    const prevId = prevItem ? getLinkId(prevItem) : 0n;
    updateLinks({ type: "add", prevId, item });
    setFormVisible(false);
  };

  const endorse = () => {
    if (!address) return;
    const reason = "";
    updateIsEndorsed(true);
    updateEndorsementReason(reason);
  };

  const handleNameInputChange = (value: string) => {
    setNameInput(value);
  };

  const saveName = () => {
    if (!address) return;
    updateName(nameInput);
    setNameEditorVisible(false);
  };

  const handleBioInputChange = (value: string) => {
    setBioInput(value);
    updateBio(value);
  };

  const saveBio = () => {
    if (!address) return;
    updateBio(bioInput);
    setBioEditorVisible(false);
  };

  function handleCancelNameClick() {
    setNameEditorVisible(false);
    setNameInput(nameRequest.data || "");
  }

  function handleCancelBioClick() {
    setBioEditorVisible(false);
    setBioInput(bioRequest.data || "");
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
    const oldIndex = state.links.findIndex((item) => item.id === movedItem.id);
    // Get the old preceding (prev) item
    const oldPrevItem = oldIndex > 0 ? state.links[oldIndex - 1] : undefined;
    const oldPrevItemId = oldPrevItem ? getLinkId(oldPrevItem) : 0n;
    // Get the new preceding (prev) item
    const hoverItemIndex = state.links.findIndex(
      (item) => item.id === hoverItem.id
    );
    const newPrevItem =
      hoverItemIndex > 0 ? state.links[hoverItemIndex - 1] : undefined;
    const newPrevItemId = newPrevItem ? getLinkId(newPrevItem) : 0n;
    // Call "reorderLink" with the old preceding item's ID and the new preceding item's ID
    updateLinks({
      type: "reorder",
      oldPrevId: oldPrevItemId,
      newPrevId: newPrevItemId,
    });
  }

  function handleItemRemove(item: Item) {
    const index = state.links.findIndex((i) => i.id === item.id);
    removeItem(index);
  }

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.view}>
          <div className={styles.personal}>
            <div className={styles.name}>
              {state.name && !nameEditorVisible && <div>{state.name}</div>}
              {isOwner && (
                <div className={styles.nameEditor}>
                  {nameEditorVisible ? (
                    <>
                      <input
                        value={nameInput}
                        onChange={(e) => handleNameInputChange(e.target.value)}
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
                      disabled={!isConnected}
                      onClick={() => setNameEditorVisible(true)}
                    >
                      {state.name ? "Edit" : "Add name"}
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className={styles.bio}>
              {state.bio && !bioEditorVisible && <div>{state.bio}</div>}
              {isOwner && (
                <div className={styles.bioEditor}>
                  {bioEditorVisible ? (
                    <>
                      <input
                        value={bioInput}
                        onChange={(e) => handleBioInputChange(e.target.value)}
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
                      disabled={!isConnected}
                      onClick={() => setBioEditorVisible(true)}
                    >
                      {state.bio ? "Edit" : "Add bio"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          {accountAddress && !isOwner && (
            <div>
              {!state.endorsement ? (
                <button
                  className="button"
                  disabled={!isConnected}
                  onClick={endorse}
                >
                  Endorse
                </button>
              ) : (
                <div className={styles.endorsed}>
                  Endorsed by you{" "}
                  {state.endorsement.reason
                    ? `(${state.endorsement.reason}`
                    : ""}
                </div>
              )}
            </div>
          )}
          {state.links && (
            <div className={styles.list}>
              {isOwner ? (
                <ReorderableItemList
                  items={state.links}
                  onItemsChange={handleItemsChange}
                  onItemRemove={handleItemRemove}
                />
              ) : (
                state.links.map((link, index) => (
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
          {isOwner && (
            <div
              className={`${styles.status} ${isSaved ? styles.saved : styles.pending}`}
            >
              {isSaved ? (
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M7.5.877a6.623 6.623 0 1 0 0 13.246A6.623 6.623 0 0 0 7.5.877M1.827 7.5a5.673 5.673 0 1 1 11.346 0a5.673 5.673 0 0 1-11.346 0m8.332-1.962a.5.5 0 0 0-.818-.576L6.52 8.972L5.357 7.787a.5.5 0 0 0-.714.7L6.227 10.1a.5.5 0 0 0 .765-.062z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M.877 7.5a6.623 6.623 0 1 1 13.246 0a6.623 6.623 0 0 1-13.246 0M7.5 1.827a5.673 5.673 0 1 0 0 11.346a5.673 5.673 0 0 0 0-11.346"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {isSaved ? "All saved" : "Changes pending"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Space;
