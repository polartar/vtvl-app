import Chip from '@components/atoms/Chip/Chip';
import Loader from '@components/atoms/Loader/Loader';
import { useAuthContext } from '@providers/auth.context';
import Lottie from 'lottie-react';
import ErrorAnimation from 'public/error-state.json';
import WarningIcon from 'public/icons/warning.svg';
import MetaMaskWalletAnimation from 'public/metamask_wallet_loader.json';
import SuccessAnimation from 'public/successfully-done.json';
import WalletConnectAnimation from 'public/walletconnect_loader.json';
import { useEffect, useState } from 'react';
import Modal, { Styles } from 'react-modal';

export type TransactionStatuses = '' | 'PENDING' | 'IN_PROGRESS' | 'SUCCESS' | 'ERROR' | 'REVOKE_SUCCESS' | 'REJECTED';
export interface TransactionModalProps {
  status: TransactionStatuses;
  isCloseAvailable: boolean;
}

const TransactionModal = ({ status, isCloseAvailable }: TransactionModalProps) => {
  const { connection } = useAuthContext();
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

  const getLoaderAnimatedIcon = () => {
    if (connection && connection === 'walletconnect') {
      return WalletConnectAnimation;
    } else {
      return MetaMaskWalletAnimation;
    }
  };

  const txTypes = {
    IN_PROGRESS: {
      image: <Lottie animationData={getLoaderAnimatedIcon()} style={{ width: '132px' }} />,
      title: (
        <div className="flex flex-row items-center gap-2">
          <img src="/images/tx-inprogress.png" className="w-7 h-7" />
          Hang on, we're almost there!
        </div>
      ),
      description: <>Your transaction is in progress. Just a few more seconds...</>
    },
    PENDING: {
      image: <Lottie animationData={getLoaderAnimatedIcon()} style={{ width: '132px' }} />,
      title: (
        <div className="flex flex-row items-center gap-2">
          <img src="/images/tx-pending.png" className="w-7 h-7" />A wallet transaction is in progress
        </div>
      ),
      description: (
        <>
          Please confirm the transaction in your wallet.
          <br />
          This should only take a few seconds...unless it's on Ethereum
        </>
      )
    },
    SUCCESS: {
      image: <Lottie animationData={SuccessAnimation} style={{ width: '106px' }} />,
      title: (
        <div className="flex flex-row items-center gap-2">
          <img src="/images/tx-success.png" className="w-7 h-7" />
          Woo hoo! Transaction was successful
        </div>
      ),
      description: <>Well done! Now we can go further. Phew!</>
    },
    ERROR: {
      image: <Lottie animationData={ErrorAnimation} style={{ width: '106px' }} />,
      title: (
        <div className="flex flex-row items-center gap-2">
          <img src="/images/tx-failed.png" className="w-7 h-7" />
          Oh no! Transaction was unsuccessful
        </div>
      ),
      description: <>No worries! Just try again later.</>
    },
    REVOKE_SUCCESS: {
      image: <Lottie animationData={SuccessAnimation} style={{ width: '106px' }} />,
      title: (
        <div className="flex justify-center flex-row items-center gap-2 text-center">
          <img src="/images/tx-success.png" className="w-7 h-7" />
          Woo hoo! Transaction was successful
        </div>
      ),
      description: (
        <>
          You can now transfer the remaining locked tokens from the revoked schedule to your projects' wallet by
          selecting the vesting contract in the <b>Contracts tab.</b>
        </>
      )
    },
    REJECTED: {
      image: <Lottie animationData={ErrorAnimation} style={{ width: '106px' }} />,
      title: (
        <div className="flex flex-row items-center gap-2">
          <img src="/images/tx-failed.png" className="w-7 h-7" />
          You have rejected the transaction
        </div>
      ),
      description: <>No worries! Just try again later.</>
    }
  };

  const [progress, setProgress] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  // 100% / (3 seconds / 100 ms) = amount of progress per tick
  const progressAdditionBasedOnSeconds = 100 / ((3 * 1000) / 100);

  useEffect(() => {
    if (status === 'SUCCESS' || status === 'ERROR' || status === 'REVOKE_SUCCESS') {
      setProgress(1);
      setIsOpen(true);
    } else if (status) {
      setIsOpen(true);
    }
  }, [status]);

  useEffect(() => {
    if (progress && progress < 100) {
      setTimeout(() => {
        setProgress((t) => t + progressAdditionBasedOnSeconds);
      }, 100);
    } else {
      setProgress(0);
    }
  }, [progress]);

  return (
    <>
      {status ? (
        <Modal isOpen={isOpen} style={modalStyles}>
          {status === 'SUCCESS' || status === 'ERROR' || status === 'REVOKE_SUCCESS' ? (
            <Loader progress={progress} onComplete={() => setIsOpen(false)} />
          ) : null}
          {txTypes[status].image}
          <h2 className="sora font-semibold text-3xl text-neutral-900 mt-12">{txTypes[status].title}</h2>
          <p className="mt-4 font-medium text-sm text-neutral-500 text-center">{txTypes[status].description}</p>
          {isCloseAvailable ? (
            <>
              {status === 'IN_PROGRESS' && (
                <button
                  type="button"
                  className="primary flex flex-row gap-2 items-center mt-4"
                  onClick={() => setIsOpen(false)}>
                  Close
                </button>
              )}
            </>
          ) : (
            <>
              {' '}
              {status !== 'SUCCESS' && status !== 'REVOKE_SUCCESS' && status !== 'ERROR' && (
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
            </>
          )}
        </Modal>
      ) : null}
    </>
  );
};

export default TransactionModal;
