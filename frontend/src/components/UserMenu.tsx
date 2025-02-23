import Menu from '../components/Menu';

/**
 * 
 * @returns Menu with links for User pages
 */
export default function UserMenu() {
  return <Menu links={new Map([
    ["My Data", "/user"], 
    ["My Studies", "/user/studies"], 
    ["Configuration", "/user/config"],
    ["Settings", "/user/settings"],
    ["About", "/user/about"],
  ])} />;
}
