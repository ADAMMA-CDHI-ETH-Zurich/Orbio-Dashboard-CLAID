import { Grid, GridItem } from "@chakra-ui/react";
import { ReactNode } from "react";
import PiMenu from "../components/PiMenu";
import TopBar from "../components/TopBar";
import UserMenu from "../components/UserMenu";

/**
 * Creates a standard page layout with the menu, top bar, and main page content.
 * Note that Chakra's "md" breakpoint is when the side menu should collapse.
 * Also note that Top Bar is 64px; this is currently hardcoded in the Top Bar code.
 * @param props.userType The type of the user currently logged in. Determines which menu links to display along the side.
 * @param props.children The react node to display in the main part of the page; the page's main content.
 */
const Layout = (props: {userType: "user" | "principal_investigator", children: ReactNode}) => {
  const { userType, children } = props;

  let menu = <></>;
  if (userType === "user") {
    menu = <UserMenu />;
  } else {
    menu = <PiMenu />;
  }

  return (
    <Grid
      templateAreas={`
        "header header"
        "nav main"
        `}
      gridTemplateRows={'64px 1fr'}
      gridTemplateColumns={{base: '30px 1fr', md: '200px 1fr'}}
      h='100vh'
      gap='1'
    >
      <GridItem area={'header'}>
        <TopBar />
      </GridItem>
      <GridItem area={'nav'}>
        {menu}
      </GridItem>
      <GridItem area={'main'} p={8} maxW="1500px">
        {children}
      </GridItem>
    </Grid>
  );
}

export default Layout;