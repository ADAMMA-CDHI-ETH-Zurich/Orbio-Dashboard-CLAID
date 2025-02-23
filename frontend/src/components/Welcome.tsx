import { Highlight, Icon, Stack, Text } from "@chakra-ui/react";
import { Orbio } from "../icons";

/**
 * 
 * @returns Orbio's "Welcome to Orbio" banner shown on Welcome screens
 */
export default function Welcome() {
  return (<>

        <Stack textAlign="center" margin="0" direction={{base: "column", lg: "row"}} gap="3" my="8">
          <Icon margin="auto" fontSize={{base: "5xl", lg: "7xl"}} mt="3">
            <Orbio />
          </Icon>
          <Text mx="1em" fontWeight="light" fontSize={{base: "5xl", lg: "7xl"}} lineHeight="shorter">
            <Highlight query="Orbio" styles={{ fontWeight: "semibold", position: "relative" }}>
              Welcome to Orbio
            </Highlight>
          </Text>
        </Stack>

  </>);
}