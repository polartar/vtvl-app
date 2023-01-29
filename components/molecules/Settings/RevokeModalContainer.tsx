import BackButton from '@components/atoms/BackButton/BackButton';
import Button from '@components/atoms/Button/Button';
import React from 'react';

interface IRevokeModalContainer {
  memberName: string | undefined;
  hideModal: () => void;
  disableMember: () => void;
}

const RevokeModalContainer: React.FC<IRevokeModalContainer> = ({ memberName, hideModal, disableMember }) => {
  return (
    <div className="max-w-[560px] w-full p-6 rounded-3xl border border-neutral-300 bg-white text-center">
      <h1 className="mt-4 text-2xl font-semibold text-gray-800 leading-[1.7]">{`Revoke ${memberName}'s Account`}</h1>
      <h2 className="w-full text-[#344054]">Are you sure want to revoke this user?</h2>
      <h2 className="w-full text-sm text-[#344054]">You can't under this action</h2>

      <div className="w-full h-[1px] mt-5 bg-neutral-200" />
      <div className="mt-8 w-full flex justify-between">
        <BackButton label="Back" onClick={hideModal} />

        <Button type="submit" className="danger" onClick={disableMember}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default RevokeModalContainer;
