import React, { useCallback, useEffect, useMemo, useState } from 'react';

const ModalContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 50
    }}>
    {children}
  </div>
);

const ModalBackDrop = ({ children, onClick }: any) => (
  <div
    onClick={onClick}
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      zIndex: -1
    }}>
    {children}
  </div>
);

export const useModal = ({
  type = '',
  closeDisabled = false,
  closeCallback
}: {
  type?: string;
  closeDisabled?: boolean;
  closeCallback?: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const showModal = useCallback(() => setOpen(true), []);
  const hideModal = useCallback(() => {
    setOpen(false);
    if (closeCallback) {
      closeCallback();
    }
  }, []);

  const ModalWrapper: React.FC<{ children: React.ReactNode }> = useMemo(
    () =>
      ({ children }) => {
        return open ? (
          <ModalContainer>
            <ModalBackDrop
              onClick={() => {
                if (type !== 'no-click' && !closeDisabled) {
                  hideModal();
                }
              }}
            />
            {type === 'no-click' && !closeDisabled ? (
              <div style={{ position: 'relative' }}>
                <div
                  onClick={() => {
                    hideModal();
                  }}
                  style={{
                    position: 'absolute',
                    top: -36,
                    right: '10px',
                    color: 'white',
                    display: 'flex',
                    cursor: 'pointer'
                  }}>
                  <div className="sm:hidden" style={{ marginRight: '4px' }}>
                    Close
                  </div>
                  <div>&#x2715;</div>
                </div>
                {children}
              </div>
            ) : (
              <div style={{ position: 'relative' }}>{children}</div>
            )}
          </ModalContainer>
        ) : null;
      },
    [open, hideModal, type]
  );

  return { ModalWrapper, showModal, hideModal, open };
};
