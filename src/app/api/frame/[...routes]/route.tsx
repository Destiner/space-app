/** @jsxImportSource frog/jsx */
import { Button, Frog } from "frog";
import { handle } from "frog/next";
import { createSystem } from "frog/ui";

const { Box, Heading, Text, VStack } = createSystem();

const app = new Frog({
  basePath: "/api/frame",
  title: "Frog Frame",
});

export const runtime = "edge";

app.frame("/space", (c) => {
  const { buttonValue, status } = c;
  return c.res({
    image: (
      <Box
        grow
        alignVertical="center"
        backgroundColor="background"
        padding="32"
      >
        <VStack gap="4">
          <Heading>FrogUI 🐸</Heading>
          <Text color="text200" size="20">
            Build consistent frame experiences
          </Text>
          <Text color="text400" size="20">
            with Frog.
          </Text>
        </VStack>
      </Box>
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
