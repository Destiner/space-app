"use client";

import { getFrameMetadata } from "frog/next";
import type { Metadata } from "next";
import React from "react";

import SpaceView from "@/components/space/SpaceView";

type Props = {
  params: {
    address: string;
  };
};

const Space: React.FC<Props> = ({ params }: Props) => {
  const { address } = params;

  return <SpaceView address={address} />;
};

export async function generateMetadata(): Promise<Metadata> {
  const url = process.env.VERCEL_URL || "http://localhost:3000";
  console.log("url", url);
  const frameMetadata = await getFrameMetadata(`${url}/api/frame`);
  return {
    other: frameMetadata,
  };
}

export default Space;
