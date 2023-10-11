import Modal, { Styles } from 'react-modal';

interface PromptModalProps extends React.BaseHTMLAttributes<HTMLDivElement> {
  isOpen?: boolean;
  size?: 'small' | 'default' | 'large';
  hideModal: () => void;
}

const PromptModal = ({ isOpen = false, hideModal, size = 'default', ...props }: PromptModalProps) => {
  // Make Modal styles scrollable when exceeding the device view height
  const modalStyles: Styles = {
    overlay: {
      position: 'fixed',
      display: 'flex',
      justifyContent: 'center',
      alignItems: size === 'small' ? 'center' : 'flex-start',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.3)',
      zIndex: '900',
      overflowY: 'auto',
      paddingTop: '3rem',
      paddingBottom: '3rem'
    },
    content: {
      backgroundColor: '#fff',
      // position: 'absolute',
      // top: '50%',
      // left: '50%',
      // transform: 'translate(-50%, -50%)',
      filter: 'drop-shadow(0 20px 13px rgb(0 0 0 / 0.03)) drop-shadow(0 8px 5px rgb(0 0 0 / 0.08))',
      borderRadius: '1.5rem'
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        className={`z-50 ${size === 'default' ? 'max-w-2xl w-full' : ''}`}
        style={modalStyles}
        shouldCloseOnEsc={true}>
        <>{props.children}</>
      </Modal>
    </>
  );
};

export default PromptModal;
