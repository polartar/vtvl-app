import { useAuthContext } from '@providers/auth.context';
import { useGlobalContext } from '@providers/global.context';
import { useWeb3React } from '@web3-react/core';
import { injected, walletconnect } from 'connectors';
import { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
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
  const { activate, account, active } = useWeb3React();
  const { setConnection, connection } = useAuthContext();
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
      subLabel: isMobile ? 'Soon' : '',
      disabled: isMobile
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

  useEffect(() => {
    if (active && account) {
      onConnect();
    } else if (isMobile && connection === 'metamask') {
      // Redirect the user to the metamask deeplink if user tried to activate the metamask prompt
      // is on mobile and did not actually show the prompt -- because of no extension on mobile browser.
      window.location.href = `https://metamask.app.link/dapp/${window.location.host}`;
    }
  }, [active, account, connection]);

  return (
    <>
      <div className="text-center">
        <h1 className="font-medium">Connect your wallet</h1>
        <p className="text-sm text-neutral-500 mb-3">Please select a wallet to connect to this app</p>
        <div className="max-w-sm mx-auto">
          <Wallets wallets={wallets} />
        </div>
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
