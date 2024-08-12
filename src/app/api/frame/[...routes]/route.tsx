/** @jsxImportSource frog/jsx */
import { Button, Frog } from "frog";
import { handle } from "frog/next";
import { multicall } from "@wagmi/core";

import spaceAbi from "@/abi/space";
import { getConfig } from "@/wagmi";
import { Address } from "viem";

const app = new Frog({
  basePath: "/api/frame",
  // browserLocation: "/:path",
  title: "Frog Frame",
});

app.frame("/", async (c) => {
  return c.res({
    image: <div>Home</div>,
  });
});
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
        <div style="display:flex;flex-direction:column;color:white;font-size:60px;padding:20px;background:black;width:100%;height:100%;">
          Unable to fetch the space
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
      <div style="display:flex;flex-direction:column;color:white;font-size:60px;padding:20px;background:black;width:100%;height:100%;">
        <div style="margin-bottom:20px;">{name}</div>
        <div style="margin-bottom:20px;">{bio}</div>
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

export const GET = handle(app);
export const POST = handle(app);
