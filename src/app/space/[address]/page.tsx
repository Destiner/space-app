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
  console.log("address", address);
  const endpoint = process.env.VERCEL_URL
    ? "https://space-app-scope-sh.vercel.app"
    : "http://localhost:3000";
  console.log("endpoint", endpoint);
  const url = `${endpoint}/api/frame/space/${address}`;
  console.log("url", url);
  const frameMetadata = await getFrameMetadata(url);
  console.log("frameMetadata", frameMetadata);
  const text = await fetch(url).then((r) => r.text());
  console.log("text", text);
  return {
    other: frameMetadata,
  };
}

export default Space;
