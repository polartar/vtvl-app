import BackButton from '@components/atoms/BackButton/BackButton';
import Button from '@components/atoms/Button/Button';
import React from 'react';

interface IResendModalContainer {
  hideModal: () => void;
  resendInvite: () => void;
}

const ResendModalContainer: React.FC<IResendModalContainer> = ({ hideModal, resendInvite }) => {
  return (
    <div className="max-w-[560px] w-full p-6 rounded-3xl border border-neutral-300 bg-white text-center">
      <h1 className="mt-4 text-2xl font-semibold text-gray-800 leading-[1.7]">Resend Invitation</h1>
      <h2 className="w-full text-base text-[#667085]">Are you sure want to resend this invitation?</h2>

      <div className="w-full h-[1px] mt-5 bg-neutral-200" />
      <div className="mt-8 w-full flex justify-between">
        <BackButton label="Back" onClick={hideModal} />

        <Button type="submit" className="danger" onClick={resendInvite}>
          Resend
        </Button>
      </div>
    </div>
  );
};

export default ResendModalContainer;
