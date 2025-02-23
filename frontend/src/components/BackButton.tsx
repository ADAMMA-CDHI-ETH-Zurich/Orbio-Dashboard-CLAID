import { IconButton } from "@chakra-ui/react"
import { ArrowLeft } from "../icons"
import { useNavigate } from "react-router-dom"

/**
 * 
 * @returns Button with left arrow icon that goes back one page in history
 */
const BackButton = () => {
  const nav = useNavigate();

  return (
    <IconButton
      variant="ghost"
      onClick={() => nav(-1)}
    >
      <ArrowLeft />
      Back
    </IconButton>
  );
}

export default BackButton;