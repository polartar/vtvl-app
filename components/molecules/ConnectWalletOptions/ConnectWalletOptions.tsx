import { useAuthContext } from '@providers/auth.context';
import { useGlobalContext } from '@providers/global.context';
import { useWeb3React } from '@web3-react/core';
import { injected, walletconnect } from 'connectors';
import { useState } from 'react';
import Modal, { Styles } from 'react-modal';

import Consent from '../Consent/Consent';
import Wallets from '../Wallets/Wallets';

interface ConnectWalletOptionsProps {
  onConnect?: () => void;
}

/**
 * Displays a list of connectable wallets as buttons
 * Clicking a wallet button will then activate that particular connect function
 */

const ConnectWalletOptions = ({ onConnect = () => {} }: ConnectWalletOptionsProps) => {
  // Use web3 react to activate the connection
  const { activate } = useWeb3React();
  const { setConnection } = useAuthContext();
  const {
    website: { features }
  } = useGlobalContext();
  // Stores the state of the ledger modal
  const [ledgerModalShow, setLedgerModalShow] = useState(false);

  // Modal styles for the ledger modal
  const modalStyles: Styles = {
    overlay: {
      position: 'fixed',
      display: 'flex',
      justifyContent: 'center',
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
      position: 'absolute',
      filter: 'drop-shadow(0 20px 13px rgb(0 0 0 / 0.03)) drop-shadow(0 8px 5px rgb(0 0 0 / 0.08))',
      borderRadius: '1.5rem'
    }
  };

  // Function to activate the metamask connection
  async function metamaskActivate() {
    try {
      await activate(injected);
      // Trigger the onConnect function when the connection is established
      setConnection('metamask');
      onConnect();
    } catch (error) {
      console.log('connection error ', error);
    }
  }

  // Function to activate the walletconnect connection
  async function walletConnectActivate() {
    try {
      await activate(walletconnect, (error) => {}, true);
      // Trigger the onConnect function when the connection is established
      setConnection('walletconnect');
      onConnect();
    } catch (error) {
      console.log('connection error ', error);
    }
  }

  // List of all the wallets that are usable to the whole app
  // disabled ones with the subLabel of 'soon' are currently unsupported
  const wallets = [
    {
      name: 'MetaMask',
      image: '/icons/wallets/metamask.svg',
      onClick: metamaskActivate
    },
    {
      name: 'Wallet Connect',
      image: '/icons/wallets/walletconnect.svg',
      onClick: walletConnectActivate,
      disabled: false
    },
    {
      name: 'Trezor',
      image: '/icons/wallets/trezor.png',
      // subLabel: 'Soon',
      onClick: metamaskActivate
      // disabled: true
    },
    {
      name: 'Coinbase Wallet',
      image: '/icons/wallets/coinbase.png',
      subLabel: 'Soon',
      disabled: true
    },
    {
      name: 'Ledger Connect',
      image: '/icons/wallets/ledger.png',
      // need to add an onClick handler here
      onClick: () => setLedgerModalShow(true),
      subLabel: 'Soon',
      disabled: true
    },
    {
      name: 'Ledger Connect',
      image: '/icons/wallets/ledger.png',
      // need to add an onClick handler here
      onClick: () => setLedgerModalShow(true),
      subLabel: 'Soon',
      disabled: true
    }
  ];

  return (
    <>
      <div className="text-center">
        <h1 className="font-medium">Connect your wallet</h1>
        <p className="text-sm text-neutral-500 mb-3">Please select a wallet to connect to this app</p>
        <div className="max-w-sm mx-auto">
          <Wallets wallets={wallets} />
        </div>
        {!features?.auth?.memberOnly && (
          <div className="mt-7 mb-4 text-xs text-neutral-600 font-medium flex flex-row items-center justify-center gap-10">
            <a className="font-bold text-primary-900 no-underline" href="#" onClick={() => {}}>
              What is Wallet?
            </a>
            <div>
              <span>Can&apos;t find your wallet?</span>&nbsp;
              <a className="font-bold text-primary-900 no-underline" href="#" onClick={() => {}}>
                Suggest Wallet
              </a>
            </div>
          </div>
        )}
        <Consent className="mt-6" />
      </div>
      <Modal isOpen={ledgerModalShow} style={modalStyles}>
        Instructions goes here
        <button type="button" onClick={() => setLedgerModalShow(false)}>
          Close
        </button>
      </Modal>
    </>
  );
};

export default ConnectWalletOptions;
