/** @jsxImportSource frog/jsx */
import { Button, Frog } from "frog";
import { handle } from "frog/next";
import { devtools } from "frog/dev";
import { serveStatic } from "frog/serve-static";
import { multicall } from "@wagmi/core";

import spaceAbi from "@/abi/space";
import { getConfig } from "@/wagmi";
import { Address } from "viem";

const app = new Frog({
  basePath: "/api/frame",
  browserLocation: "/:path",
  title: "Frog Frame",
});

app.frame("/space/:address", async (c) => {
  console.log("space 1");
  const spaceAddress = c.req.param("address") as Address;
  console.log("space 2");

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
  console.log("space 3");

  const nameResult = result[0];
  const bioResult = result[1];
  const linksResult = result[2];
  console.log("space 4");

  if (
    nameResult.status === "failure" ||
    bioResult.status === "failure" ||
    linksResult.status === "failure"
  ) {
    return c.res({
      image: <div>Unable to fetch the space</div>,
    });
  }
  console.log("space 5");

  const name = nameResult.result;
  const bio = bioResult.result;
  const links = linksResult.result;
  console.log("space 6");

  return c.res({
    image: (
      <div>
        <div>{name}</div>
        <div>{bio}</div>
        <div>{links}</div>
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

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
