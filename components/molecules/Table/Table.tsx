import Button from '@components/atoms/Button/Button';
import FundingContractModalV2 from '@components/organisms/FundingContractModal/FundingContractModalV2';
import Safe from '@gnosis.pm/safe-core-sdk';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import SafeServiceClient from '@gnosis.pm/safe-service-client';
import { useAuthContext } from '@providers/auth.context';
import { useDashboardContext } from '@providers/dashboard.context';
import { useTokenContext } from '@providers/token.context';
import { useTransactionLoaderContext } from '@providers/transaction-loader.context';
import { useWeb3React } from '@web3-react/core';
import VTVL_VESTING_V2_ABI from 'contracts/abi/Vtvl2Vesting.json';
import VTVL_VESTING_ABI from 'contracts/abi/VtvlVesting.json';
import { BigNumber, ethers } from 'ethers';
import useIsAdmin from 'hooks/useIsAdmin';
import BatchIcon from 'public/icons/batch-transactions.svg';
import DownloadIcon from 'public/icons/download.svg';
import PrintIcon from 'public/icons/print.svg';
import React, { InputHTMLAttributes, MutableRefObject, Ref, forwardRef, useEffect, useRef, useState } from 'react';
import { usePagination, useRowSelect, useTable } from 'react-table';
import { toast } from 'react-toastify';
import { createOrUpdateSafe } from 'services/db/safe';
import { createTransaction } from 'services/db/transaction';
import { updateVesting } from 'services/db/vesting';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { IVestingContract } from 'types/models';
import { isV2 } from 'utils/multicall';

