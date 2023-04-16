import Button from '@components/atoms/Button/Button';
import { ArrowLeftIcon } from '@components/atoms/Icons';
import { useTokenContext } from '@providers/token.context';
import { useWeb3React } from '@web3-react/core';
import LimitedSupplyABI from 'contracts/abi/FullPremintERC20Token.json';
import UnlimitedSupplyABI from 'contracts/abi/VariableSupplyERC20Token.json';
import { ethers } from 'ethers';
import useTokenBalance from 'hooks/useTokenBalance';
import WarningIcon from 'public/icons/warning.svg';
import React, { useEffect, useState } from 'react';
import { formatNumber } from 'utils/token';

const TokenBurnModal = () => {
  const { account, chainId, library } = useWeb3React();
  const { mintFormState } = useTokenContext();

  const [loading, setLoading] = useState(true);
  const [isEligible, setIsEligible] = useState(false);
  const [burnableAmount, setBurnableAmount] = useState(ethers.BigNumber.from(0));

  const checkEligibility = async () => {
    try {
      if (account && mintFormState.address && library) {
        setLoading(true);
        const TokenContract = new ethers.Contract(
          mintFormState.address,
          mintFormState.supplyCap === 'LIMITED' ? LimitedSupplyABI.abi : UnlimitedSupplyABI.abi,
          library.getSigner()
        );
        const isAdmin =
          mintFormState.supplyCap === 'LIMITED'
            ? (await TokenContract.deployer()) === account
            : await TokenContract.isAdmin(account);
        setIsEligible(isAdmin);
        if (isAdmin) {
          const tokenBalance = await TokenContract.balanceOf(account);
          setBurnableAmount(tokenBalance);
        }
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      console.log('checkEligibility - ', err);
    }
  };

  useEffect(() => {
    checkEligibility();
  }, [account, mintFormState.address, mintFormState.burnable, library]);

  return (
    <div className="w-[600px] px-5 mx-auto">
      <div className="w-full bg-white border border-[#d0d5dd] px-6 py-10 rounded-3xl">
        {!loading && !isEligible ? (
          <div className="flex justify-center mb-3">
            <div className="inline-flex items-center gap-2 px-2 py-1 rounded-8 bg-red-200 text-red-500 text-xs">
              <WarningIcon className="w-4 h-4 fill-current text-warning-500" />
              You are not eligible to burn {mintFormState.name} tokens.
            </div>
          </div>
        ) : null}
        <h1 className="text-[#101828] text-xl font-semibold text-center">ACME Token Supply</h1>
        <h2 className="text-[#667085] text-xl text-center mt-3">Select amount of tokens to burn</h2>
        <div className="w-full h-[1px] bg-[#eaecf0] mt-5" />
        <div className="mt-5 w-full flex items-center justify-between gap-5">
          <div className="inline-flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-[10px] h-[10px] rounded-full bg-[#fecaca]" />
              <div className="text-[#667085] text-xs">Burnable Supply</div>
            </div>
            <div className="text-[#101828] text-base font-medium">
              {burnableAmount ? formatNumber(+ethers.utils.formatUnits(burnableAmount, mintFormState.decimals)) : 0}
            </div>
          </div>
          <div className="inline-flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-[10px] h-[10px] rounded-full bg-[#fecaca]" />
              <div className="text-[#667085] text-xs">After burn supply</div>
            </div>
            <div className="text-[#101828] text-base font-medium">
              {mintFormState.initialSupply
                ? formatNumber(
                    mintFormState.initialSupply -
                      parseFloat(ethers.utils.formatUnits(burnableAmount, mintFormState.decimals))
                  )
                : 0}
            </div>
          </div>
          <div className="inline-flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-[10px] h-[10px] rounded-full bg-[#fecaca]" />
              <div className="text-[#667085] text-xs">Total Supply</div>
            </div>
            <div className="text-[#101828] text-base font-medium">
              {mintFormState.initialSupply ? formatNumber(mintFormState.initialSupply) : 0}
            </div>
          </div>
        </div>
        <div className="w-full h-[1px] bg-[#eaecf0] mt-5" />
        <div className="w-full py-4 pb-8 mt-10">
          <div className="flex rounded-xl relative">
            <div
              style={{ width: `20%`, backgroundColor: '#fecaca' }}
              className={`h-5 border-t border-b border-[#d0d5dd] absolute left-0 top-0 bottom-0 rounded-l-lg`}
            />
            <div
              style={{ width: `10%`, backgroundColor: '#ef4444' }}
              className={`h-5 rounded-l-lg border-t border-l border-b border-[#d0d5dd] absolute left-0 top-0 bottom-0`}
            />
            <div
              style={{ width: `100%`, backgroundColor: '#98a2b3' }}
              className={`h-5 rounded-lg border-t border-r border-b border-[#d0d5dd]`}
            />
            <div style={{ width: `40%` }} className="flex items-center absolute left-0 -top-5 text-xs font-medium">
              <div
                style={{
                  width: '1px',
                  height: '10px',
                  backgroundColor: '#d0d5dd'
                }}
              />
              <div
                style={{
                  height: '1px',
                  backgroundColor: '#d0d5dd'
                }}
                className="flex-grow mr-2"
              />
              <div className="mr-2">
                Unlocked&nbsp;&nbsp; <span style={{ color: '#98a2b3' }}>123</span>
              </div>
              <div
                style={{
                  height: '1px',
                  backgroundColor: '#d0d5dd'
                }}
                className="flex-grow"
              />
              <div
                style={{
                  width: '1px',
                  height: '10px',
                  backgroundColor: '#d0d5dd'
                }}
              />
            </div>
            <div className="w-full flex items-center absolute left-0 -bottom-5 text-xs font-medium">
              <div
                style={{
                  width: '1px',
                  height: '10px',
                  backgroundColor: '#d0d5dd'
                }}
              />
              <div
                style={{
                  height: '1px',
                  backgroundColor: '#d0d5dd'
                }}
                className="flex-grow mr-2"
              />
              <div className="mr-2">
                Total allocation&nbsp;&nbsp; <span style={{ color: '#98a2b3' }}>123</span>
              </div>
              <div
                style={{
                  height: '1px',
                  backgroundColor: '#d0d5dd'
                }}
                className="flex-grow"
              />
              <div
                style={{
                  width: '1px',
                  height: '10px',
                  backgroundColor: '#d0d5dd'
                }}
              />
            </div>
          </div>
        </div>
        <div className="mt-5">
          <h2 className="text-[#344054 text-sm">
            Amount you want to burn based on the burnable/locked tokens&nbsp;<span className="text-[#f9623b]">*</span>
          </h2>
          <input
            className="mt-1.5 w-full px-6 py-3 border border-[#d0d5dd] rounded-xl text-sm text-[#101828]"
            type="number"
          />
          {/* <div className="mt-5 relative w-full h-2 rounded bg-[#eaecf0] cursor-pointer">
            <div
              style={{ width: '60%', background: 'linear-gradient(to right, #1b369a 19%, #f9623b 98%)' }}
              className="absolute left-0 top-0 bottom-0 rounded"
            />
          </div> */}
        </div>
        <div className="w-full h-[1px] bg-[#eaecf0] mt-5" />
        <div className="mt-5 w-full px-4 py-3 bg-[#eaecf0] rounded-xl text-[#667085] text-xs">
          Please note that 🔥 burning a token once you proceed it is not reversible
        </div>
        <div className="w-full flex items-center justify-between mt-5">
          <div className="flex gap-2 items-center p-3 font-medium text-[#667085] text-base cursor-pointer">
            <ArrowLeftIcon />
            Back
          </div>
          <Button primary label="Proceed" size="medium" disabled />
        </div>
      </div>
    </div>
  );
};

export default TokenBurnModal;
