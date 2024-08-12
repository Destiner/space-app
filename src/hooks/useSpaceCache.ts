import {
  useSendUserOperation,
  useSmartAccountClient,
} from "@alchemy/aa-alchemy/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Address, encodeFunctionData, Hex } from "viem";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";

import easAbi from "@/abi/eas";
import { accountType, gasManagerConfig } from "@/alchemy";
import { Item } from "@/components/__common/ItemEditor";
import spaceAbi from "@/abi/space";

const easContractAddress = "0x4200000000000000000000000000000000000021";
const schemaUID =
  "0x5e331c5631c07b6df8b7e28a30cf3ea91d33af545e84e3b0aaf4c12dc3fea507";

interface State {
  name: string;
  bio: string;
  links: Item[];
  endorsement: null | {
    reason: string;
  };
}

interface LinkRemoval {
  type: "remove";
  prevId: bigint;
}

interface LinkAddition {
  type: "add";
  prevId: bigint;
  item: Item;
}

interface LinkReorder {
  type: "reorder";
  oldPrevId: bigint;
  newPrevId: bigint;
}

type LinkUpdate = LinkRemoval | LinkAddition | LinkReorder;

interface UseSpaceCache {
  state: State;
  isSaved: boolean;
  setInitialName: (name: string) => void;
  setInitialBio: (bio: string) => void;
  setInitialLinks: (links: Item[]) => void;
  setInitialIsEndorsed: (isEndorsed: boolean) => void;
  setInitialEndorsementReason: (endorsementReason: string) => void;
  updateName: (name: string) => void;
  updateBio: (bio: string) => void;
  updateLinks: (action: LinkUpdate) => void;
  updateIsEndorsed: (isEndorsed: boolean) => void;
  updateEndorsementReason: (endorsementReason: string) => void;
}

const useTimer = (callback: () => void, interval: number) => {
  useEffect(() => {
    const timer = setInterval(() => {
      callback();
    }, interval);

    return () => clearInterval(timer);
  }, [callback, interval]);
};

