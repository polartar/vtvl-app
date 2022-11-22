import Chip from '@components/atoms/Chip/Chip';
import WarningIcon from 'public/icons/warning.svg';
import Modal, { Styles } from 'react-modal';

export type TransactionStatuses = '' | 'PENDING' | 'IN_PROGRESS' | 'SUCCESS';
export interface TransactionModalProps {
  status: TransactionStatuses;
}

const TransactionModal = ({ status }: TransactionModalProps) => {
  // Make Modal styles scrollable when exceeding the device view height
  const modalStyles: Styles = {
    overlay: {
      position: 'fixed',
      display: 'flex',
      justifyContent: 'center',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(255,255,255,0.9)',
      zIndex: '1000'
    },
    content: {
      position: 'absolute',
      borderRadius: '1.5rem',
      border: 'none',
      background: 'none',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }
  };

  const txTypes = {
    IN_PROGRESS: {
      image: '/images/wallet-transaction.png',
      title: <>Hang on, we're almost there!</>,
      description: <>Your transaction is in progress. Just a few more seconds...</>
    },
    PENDING: {
      image: '/images/wallet-transaction.png',
      title: <>Whoops! A wallet transaction is in progress</>,
      description: (
        <>
          Please confirm the transaction in your wallet.
          <br />
          This should only take a few seconds...unless it's on Ethereum
        </>
      )
    },
    SUCCESS: {
      image: '/images/success-animation.gif',
      title: <>Woo hoo! Transaction was successful</>,
      description: <>Well done! Now we can go further. Phew!</>
    }
  };

  return (
    <>
      {status && (
        <Modal isOpen={true} style={modalStyles}>
          <img src={txTypes[status].image} className="h-32 opacity-90" />
          <h2 className="sora font-semibold text-3xl text-neutral-900 mt-12">{txTypes[status].title}</h2>
          <p className="mt-4 font-medium text-sm text-neutral-500 text-center">{txTypes[status].description}</p>
          {status !== 'SUCCESS' && (
            <Chip
              label={
                <div className="flex flex-row items-center gap-2">
                  <WarningIcon className="w-4 h-4" />
                  Please do not refresh the page
                </div>
              }
              color="warningAlt"
              rounded
              className="mt-8"
            />
          )}
        </Modal>
      )}
    </>
  );
};

export default TransactionModal;
