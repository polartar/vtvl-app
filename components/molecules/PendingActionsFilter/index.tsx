import Image from 'next/image';
import React from 'react';

interface IPendingActionsFilterProps {
  filter: {
    keyword: string;
    status: 'ALL' | 'FUND' | 'DEPLOY_VESTING_CONTRACT' | 'TRANSFER_OWNERSHIP' | 'APPROVE' | 'EXECUTE';
  };
  updateFilter: (v: {
    keyword: string;
    status: 'ALL' | 'FUND' | 'DEPLOY_VESTING_CONTRACT' | 'TRANSFER_OWNERSHIP' | 'APPROVE' | 'EXECUTE';
  }) => void;
}

const PendingActionsFilter: React.FC<IPendingActionsFilterProps> = ({ filter, updateFilter }) => {
  return (
    <div className="w-full">
      <div className="mt-5 w-full">
        <div className="inline-flex border border-[#d0d5dd] rounded-lg overflow-hidden">
          <div
            className={`px-4 py-3 bg-white border-r border-[#d0d5dd] text-sm text-[#1d2939] cursor-pointer hover:bg-[#eaeaea] ${
              filter.status === 'ALL' ? 'bg-[#eaeaea]' : ''
            }`}
            onClick={() => {
              updateFilter({
                ...filter,
                status: 'ALL'
              });
            }}>
            All
          </div>
          <div
            className={`px-4 py-3 bg-white border-r border-[#d0d5dd] text-sm text-[#1d2939] cursor-pointer hover:bg-[#eaeaea] ${
              filter.status === 'FUND' ? 'bg-[#eaeaea]' : ''
            }`}
            onClick={() => {
              updateFilter({
                ...filter,
                status: 'FUND'
              });
            }}>
            Fund
          </div>
          <div
            className={`px-4 py-3 bg-white border-r border-[#d0d5dd] text-sm text-[#1d2939] cursor-pointer hover:bg-[#eaeaea] ${
              filter.status === 'DEPLOY_VESTING_CONTRACT' ? 'bg-[#eaeaea]' : ''
            }`}
            onClick={() => {
              updateFilter({
                ...filter,
                status: 'DEPLOY_VESTING_CONTRACT'
              });
            }}>
            Deploy Vesting Contract
          </div>
          <div
            className={`px-4 py-3 bg-white border-r border-[#d0d5dd] text-sm text-[#1d2939] cursor-pointer hover:bg-[#eaeaea] ${
              filter.status === 'TRANSFER_OWNERSHIP' ? 'bg-[#eaeaea]' : ''
            }`}
            onClick={() => {
              updateFilter({
                ...filter,
                status: 'TRANSFER_OWNERSHIP'
              });
            }}>
            Transfer Ownership
          </div>
          <div
            className={`px-4 py-3 bg-white border-r border-[#d0d5dd] text-sm text-[#1d2939] cursor-pointer hover:bg-[#eaeaea] ${
              filter.status === 'APPROVE' ? 'bg-[#eaeaea]' : ''
            }`}
            onClick={() => {
              updateFilter({
                ...filter,
                status: 'APPROVE'
              });
            }}>
            Approve
          </div>
          <div
            className={`px-4 py-3 bg-white border-[#d0d5dd] text-sm text-[#1d2939] cursor-pointer hover:bg-[#eaeaea] ${
              filter.status === 'EXECUTE' ? 'bg-[#eaeaea]' : ''
            }`}
            onClick={() => {
              updateFilter({
                ...filter,
                status: 'EXECUTE'
              });
            }}>
            Execute
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingActionsFilter;
