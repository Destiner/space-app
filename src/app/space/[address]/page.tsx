"use client";

import React, { useState, useEffect, useMemo } from "react";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { useQuery } from "@tanstack/react-query";
import {
  useReadContract,
  useWriteContract,
  useTransactionReceipt,
  useAccount,
  useEnsName,
  useEnsAvatar,
} from "wagmi";
import request from "graphql-request";
import * as Avatar from "@radix-ui/react-avatar";
import { Address, encodePacked, getAddress, Hex, keccak256 } from "viem";

import easAbi from "@/abi/eas";
import spaceAbi from "@/abi/space";
import ItemEditor, { type Item } from "@/components/new/ItemEditor";
import { graphql } from "@/gql/gql";

import styles from "./page.module.css";
import { normalize } from "viem/ens";

const easContractAddress = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e";
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
  const { address: accountAddress } = useAccount();

  const [formVisible, setFormVisible] = useState(false);
  const [item, setItem] = useState<Item | undefined>(undefined);
  const [bioEditorVisible, setBioEditorVisible] = useState(false);
  const [bio, setBio] = useState("");

  const { data: hash, writeContract } = useWriteContract();
  const { data: receipt } = useTransactionReceipt({ hash });

  const ownerRequest = useReadContract({
    abi: spaceAbi,
    address: address as Address,
    functionName: "owner",
    args: [],
  });

  const bioRequest = useReadContract({
    abi: spaceAbi,
    address: address as Address,
    functionName: "bio",
    args: [],
  });

  const linksRequest = useReadContract({
    abi: spaceAbi,
    address: address as Address,
    functionName: "getLinks",
    args: [0n, 100n],
  });

  const owner = ownerRequest.data;
  const isOwner = owner === accountAddress;

  const { data: spaceAttestations } = useQuery({
    queryKey: ["spaceAttestations", owner, accountAddress],
    queryFn: async () =>
      request("https://sepolia.easscan.org/graphql", spaceAttestationQuery, {
        recipient: getAddress(address),
        context: accountAddress,
      }),
  });

  const isEndorsed = useMemo<boolean>(
    () =>
      spaceAttestations
        ? spaceAttestations.personalAttestation.length > 0
        : false,
    [spaceAttestations]
  );

  useEffect(() => {
    if (receipt) {
      linksRequest.refetch();
      bioRequest.refetch();
    }
  }, [receipt, linksRequest, bioRequest]);

  const ensName = useEnsName({
    address: owner,
  });
  const ensAvatar = useEnsAvatar({
    name: normalize(ensName.data || ""),
  });

  useEffect(() => {
    setBio(bioRequest.data || "");
  }, [bioRequest.data]);

  const removeItem = (index: number) => {
    if (!linksRequest.data || !address) return;
    const prevItem = linksRequest.data[index - 1];
    const prevId = prevItem ? getLinkId(prevItem) : 0n;
    writeContract({
      abi: spaceAbi,
      address: address as Address,
      functionName: "removeLink",
      args: [prevId],
    });
  };

  const addItem = () => {
    if (!linksRequest.data || !address || !item) return;
    const prevItem = linksRequest.data[linksRequest.data.length - 1];
    const prevId = prevItem ? getLinkId(prevItem) : 0n;
    writeContract({
      abi: spaceAbi,
      address: address as Address,
      functionName: "addLink",
      args: [prevId, item.label, item.value],
    });
    setFormVisible(false);
  };

  const getLinkId = (link: Item): bigint => {
    return BigInt(
      keccak256(encodePacked(["string", "string"], [link.label, link.value]))
    );
  };

  const endorse = () => {
    if (!address) return;
    const schemaEncoder = new SchemaEncoder("string reason");
    const encodedData = schemaEncoder.encodeData([
      { name: "reason", value: "", type: "string" },
    ]) as Hex;
    writeContract({
      abi: easAbi,
      address: easContractAddress,
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
    });
  };

  const saveBio = () => {
    if (!address) return;
    writeContract({
      abi: spaceAbi,
      address: address as Address,
      functionName: "setBio",
      args: [bio],
    });
    setBioEditorVisible(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <h1>Space</h1>
        <div className={styles.view}>
          {owner && (
            <div className={styles.ens}>
              <Avatar.Root>
                {ensAvatar.data ? (
                  <Avatar.Image
                    className={styles.avatar}
                    src={ensAvatar.data}
                    alt="ENS avatar"
                  />
                ) : (
                  <Avatar.Fallback
                    className={`${styles.avatar} ${styles.fallback}`}
                  />
                )}
              </Avatar.Root>
              {ensName && <div className={styles.name}>{ensName.data}</div>}
            </div>
          )}
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
                      <button className="button" onClick={saveBio}>
                        Save
                      </button>
                      <button
                        className="button"
                        onClick={() => setBioEditorVisible(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    className="button"
                    onClick={() => setBioEditorVisible(true)}
                  >
                    {bioRequest.data ? "Edit" : "Add bio"}
                  </button>
                )}
              </div>
            )}
          </div>
          {!isOwner && (
            <div>
              {!isEndorsed ? (
                <button className="button" onClick={endorse}>
                  Endorse
                </button>
              ) : (
                <div className={styles.endorsed}>Endorsed by you</div>
              )}
            </div>
          )}
          {linksRequest.data && (
            <div className={styles.list}>
              {linksRequest.data.map((link, index) => (
                <div key={index} className={styles.item}>
                  <div className={styles.link}>
                    <div className={styles.label}>{link.label}</div>
                    <div className={styles.value}>{link.value}</div>
                  </div>
                  {isOwner && (
                    <button
                      className={`button ${styles.small}`}
                      onClick={() => removeItem(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              {isOwner && (
                <div>
                  {formVisible ? (
                    <>
                      <ItemEditor initialItem={item} onChange={setItem} />
                      <div className={styles.buttons}>
                        <button className={styles.large} onClick={addItem}>
                          Save
                        </button>
                        <button
                          className={`button ${styles.large}`}
                          onClick={() => setFormVisible(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      className={`button ${styles.large}`}
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
