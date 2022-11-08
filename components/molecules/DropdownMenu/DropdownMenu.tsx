import { Menu, MenuItem } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/slide.css';
import DotsIcon from 'public/icons/dots-vertical.svg';

interface DropdownMenuItem {
  label: string;
  onClick?: () => void;
}
interface DropdownMenuProps {
  items: DropdownMenuItem[];
}

const DropdownMenu = ({ items = [] }: DropdownMenuProps) => {
  return (
    <Menu
      menuButton={
        <div className="w-5 h-5 cursor-pointer">
          <DotsIcon className="w-full h-full" />
        </div>
      }
      transition>
      {items.map((item, itemIndex) => (
        <MenuItem key={`menu-item-${itemIndex}`} onClick={item.onClick}>
          {item.label}
        </MenuItem>
      ))}
    </Menu>
  );
};
export default DropdownMenu;