function useSpaceCache(address: Address): UseSpaceCache {
  const [nameChanged, setNameChanged] = useState(false);
  const [bioChanged, setBioChanged] = useState(false);
  const [linkUpdates, setLinkUpdates] = useState<LinkUpdate[]>([]);
  const [isEndorsedChanged, setIsEndorsedChanged] = useState(false);
  const [endorsementReasonChanged, setEndorsementReasonChanged] =
    useState(false);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [links, setLinks] = useState<Item[]>([]);
  const [isEndorsed, setIsEndorsed] = useState(false);
  const [endorsementReason, setEndorsementReason] = useState("");

  const { client } = useSmartAccountClient({
    type: accountType,
    gasManagerConfig,
  });
  const { sendUserOperation, sendUserOperationResult, isSendingUserOperation } =
    useSendUserOperation({ client, waitForTxn: true });

  const setInitialName = useCallback((newName: string) => {
    setName(newName);
  }, []);

  const setInitialBio = useCallback((bio: string) => {
    setBio(bio);
  }, []);

  const setInitialLinks = useCallback((links: Item[]) => {
    setLinks(links);
  }, []);

  const setInitialIsEndorsed = useCallback((isEndorsed: boolean) => {
    setIsEndorsed(isEndorsed);
  }, []);

  const setInitialEndorsementReason = useCallback(
    (endorsementReason: string) => {
      setEndorsementReason(endorsementReason);
    },
    []
  );

  const state = useMemo(() => {
    return {
      name,
      bio,
      links,
      endorsement: isEndorsed
        ? {
            reason: endorsementReason,
          }
        : null,
    };
  }, [name, bio, links, isEndorsed, endorsementReason]);

  const updateName = useCallback((newName: string) => {
    setNameChanged(true);
    setName(newName);
  }, []);

  const updateBio = useCallback((bio: string) => {
    setBioChanged(true);
    setBio(bio);
  }, []);

  const updateLinks = (action: LinkUpdate) => {
    function getLinks() {
      switch (action.type) {
        case "add": {
          const oldPrevIndex = links.findIndex(
            (link) => link.id === action.prevId
          );
          const itemIndex = oldPrevIndex >= 0 ? oldPrevIndex + 1 : 0;
          const updatedLinks = [...links];
          updatedLinks.splice(itemIndex, 0, action.item);
          return updatedLinks;
        }
        case "remove": {
          const oldPrevIndex = links.findIndex(
            (link) => link.id === action.prevId
          );
          const itemIndex = oldPrevIndex >= 0 ? oldPrevIndex + 1 : 0;
          return links.filter((_, index) => index !== itemIndex);
        }
        case "reorder": {
          const updatedLinks = [...links];
          const oldPrevIndex = updatedLinks.findIndex(
            (link) => link.id === action.oldPrevId
          );
          const newPrevIndex = updatedLinks.findIndex(
            (link) => link.id === action.newPrevId
          );
          const itemIndex = oldPrevIndex >= 0 ? oldPrevIndex + 1 : 0;
          const item = updatedLinks[itemIndex];
          const newIndex = newPrevIndex >= 0 ? newPrevIndex + 1 : 0;
          updatedLinks.splice(itemIndex, 1);
          updatedLinks.splice(newIndex, 0, item);
          return updatedLinks;
        }
      }
    }

    setLinkUpdates([...linkUpdates, action]);
    const newLinks = getLinks();
    setLinks(newLinks);
  };

  const updateIsEndorsed = useCallback((isEndorsed: boolean) => {
    setIsEndorsedChanged(true);
    setIsEndorsed(isEndorsed);
  }, []);

  const updateEndorsementReason = useCallback((endorsementReason: string) => {
    setEndorsementReasonChanged(true);
    setEndorsementReason(endorsementReason);
  }, []);

  const isSaved = useMemo(
    () =>
      !nameChanged &&
      !bioChanged &&
      linkUpdates.length === 0 &&
      !isEndorsedChanged &&
      !endorsementReasonChanged,
    [
      nameChanged,
      bioChanged,
      linkUpdates,
      isEndorsedChanged,
      endorsementReasonChanged,
    ]
  );

  useTimer(() => {
    if (nameChanged) {
      sendUserOperation({
        uo: {
          target: address,
          data: encodeFunctionData({
            abi: spaceAbi,
            functionName: "setName",
            args: [name],
          }),
        },
      });
      setNameChanged(false);
    }
    if (bioChanged) {
      sendUserOperation({
        uo: {
          target: address,
          data: encodeFunctionData({
            abi: spaceAbi,
            functionName: "setBio",
            args: [bio],
          }),
        },
      });
      setBioChanged(false);
    }
    if (linkUpdates.length > 0) {
      const linkUpdate = linkUpdates[0];
      switch (linkUpdate.type) {
        case "add": {
          sendUserOperation({
            uo: {
              target: address,
              data: encodeFunctionData({
                abi: spaceAbi,
                functionName: "addLink",
                args: [
                  linkUpdate.prevId,
                  linkUpdate.item.label,
                  linkUpdate.item.value,
                ],
              }),
            },
          });
          break;
        }
        case "remove": {
          sendUserOperation({
            uo: {
              target: address,
              data: encodeFunctionData({
                abi: spaceAbi,
                functionName: "removeLink",
                args: [linkUpdate.prevId],
              }),
            },
          });
          break;
        }
        case "reorder": {
          sendUserOperation({
            uo: {
              target: address,
              data: encodeFunctionData({
                abi: spaceAbi,
                functionName: "reorderLink",
                args: [linkUpdate.oldPrevId, linkUpdate.newPrevId],
              }),
            },
          });
          break;
        }
      }
      setLinkUpdates(linkUpdates.slice(1));
    }
    if (isEndorsedChanged) {
      const schemaEncoder = new SchemaEncoder("string reason");
      const encodedData = schemaEncoder.encodeData([
        { name: "reason", value: endorsementReason, type: "string" },
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
      setIsEndorsedChanged(false);
    }
  }, 15 * 1000);

  return {
    state,
    isSaved,
    setInitialName,
    setInitialBio,
    setInitialLinks,
    setInitialIsEndorsed,
    setInitialEndorsementReason,
    updateName,
    updateBio,
    updateLinks,
    updateIsEndorsed,
    updateEndorsementReason,
  };
}

export default useSpaceCache;
export type { UseSpaceCache };
