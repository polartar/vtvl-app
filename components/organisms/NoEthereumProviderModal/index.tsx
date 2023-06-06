import React from 'react';

interface INoEthereumProviderModalProps {
  hideModal: () => void;
}

const NoEthereumProviderModal: React.FC<INoEthereumProviderModalProps> = ({ hideModal }) => {
  return (
    <div className="p-6 rounded-3xl border border-[#d0d5dd] bg-white">
      <div className="p-2 w-full">
        <div className="px-2 py-1 bg-[#fee2e2] text-[#ef4444] text-xs rounded-8 text-center mt-2">
          We can't detect any Ethereum provider.
        </div>
      </div>
    </div>
  );
};

export default NoEthereumProviderModal;