interface IndeterminateCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  indeterminate?: boolean;
}
const IndeterminateCheckbox = forwardRef(
  ({ indeterminate = false, ...rest }: IndeterminateCheckboxProps, ref: Ref<HTMLInputElement>) => {
    const defaultRef = useRef<HTMLInputElement>(null);
    const resolvedRef = ref || defaultRef;

    useEffect(() => {
      (resolvedRef as MutableRefObject<HTMLInputElement>).current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return (
      <>
        <input type="checkbox" ref={resolvedRef} {...rest} />
      </>
    );
  }
);

const Table = ({
  // Selectable and Batch options are always working together
  selectable = false,
  batchOptions = {
    label: 'Batch transactions',
    onBatchProcessClick: () => {}
  },
  // Default datas
  columns,
  data,
  pagination = false,
  exports = false,
  getTrProps = () => {}
}: any) => {
  // Table features -- initially has pagination and default column datas
  let tableFeatures = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 10 }
    },
    usePagination
  );

  // Add selectable rows feature
  if (selectable) {
    tableFeatures = useTable(
      {
        columns,
        data,
        initialState: { pageIndex: 0, pageSize: 10 }
      },
      usePagination,
      useRowSelect,
      (hooks) => {
        hooks.visibleColumns.push((columns) => [
          // Let's make a column for selection
          {
            id: 'selection',
            // The header can use the table's getToggleAllRowsSelectedProps method
            // to render a checkbox
            Header: ({ getToggleAllRowsSelectedProps }) => (
              <div>
                <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
              </div>
            ),
            // The cell can use the individual row's getToggleRowSelectedProps method
            // to the render a checkbox
            Cell: ({ row }) => (
              <div>
                <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
              </div>
            )
          },
          ...columns
        ]);
      }
    );
  }
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page, // Instead of using 'rows', we'll use page,
    // which has only the rows for the active page

    // The rest of these things are super handy, too ;)
    canPreviousPage,
    canNextPage,
    pageOptions,
    selectedFlatRows,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize }
  } = tableFeatures;

  const { chainId, library, account } = useWeb3React();
  const { organizationId, currentSafe, currentSafeId, setCurrentSafe } = useAuthContext();
  const { mintFormState } = useTokenContext();
  const { vestingContracts, fetchDashboardData } = useDashboardContext();
  const { setTransactionStatus: setTransactionLoaderStatus, setIsCloseAvailable } = useTransactionLoaderContext();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fundingRequired, setFundingRequired] = useState(false);
  const [showFundingContractModal, setShowFundingContractModal] = useState(false);
  const [vestingContractForFunding, setVestingContractForFunding] = useState<{ id: string; data: IVestingContract }>();
  const [depositAmount, setDepositAmount] = useState('0');

  const handleBatchProcess = () => {
    const actualData = selectedFlatRows.map((row) => ({ ...row.original }));
    batchOptions.onBatchProcessClick(actualData);
  };

  const checkContractBalance = async () => {
    if (selectedFlatRows && selectedFlatRows.length > 0) {
      const actualData = selectedFlatRows.map((row) => ({ ...row.original }));
      const vestingContract = vestingContracts.find((v) => v.id === (actualData[0] as any).data.vestingContractId);
      setVestingContractForFunding(vestingContract);
      if (actualData.find((row: any) => row.data.status !== 'INITIALIZED')) {
        setError('You can only batch new schedules.');
        return;
      } else if (
        actualData.find((row: any) => row.data.vestingContractId !== (actualData[0] as any).data.vestingContractId)
      ) {
        setError('You can only batch schedules to one vesting contract.');
        return;
      }

      setLoading(true);
      try {
        const TokenContract = new ethers.Contract(
          mintFormState.address,
          [
            // Read-Only Functions
            'function balanceOf(address owner) view returns (uint256)',
            'function decimals() view returns (uint8)',
            'function symbol() view returns (string)',
            // Authenticated Functions
            'function transfer(address to, uint amount) returns (bool)',
            // Events
            'event Transfer(address indexed from, address indexed to, uint amount)'
          ],
          ethers.getDefaultProvider(SupportedChains[chainId as SupportedChainId].rpc)
        );
        const VestingContract = new ethers.Contract(
          vestingContract?.data.address ?? '',
          vestingContract?.data.updatedAt && isV2(vestingContract?.data.updatedAt)
            ? VTVL_VESTING_V2_ABI.abi
            : VTVL_VESTING_ABI.abi,
          ethers.getDefaultProvider(SupportedChains[chainId as SupportedChainId].rpc)
        );

        const tokenBalance = await TokenContract.balanceOf(vestingContract?.data?.address);
        // const tokenBalance = vestingContract?.data.balance || 0;

        const numberOfTokensReservedForVesting = await VestingContract.numTokensReservedForVesting();
        let totalVestingAmount = BigNumber.from(0);
        actualData.forEach((row: any) => {
          totalVestingAmount = totalVestingAmount.add(
            ethers.utils.parseEther(row.data.details.amountToBeVested.toString())
          );
        });

        if (
          BigNumber.from(tokenBalance).gte(BigNumber.from(numberOfTokensReservedForVesting)) &&
          BigNumber.from(tokenBalance).sub(BigNumber.from(numberOfTokensReservedForVesting)).lt(totalVestingAmount)
        ) {
          setError('');
          setLoading(false);
          setFundingRequired(true);
          setDepositAmount(
            ethers.utils.formatEther(
              totalVestingAmount.sub(BigNumber.from(tokenBalance).sub(BigNumber.from(numberOfTokensReservedForVesting)))
            )
          );
        } else {
          setLoading(false);
          setFundingRequired(false);
          setError('');
        }
      } catch (err) {
        console.log('checkContractBalance - ', err);
      }
    } else {
      setError('');
      setFundingRequired(false);
    }
  };

  const handleFundContract = async (type: string, amount: string) => {
    try {
      if (!account || !chainId) {
        // activate(injected);
        toast.info('Connect your wallet and try again.');
        return;
      }

      const actualData = selectedFlatRows.map((row) => ({ ...row.original }));

      if (type === 'Metamask') {
        setIsCloseAvailable(false);
        setTransactionLoaderStatus('PENDING');
        const tokenContract = new ethers.Contract(
          mintFormState.address,
          [
            // Read-Only Functions
            'function balanceOf(address owner) view returns (uint256)',
            'function decimals() view returns (uint8)',
            'function symbol() view returns (string)',
            'function allowance(address owner, address spender) view returns (uint256)',
            // Authenticated Functions
            'function approve(address spender, uint256 amount) returns (bool)',
            'function transfer(address to, uint amount) returns (bool)',
            // Events
            'event Transfer(address indexed from, address indexed to, uint amount)'
          ],
          library.getSigner()
        );

        const allowance = await tokenContract.allowance(account, vestingContractForFunding?.data.address);
        if (allowance.lt(ethers.utils.parseEther(amount))) {
          const approveTx = await tokenContract.approve(
            vestingContractForFunding?.data.address,
            ethers.utils.parseEther(amount).sub(allowance)
          );
          await approveTx.wait();
        }

        const fundTransaction = await tokenContract.transfer(
          vestingContractForFunding?.data?.address,
          ethers.utils.parseEther(amount)
        );
        setTransactionLoaderStatus('IN_PROGRESS');
        await fundTransaction.wait();
        await fetchDashboardData();
        toast.success('Token deposited successfully');
        setTransactionLoaderStatus('SUCCESS');
      } else {
        const tokenContractInterface = new ethers.utils.Interface([
          'function transfer(address to, uint amount) returns (bool)',
          // Events
          'event Transfer(address indexed from, address indexed to, uint amount)'
        ]);
        const transferEncoded = tokenContractInterface.encodeFunctionData('transfer', [
          vestingContractForFunding?.data?.address,
          ethers.utils.parseEther(amount)
        ]);
        if (currentSafe?.address && account && chainId && organizationId) {
          if (currentSafe.owners.find((owner) => owner.address.toLowerCase() === account.toLowerCase())) {
            setTransactionLoaderStatus('PENDING');
            const ethAdapter = new EthersAdapter({
              ethers: ethers,
              signer: library?.getSigner(0)
            });
            const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapter, safeAddress: currentSafe?.address });
            const safeService = new SafeServiceClient({
              txServiceUrl: SupportedChains[chainId as SupportedChainId].multisigTxUrl,
              ethAdapter
            });

            const nextNonce = await safeService.getNextNonce(currentSafe.address);

            const txData = {
              to: mintFormState.address,
              data: transferEncoded,
              value: '0',
              nonce: nextNonce
            };
            const safeTransaction = await safeSdk.createTransaction({ safeTransactionData: txData });
            const txHash = await safeSdk.getTransactionHash(safeTransaction);
            const signature = await safeSdk.signTransactionHash(txHash);
            setTransactionLoaderStatus('IN_PROGRESS');
            safeTransaction.addSignature(signature);
            await safeService.proposeTransaction({
              safeAddress: currentSafe.address,
              senderAddress: account,
              safeTransactionData: safeTransaction.data,
              safeTxHash: txHash,
              senderSignature: signature.data
            });
            const transactionId = await createTransaction({
              hash: '',
              safeHash: txHash,
              status: 'PENDING',
              to: vestingContractForFunding?.data?.address ?? '',
              type: 'FUNDING_CONTRACT',
              createdAt: Math.floor(new Date().getTime() / 1000),
              updatedAt: Math.floor(new Date().getTime() / 1000),
              organizationId: organizationId,
              approvers: [account],
              fundingAmount: amount,
              chainId
            });
            await Promise.all(
              actualData.map(async (vesting: any) => {
                await updateVesting(
                  {
                    ...vesting.data,
                    // Because all batched vesting schedules are now ready for distribution
                    status: 'WAITING_FUNDS',
                    transactionId: transactionId
                  },
                  vesting.id
                );
              })
            );

            await fetchDashboardData();
            toast.success(`Funding transaction with nonce ${nextNonce} has been created successfully`);
            setTransactionLoaderStatus('SUCCESS');
          } else {
            toast.error('You are not a signer of this multisig wallet.');
            return;
          }
        }
      }
      setShowFundingContractModal(false);
    } catch (err: any) {
      console.log('fundContract - ', err);
      toast.error(err.reason ? err.reason : 'Something went wrong. Try again later.');
      setTransactionLoaderStatus('ERROR');
    }
  };

  useEffect(() => {
    checkContractBalance();
  }, [selectedFlatRows, vestingContracts]);

  return (
    <div className="panel p-0 w-full">
      <div className="overflow-x-auto">
        <table {...getTableProps()}>
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column, columnIndex) => (
                  <th
                    {...column.getHeaderProps()}
                    className={
                      getTrProps(page[0]).stickyActions && headerGroup.headers.length - 1 === columnIndex
                        ? 'sticky right-0 bg-gradient-to-l from-neutral-100 via-neutral-100 to-transparent'
                        : ''
                    }>
                    {column.render('Header')}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row: any, i: number) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} {...getTrProps(row)}>
                  {row.cells.map((cell: any, cellIndex: number) => {
                    return (
                      <td
                        {...cell.getCellProps()}
                        className={
                          getTrProps(row).stickyActions && row.cells.length - 1 === cellIndex
                            ? 'sticky right-0 bg-gradient-to-l from-white via-white to-transparent'
                            : ''
                        }>
                        {cell.render('Cell')}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {exports || pagination || selectable ? (
        <div className="pt-5 border-t border-gray-200 row-center justify-between gap-6 p-3.5 h-[4.1875rem]">
          {exports ? (
            <div className="row-center gap-3">
              <button type="button" className="row-center primary py-1 px-3 gap-1 h-8 text-sm text-medium">
                <PrintIcon className="w-6 h-6" />
                Print
              </button>
              <button type="button" className="row-center primary py-1 px-3 gap-1 h-8 text-sm text-medium">
                <DownloadIcon className="w-6 h-6" />
                CSV
              </button>
            </div>
          ) : null}
          {pagination ? (
            <div className="row-center gap-3 text-sm">
              {pageCount > 1 ? (
                <button className="py-1 h-8 text-sm" onClick={() => previousPage()} disabled={!canPreviousPage}>
                  Previous
                </button>
              ) : null}
              <span className="block py-1 h-8">
                Page {pageIndex + 1} of {pageCount}
              </span>
              {pageCount > 1 ? (
                <button className="py-1 h-8 text-sm" onClick={() => nextPage()} disabled={!canNextPage}>
                  Next
                </button>
              ) : null}
            </div>
          ) : null}
          {selectable ? (
            <div className="flex items-center gap-6">
              <p className="text-xs text-red-500">{error}</p>
              <Button
                className="secondary py-1 px-3"
                disabled={!selectedFlatRows.length || loading || !!error}
                onClick={() => {
                  if (fundingRequired) {
                    setShowFundingContractModal(true);
                  } else {
                    handleBatchProcess();
                  }
                }}>
                <span className="row-center">
                  <BatchIcon className="w-4 h-4" />
                  {fundingRequired ? 'Fund Batch Transaction' : batchOptions.label}
                </span>
              </Button>
            </div>
          ) : null}
          {vestingContractForFunding && (
            <FundingContractModalV2
              isOpen={showFundingContractModal}
              vestingContract={vestingContractForFunding}
              hideModal={() => setShowFundingContractModal(false)}
              depositAmount={depositAmount}
              handleFundContract={handleFundContract}
            />
          )}
        </div>
      ) : null}
    </div>
  );
};

export default Table;
