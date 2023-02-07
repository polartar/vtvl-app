import Image from 'next/image';
import React from 'react';

interface IVestingScheduleFilterProps {
  filter: {
    keyword: string;
    status: 'ALL' | 'FUND' | 'INITIALIZED' | 'LIVE' | 'PENDING';
  };
  updateFilter: (v: { keyword: string; status: 'ALL' | 'FUND' | 'INITIALIZED' | 'LIVE' | 'PENDING' }) => void;
}

const VestingScheduleFilter: React.FC<IVestingScheduleFilterProps> = ({ filter, updateFilter }) => {
  return (
    <div className="w-full">
      <div className="w-full flex items-center gap-4">
        <div className="flex-grow flex items-center gap-2 px-5 py-2 bg-white border border-gray-100 rounded-lg">
          <div className="w-5 h-5 relative">
            <Image src="/icons/search.svg" layout="fill" />
          </div>
          <input
            className="w-full outline-none bg-transparent"
            placeholder="Search"
            value={filter.keyword}
            onChange={(e) => updateFilter({ ...filter, keyword: e.target.value })}
          />
        </div>
      </div>
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
              filter.status === 'INITIALIZED' ? 'bg-[#eaeaea]' : ''
            }`}
            onClick={() => {
              updateFilter({
                ...filter,
                status: 'INITIALIZED'
              });
            }}>
            Initialized
          </div>
          <div
            className={`px-4 py-3 bg-white border-r border-[#d0d5dd] text-sm text-[#1d2939] cursor-pointer hover:bg-[#eaeaea] ${
              filter.status === 'LIVE' ? 'bg-[#eaeaea]' : ''
            }`}
            onClick={() => {
              updateFilter({
                ...filter,
                status: 'LIVE'
              });
            }}>
            Live
          </div>
          <div
            className={`px-4 py-3 bg-white border-[#d0d5dd] text-sm text-[#1d2939] cursor-pointer hover:bg-[#eaeaea] ${
              filter.status === 'PENDING' ? 'bg-[#eaeaea]' : ''
            }`}
            onClick={() => {
              updateFilter({
                ...filter,
                status: 'PENDING'
              });
            }}>
            Pending
          </div>
        </div>
      </div>
    </div>
  );
};

export default VestingScheduleFilter;
