import Menu from '../components/Menu';

/**
 * 
 * @returns Menu with links for PI pages
 */
export default function PiMenu() {
  return <Menu links={new Map([
    ["My Studies", "/pi"], 
    ["Create Study", "/pi/create-study"],
    ["Settings", "/pi/settings"], 
    ["About", "/pi/about"]
  ])} />;
}