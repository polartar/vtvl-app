import Button from '@components/atoms/Button/Button';
import Chip from '@components/atoms/Chip/Chip';
import Copy from '@components/atoms/Copy/Copy';
import Form from '@components/atoms/FormControls/Form/Form';
import Input from '@components/atoms/FormControls/Input/Input';
import Radio from '@components/atoms/FormControls/Radio/Radio';
import LimitedSupply from '@components/molecules/FormControls/LimitedSupply/LimitedSupply';
import WalletRadioButton from '@components/molecules/FormControls/WalletRadioButton/WalletRadioButton';
import TokenProfile from '@components/molecules/TokenProfile/TokenProfile';
import { useAuthContext } from '@providers/auth.context';
import { useDashboardContext } from '@providers/dashboard.context';
import { useWeb3React } from '@web3-react/core';
import { BigNumber, ethers } from 'ethers';
import { useTokenContext } from 'providers/token.context';
import CopyIcon from 'public/icons/copy-to-clipboard.svg';
import { useEffect, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import Modal, { Styles } from 'react-modal';
import { connectionAssets } from 'types/constants/shared';
import { SupportedChainId, SupportedChains } from 'types/constants/supported-chains';
import { IFundContractProps, IVestingContract } from 'types/models/vestingContract';
import { formatNumber, parseTokenAmount } from 'utils/token';

interface IFundSource {
  selectedFundSource: string;
}

interface IFundingContractModalProps {
  isOpen?: boolean;
  handleFundContract: (type: string, amount: string) => void;
  hideModal: () => void;
  depositAmount: string;
  vestingContract: { id: string; data: IVestingContract };
}

const FundingContractModal = ({
  isOpen = false,
  depositAmount,
  hideModal,
  handleFundContract,
  vestingContract
}: IFundingContractModalProps) => {
  const { account, chainId } = useWeb3React();
  const { mintFormState } = useTokenContext();
  const { currentSafe, connection } = useAuthContext();

  // Make Modal styles scrollable when exceeding the device view height
  const modalStyles: Styles = {
    overlay: {
      position: 'fixed',
      display: 'flex',
      justifyContent: 'center',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.3)',
      zIndex: '900',
      overflowY: 'auto',
      paddingTop: '3rem',
      paddingBottom: '3rem'
    },
    content: {
      backgroundColor: '#fff',
      position: 'absolute',
      filter: 'drop-shadow(0 20px 13px rgb(0 0 0 / 0.03)) drop-shadow(0 8px 5px rgb(0 0 0 / 0.08))',
      borderRadius: '1.5rem'
    }
  };

  /**
   * Form controls for the wallet address selection in funding contract
   */

  const {
    control,
    handleSubmit,
    watch,
    getFieldState,
    setValue,
    getValues,
    formState: { isSubmitting }
  } = useForm({
    defaultValues: {
      selectedFundSource: '',
      fundingMethod: '',
      amount: 0
    }
  });

  const selectedFundSource = { value: watch('selectedFundSource'), fieldState: getFieldState('selectedFundSource') };
  const fundingMethod = { value: watch('fundingMethod'), fieldState: getFieldState('fundingMethod') };
  const amount = { value: watch('amount'), fieldState: getFieldState('amount') };

  const [walletBalance, setWalletBalance] = useState(0);
  const [contractBalance, setContractBalance] = useState(0);

  const cancelFundSource = () => {
    setValue('selectedFundSource', '');
    hideModal();
  };
  const onSubmit: SubmitHandler<IFundSource> = (data) => {
    // Do the actual funding here...
    console.log('Submitting data', data);
    handleFundContract(data.selectedFundSource, amount.value.toString());
    return;
  };

  /**
   * Function used when updating the current value for the <LimitedSupply> component
   * -- the Amount to be funded in the contract.
   */
  const handleMinChange = (e: any) => {
    setValue('amount', +e.target.value);
  };

  /**
   * Function used to update the current value and turn it into the Maximum allowable value in the <LimitedSupply> component
   * -- the Amount to be funded in the contract.
   */
  const handleMaxChange = () => {
    setValue('amount', +mintFormState.maxSupply);
  };

  // Update the form values that rely on the contract object from the parent caller.
  // Update the amount in the form when updating the method of funding.
  useEffect(() => {
    if (depositAmount && fundingMethod.value !== 'CUSTOM_AMOUNT') {
      setValue('amount', parseFloat(depositAmount));
    }
  }, [depositAmount, fundingMethod.value]);

  useEffect(() => {
    if (vestingContract && account) {
      const tokenContract = new ethers.Contract(
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
      // const vestingContract = new ethers.Contract(vesting.vestingContract, VTVL_VESTING_ABI.abi, library.getSigner());
      if (currentSafe?.address) {
        tokenContract.balanceOf(currentSafe?.address).then((res: string) => {
          setContractBalance(parseFloat(BigNumber.from(res).toString()) / 10 ** 18);
        });
      }
      tokenContract.balanceOf(account).then((res: string) => {
        setWalletBalance(parseFloat(BigNumber.from(res).toString()) / 10 ** 18);
      });
    }
  }, [chainId, account, currentSafe]);

  return (
    <>
      {depositAmount ? (
        <Modal isOpen={isOpen} className="z-50 max-w-lg w-full" style={modalStyles}>
          <Form isSubmitting={isSubmitting} onSubmit={handleSubmit(onSubmit)}>
            <h2 className="h5 mb-3 text-neutral-800 font-medium">Fund schedule</h2>
            <h3 className="h6 text-neutral-800 font-medium">Select wallet</h3>
            <p className="paragraphy-small neutral-text mb-3">Select the wallet to fund the schedule</p>
            <Controller
              name="selectedFundSource"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <WalletRadioButton
                  icon={connection ? connectionAssets[connection].walletIcon : connectionAssets.default.walletIcon}
                  address={account ?? ''}
                  balance={walletBalance}
                  symbol={mintFormState.symbol}
                  className="mb-3"
                  checked={selectedFundSource.value === 'Metamask'}
                  {...field}
                  value={'Metamask'}
                />
              )}
            />
            <Controller
              name="selectedFundSource"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <WalletRadioButton
                  icon={'/images/multi-sig.png'}
                  address={currentSafe?.address ?? ''}
                  balance={contractBalance}
                  symbol={mintFormState.symbol}
                  className="mb-3"
                  checked={selectedFundSource.value === 'Multisig'}
                  {...field}
                  value={'Multisig'}
                />
              )}
            />
            {/* RADIO SECTIONS FOR SELECTING THE METHOD OF FUNDING */}
            {selectedFundSource.value ? (
              <div className="pt-5 mt-5 border-t border-neutral-200">
                <h3 className="h6 text-neutral-800 font-medium">Select funding amount</h3>
                <p className="paragraphy-small neutral-text mb-3">How much would you like to fund your schedule?</p>
                <Controller
                  name="fundingMethod"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Radio
                      variant="input-style"
                      checked={fundingMethod.value === 'MINIMUM_AMOUNT'}
                      label={
                        <div className="row-center justify-between">
                          <span>
                            Fund based on schedule <Chip label="Fixed" color="gray" rounded size="small" />
                          </span>
                          <span>
                            {formatNumber(+depositAmount)} <strong>{mintFormState.symbol}</strong>
                          </span>
                        </div>
                      }
                      className="mb-3"
                      {...field}
                      value="MINIMUM_AMOUNT"
                    />
                  )}
                />
                <Controller
                  name="fundingMethod"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Radio
                      variant="input-style"
                      checked={fundingMethod.value === 'CUSTOM_AMOUNT'}
                      label={
                        <div className="row-center justify-between">
                          <span>Fund a different amount</span>
                          <span>
                            {formatNumber(+amount.value)} <strong>{mintFormState.symbol}</strong>
                          </span>
                        </div>
                      }
                      className="mb-3"
                      {...field}
                      value="CUSTOM_AMOUNT"
                    />
                  )}
                />
                <Controller
                  name="fundingMethod"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Radio
                      variant="input-style"
                      checked={fundingMethod.value === 'MANUAL'}
                      label={
                        <div className="row-center justify-between">
                          <span>Transfer manually</span>
                          <span>
                            {formatNumber(+depositAmount)} <strong>{mintFormState.symbol}</strong>
                          </span>
                        </div>
                      }
                      className="mb-3"
                      {...field}
                      value="MANUAL"
                    />
                  )}
                />
                {/* CUSTOM AMOUNT FUNDING SECTION */}
                {fundingMethod.value === 'CUSTOM_AMOUNT' ? (
                  <div className="mt-5">
                    <Controller
                      name="amount"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Input
                          label="Amount to be funded"
                          required
                          type="number"
                          {...field}
                          onChange={(v) => {
                            setValue('amount', parseFloat(v.target.value.replaceAll(',', '')));
                          }}
                        />
                      )}
                    />
                  </div>
                ) : null}
                {/* MANUAL FUNDING SECTION */}
                {fundingMethod.value === 'MANUAL' ? (
                  <Copy text={mintFormState.address} removeIcon>
                    <div className="mt-5 pt-3 px-3 flex flex-col cursor-pointer relative">
                      <TokenProfile
                        address={mintFormState.address}
                        logo={mintFormState.logo}
                        name={mintFormState.name}
                        symbol={mintFormState.symbol}
                      />
                      <div className="row-center mt-2">
                        <CopyIcon className="fill-current h-4" />
                        <p className="paragraphy-small neutral-text">{vestingContract.data.address}</p>
                      </div>
                    </div>
                  </Copy>
                ) : null}
              </div>
            ) : null}
            {/* ACTION BUTTONS SECTION */}
            <div className="row-center justify-between pt-5 mt-5 border-t border-neutral-200">
              <button type="button" className="line primary" onClick={cancelFundSource}>
                Cancel
              </button>
              <Button
                type="submit"
                className="secondary"
                disabled={!selectedFundSource.value || !+amount.value || +amount.value < +depositAmount}
                loading={isSubmitting}>
                Continue
              </Button>
            </div>
          </Form>
        </Modal>
      ) : null}
    </>
  );
};

export default FundingContractModal;
