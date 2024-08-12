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
  const url = `https://${process.env.VERCEL_URL}` || "http://localhost:3000";
  console.log("url", url);
  const frameMetadata = await getFrameMetadata(
    `${url}/api/frame/space/${address}`
  );
  console.log("frameMetadata", frameMetadata);
  const text = await fetch(`${url}/api/frame/space/${address}`).then((r) =>
    r.text()
  );
  console.log("text", text);
  return {
    other: frameMetadata,
  };
}

export default Space;
