import { animated, useSpring } from '@react-spring/web';
import { useCallback, useMemo, useState } from 'react';

interface IDrawerProps {
  disableClose?: boolean;
  position?: 'left' | 'right';
  onClose?: () => void;
  title?: JSX.Element | String;
}

export const useDrawer = ({
  disableClose = false,
  position = 'right',
  onClose = () => {},
  title = ''
}: IDrawerProps) => {
  const [open, setOpen] = useState(false);
  const showDrawer = useCallback(() => setOpen(true), []);
  const hideDrawer = useCallback(() => {
    setOpen(false);
    if (onClose) {
      onClose();
    }
  }, []);

  const Drawer: React.FC<{ children: React.ReactNode }> = useMemo(
    () =>
      ({ children }) => {
        console.log('INNER WIDTH', window.innerWidth, open);
        const props = useSpring({
          from: { x: open ? 430 : 0 },
          to: { x: open ? 0 : 430 }
        });
        return (
          <animated.div
            style={props}
            className="fixed w-[430px] h-screen max-w-md top-0 bottom-0 bg-white shadow-xl right-0 block z-30 pt-20">
            <div className="vtvl-scroll h-full">
              {title ? <div>{title}</div> : null}
              <div>{children}</div>
            </div>
          </animated.div>
        );
      },
    [open, hideDrawer, position, disableClose]
  );

  return { open, showDrawer, hideDrawer, Drawer };
};
