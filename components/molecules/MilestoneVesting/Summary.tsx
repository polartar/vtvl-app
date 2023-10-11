import { Typography } from '@components/atoms/Typography/Typography';
import { useAuthContext } from '@providers/auth.context';
import { useDashboardContext } from '@providers/dashboard.context';
import { useTokenContext } from '@providers/token.context';
import { useVestingContext } from '@providers/vesting.context';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { isAddress } from 'hooks/web3';
import { useEffect } from 'react';
import { EMilestoneType, IMilestoneForm } from 'types/milestone';
import { QUERY_KEYS } from 'utils/queries';
import { formatNumber } from 'utils/token';
import { validateEmail } from 'utils/validator';
import { truncateAddress } from 'utils/web3';

const MilestoneSummary = ({ form }: { form: IMilestoneForm }) => {
  const { scheduleState } = useVestingContext();
  const { mintFormState } = useTokenContext();
  const allocation = form.allocation?.toString().split(',').join('');
  const { currentSafe } = useAuthContext();
  const getPercent = (percent: string | number) => {
    if (typeof percent === 'number') return percent;
    return +percent.split('%')[0];
  };

  const totalPercent = form.milestones.reduce((total, milestone) => total + getPercent(milestone.allocation), 0);

  useEffect(() => {
    window.addEventListener('scroll', checkBoxPosition);

    return () => {
      window.removeEventListener('scroll', checkBoxPosition);
    };
  });

  const { data: priceData } = useQuery<{ message: string; price: number }>(
    [QUERY_KEYS.USD_PRICE, mintFormState.symbol],
    () => axios.get(`/api/coinmarketcap/getPrice?currency=USD&symbol=${mintFormState.symbol}`).then((res) => res.data)
  );

  const checkBoxPosition = () => {
    const summaryParent = document.getElementById('summary-parent');
    const box = document.querySelector('.box');
    if (summaryParent && box) {
      const rect = summaryParent.getBoundingClientRect();
      if (rect.top < 0) {
        if (!box.classList.contains('fixed')) box.classList.add('fixed');
      } else {
        if (box.classList.contains('fixed')) box.classList.remove('fixed');
      }
    }
  };

  return (
    <div className="box w-full max-w-md panel items-center h-max  ">
      {/* <div>
        <Typography className="font-semibold" size="subtitle">
          Schedule summary
        </Typography>
      </div>

      <div className="mt-6 flex ">
        <div className="w-48">
          <div className="flex">
            <img src={'/icons/vesting-contract.svg'} alt="token-image" width={18} height={18} />
            <span className="ml-2 text-gray-500  font-semibold">Contract</span>
          </div>
          <div className=" text-xl">{scheduleState.contractName}</div>
        </div>

        {currentSafe && currentSafe.address ? (
          <div>
            <label className="text-sm text-neutral-600 flex flex-row items-center gap-2 mb-2.5">
              <img src="/icons/safe.png" className="w-4" />
              Safe
            </label>
            <p className="text-neutral-900">{currentSafe.org_name}</p>
          </div>
        ) : null}
      </div> */}

      {/* <div className="mt-6"> */}
      {/* <span className="text-gray-500  font-semibold">Recipient</span> */}
      {/* <div className="border border-gray-200 p-2 rounded-md"> */}
      <div>
        <div className="flex justify-between items-center">
          <Typography className="font-semibold" size="subtitle">
            {form.recipientName}
          </Typography>

          {form.recipientAddress && isAddress(form.recipientAddress) && (
            <span className="flex justify-center items-center rounded text-sm bg-gray-200 text-gray-500 h-5 p-1 ">
              {truncateAddress(form.recipientAddress)}
            </span>
          )}
        </div>
        {validateEmail(form.recipientEmail).validated && (
          <div>
            <span className="text-sm text-gray-400">{form.recipientEmail}</span>
          </div>
        )}
      </div>
      {/* </div> */}
      {form.milestones.length > 0 && (
        <div className="border rounded-lg border-gray-200 mt-6 ">
          <table className="   w-full     ">
            <tbody className="border-none">
              <tr className="  ">
                <td className="border-none"></td>
                {form.type === EMilestoneType.VESTED && (
                  <>
                    <td className="text-gray-400 text-right pr-6 border-none">Duration</td>
                    <td className="text-gray-400 text-right pr-6 border-none">Release</td>
                  </>
                )}
                <td className="text-gray-400 text-right pr-6 border-none">Allocation</td>
              </tr>
              {form.milestones.map((milestone, index) => {
                return (
                  <tr key={`${milestone.title}_${index}`} className=" border-t   border-gray-200">
                    <td className="border-none">
                      <div className="flex">
                        <img src="/icons/flag.png" alt="flag" width={18} height={19.6} />
                        <span className="text-base   ml-2 text-gray-600 font-semibold">{milestone.title}</span>
                      </div>
                    </td>
                    {form.type === EMilestoneType.VESTED && (
                      <>
                        <td className="border-none">
                          <div>
                            <span className="text-base">{milestone.duration.value}</span>
                            <span className="text-base text-gray-300 ml-2">
                              {milestone.duration.type}
                              {milestone.duration.value > 1 && 's'}
                            </span>
                          </div>
                        </td>
                        <td className="border-none">
                          <div className="p-2 bg-primary-500 text-white rounded-md">{milestone.releaseFreq}</div>
                        </td>
                      </>
                    )}
                    <td className="border-none">
                      <div className="flex flex-col items-end">
                        <span className="text-base">
                          {formatNumber((getPercent(milestone.allocation) * +allocation) / 100)}
                        </span>
                        <span className=" text-xs text-gray-300">{milestone.allocation}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              <tr className=" bg-gray-50 font-semibold text-gray-700  rounded-lg">
                <td className="border-none text-lg  rounded-bl-lg">Total</td>
                {form.type === EMilestoneType.VESTED && (
                  <>
                    <td className="border-none text-lg  "></td>
                    <td className="border-none text-lg  "></td>
                  </>
                )}
                <td className="border-none text-right text-base rounded-br-lg">
                  <span>{totalPercent}</span>
                  <span className="ml-2 text-gray-200">%</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="flex mt-10">
        <div className="flex items-center">
          <div className="bg-gray-100 p-2 rounded-xl">
            <img src="/icons/chip.png" alt="chip" width={24} height={24} />
          </div>
          <div className=" ml-3 flex flex-col">
            <span className="font-bold">{formatNumber(+allocation)}</span>
            <span className="text-gray-300">Tokens</span>
          </div>
        </div>

        <div className="ml-8 flex items-center">
          <div className="bg-gray-100 p-2 rounded-xl">
            <img src="/icons/dollar.png" alt="dollar" width={24} height={24} />
          </div>
          <div className="flex flex-col ml-3">
            {priceData ? (
              <span className="font-bold">${formatNumber(+allocation * priceData.price)}</span>
            ) : (
              <span className="font-bold">....</span>
            )}

            <span className="text-gray-300">USD</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilestoneSummary;
