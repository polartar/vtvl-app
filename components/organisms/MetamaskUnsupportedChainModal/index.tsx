import React from 'react';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';

interface IMetamaskUnsupportedChainModalProps {
  hideModal: () => void;
}

const MetamaskUnsupportedChainModal: React.FC<IMetamaskUnsupportedChainModalProps> = ({ hideModal }) => {
  return (
    <div className="p-6 rounded-3xl border border-[#d0d5dd] bg-white">
      <div className="p-2 w-full">
        <div className="px-2 py-1 bg-[#fee2e2] text-[#ef4444] text-xs rounded-8 text-center mt-2">
          We can't connect your wallet as your wallet is on unsupported chain by VTVL. <br />
          Please change your Metamask network to one of the below.
        </div>
      </div>
      <div className="mt-5 px-5 grid grid-cols-2 gap-4">
        {Object.keys(SupportedChains).map((chain) => (
          <div className="flex items-center gap-4">
            <img
              className="w-6 h-6 object-cover rounded-full"
              src={SupportedChains[+chain as SupportedChainId].icon}
              alt="VTVL"
            />
            <div className="text-sm">{SupportedChains[+chain as SupportedChainId].title}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetamaskUnsupportedChainModal;
