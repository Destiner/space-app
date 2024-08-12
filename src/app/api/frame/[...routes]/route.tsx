/** @jsxImportSource frog/jsx */
import { Button, Frog, TextInput } from "frog";
import { handle } from "frog/next";

const app = new Frog({
  basePath: "/api/frame",
  title: "Frog Frame",
});

export const runtime = "edge";

app.frame("/space", (c) => {
  const { buttonValue, status } = c;
  return c.res({
    image: (
      <div style={{ color: "white", display: "flex", fontSize: 60 }}>
        {status === "initial"
          ? "Select your fruit!"
          : `Selected: ${buttonValue}`}
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
