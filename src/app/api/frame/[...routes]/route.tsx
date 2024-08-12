/** @jsxImportSource frog/jsx */
import { getConfig } from "@/wagmi";
import { Button, Frog } from "frog";
import { handle } from "frog/next";
import { Address } from "viem";
import { multicall } from "wagmi/actions";

import spaceAbi from "@/abi/space";

const app = new Frog({
  basePath: "/api/frame",
  title: "Frog Frame",
  imageOptions: {
    fonts: [
      {
        name: "Open Sans",
        weight: 400,
        source: "google",
      },
      {
        name: "Open Sans",
        weight: 700,
        source: "google",
      },
    ],
  },
});

export const runtime = "edge";

app.frame("/space/:address", async (c) => {
  const spaceAddress = c.req.param("address") as Address;

  const result = await multicall(getConfig(), {
    contracts: [
      {
        abi: spaceAbi,
        address: spaceAddress,
        functionName: "name",
      },
      {
        abi: spaceAbi,
        address: spaceAddress,
        functionName: "bio",
      },
      {
        abi: spaceAbi,
        address: spaceAddress,
        functionName: "getLinks",
        args: [0n, 100n],
      },
    ],
  });

  const nameResult = result[0];
  const bioResult = result[1];
  const linksResult = result[2];

  if (
    nameResult.status === "failure" ||
    bioResult.status === "failure" ||
    linksResult.status === "failure"
  ) {
    return c.res({
      image: (
        <div
          style={{
            background: "black",
            color: "white",
            display: "flex",
            height: "100%",
            fontSize: 60,
          }}
        >
          {"Unable to fetch space"}
        </div>
      ),
    });
  }

  const name = nameResult.result;
  const bio = bioResult.result;
  const links = linksResult.result;
  console.log("space", name, bio, links);

  return c.res({
    image: (
      <div
        style={{
          background: "black",
          color: "white",
          display: "flex",
          height: "100%",
          fontSize: 60,
        }}
      >
        <div>{name}</div>
        <div>{bio}</div>
      </div>
    ),
    intents: [
      // eslint-disable-next-line react/jsx-key
      <Button value="apple">Apple</Button>,
      // eslint-disable-next-line react/jsx-key
      <Button value="banana">Banana</Button>,
      // eslint-disable-next-line react/jsx-key
      <Button value="mango">Mango</Button>,
    ],
  });
});

export const GET = handle(app);
export const POST = handle(app);
