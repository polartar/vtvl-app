import BackButton from '@components/atoms/BackButton/BackButton';
import Button from '@components/atoms/Button/Button';
import React from 'react';

interface IRevokeModalContainer {
  memberName: string | undefined;
  isDisable: boolean;
  hideModal: () => void;
  disableMember: () => void;
}

const RevokeModalContainer: React.FC<IRevokeModalContainer> = ({ memberName, isDisable, hideModal, disableMember }) => {
  return (
    <div className="max-w-[560px] w-full p-6 rounded-3xl border border-neutral-300 bg-white text-center">
      <h1 className="mt-4 text-2xl font-semibold text-gray-800 leading-[1.7]">
        {isDisable ? `Revoke ${memberName}'s account` : 'Cancel Invitation'}
      </h1>
      <h2 className="w-full text-base text-[#667085]">
        {isDisable ? 'Are you sure want to revoke this user?' : 'Are you sure want to cancel this invitation?'}
      </h2>
      {isDisable && <h2 className="w-full text-sm text-[#667085]">You can't under this action</h2>}

      <div className="w-full h-[1px] mt-5 bg-neutral-200" />
      <div className="mt-8 w-full flex justify-between">
        <BackButton label="Back" onClick={hideModal} />

        <Button type="submit" className="danger" onClick={disableMember}>
          {`${isDisable ? 'Disable' : 'Cancel'}`}
        </Button>
      </div>
    </div>
  );
};

export default RevokeModalContainer;
