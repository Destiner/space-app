import { getFrameMetadata, isFrameRequest } from "frog/next";
import type { Metadata } from "next";
import React from "react";

import SpaceView from "@/components/space/SpaceView";
import { headers } from "next/headers";

type Props = {
  params: {
    address: string;
  };
};

const Space: React.FC<Props> = ({ params }: Props) => {
  const { address } = params;

  if (isFrameRequest(headers())) return null;
  return <SpaceView address={address} />;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const address = params.address;
  const endpoint = process.env.VERCEL_URL
    ? "https://space-app-scope-sh.vercel.app"
    : "http://localhost:3000";
  const url = `${endpoint}/api/frame/space/${address}`;
  const frameMetadata = await getFrameMetadata(url);
  return {
    other: frameMetadata,
  };
}

export default Space;
