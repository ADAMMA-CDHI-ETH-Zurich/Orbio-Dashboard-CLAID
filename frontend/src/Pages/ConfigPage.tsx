import { AbsoluteCenter, Button, Stack, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import Config from "./user/Config";

/**
 * @returns Page with configuration files and instructions for new users. References
 * the instruction PDF in the /public folder.
 */
const ConfigPage = () => {
  const navigate = useNavigate();

  return (
    <AbsoluteCenter>
      <Stack>
        <Config />
        <Text mt="2em">Once everything has been set up, click "Done."</Text>
        <Button mt="1em" variant="surface" onClick={() => navigate("/user/about")}>Done</Button>
      </Stack>
    </AbsoluteCenter>
  )
}

export default ConfigPage;