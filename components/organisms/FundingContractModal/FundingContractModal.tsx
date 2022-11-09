import Button from '@components/atoms/Button/Button';
import Chip from '@components/atoms/Chip/Chip';
import Form from '@components/atoms/FormControls/Form/Form';
import Radio from '@components/atoms/FormControls/Radio/Radio';
import LimitedSupply from '@components/molecules/FormControls/LimitedSupply/LimitedSupply';
import WalletRadioButton from '@components/molecules/FormControls/WalletRadioButton/WalletRadioButton';
import TokenProfile from '@components/molecules/TokenProfile/TokenProfile';
import CopyIcon from 'public/icons/copy-to-clipboard.svg';
import { useEffect, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import Modal, { Styles } from 'react-modal';
import { IFundContractProps } from 'types/models/vestingContract';
import { formatNumber } from 'utils/token';

interface IFundSource {
  selectedFundSource: string;
}

interface IFundingContractModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  contract?: IFundContractProps;
}

const FundingContractModal = ({ isOpen = false, onClose = () => {}, contract }: IFundingContractModalProps) => {
  const sampleWalletBalances = [
    {
      address: '0x823B3DEc340d86AE5d8341A030Cee62eCbFf0CC5',
      balance: 1839832399029,
      icon: '/icons/wallets/metamask.svg'
    },
    {
      address: '0x123445Ec340d86AE5d8341A030Cee62eCb140753',
      balance: 333666999,
      icon: '/images/multi-sig.png'
    }
    // {
    //   address: '0x37213DEc340d86AE5d8341A030Cee62eCbFf0KK8',
    //   balance: 32399029,
    //   icon: '/icons/wallets/coinbase.png'
    // },
    // {
    //   address: '0x12313DEc340d86AE5d8341A030Cee62eCbFf0Lb2',
    //   balance: 398323990,
    //   icon: '/icons/wallets/ledger.png'
    // },
    // {
    //   address: '0x98373DEc340d86AE5d8341A030Cee62eCbFf0xX3',
    //   balance: 398323,
    //   icon: '/icons/wallets/trezor.png'
    // },
    // {
    //   address: '0x99373DEc340d86AE5d8341A030Cee62eCbFf0MM4',
    //   balance: 98737735,
    //   icon: '/icons/wallets/walletconnect.svg'
    // },
    // {
    //   address: '0x36633DEc340d86AE5d8341A030Cee62eCbFf0n7D',
    //   balance: 1237833
    // }
  ];

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
      zIndex: '1000',
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
  const cancelFundSource = () => {
    setValue('selectedFundSource', '');
    onClose();
  };
  const onSubmit: SubmitHandler<IFundSource> = (data) => {
    // Do the actual funding here...
    console.log('Submitting data', data);
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
  const maxValue = 1000000;
  const handleMaxChange = () => {
    setValue('amount', maxValue);
  };

  const [copied, setCopied] = useState(false);

  // Update copied state when the contract address is copied to clipboard.
  useEffect(() => {
    if (copied === true) {
      setTimeout(() => setCopied(false), 2000);
    }
  }, [copied]);

  // Update the form values that rely on the contract object from the parent caller.
  // Update the amount in the form when updating the method of funding.
  useEffect(() => {
    if (contract && fundingMethod.value !== 'CUSTOM_AMOUNT') {
      setValue('amount', +contract.amount);
    }
  }, [contract, fundingMethod.value]);

  return (
    <>
      {contract ? (
        <Modal isOpen={isOpen} className="z-50 max-w-lg w-full" style={modalStyles}>
          <Form isSubmitting={isSubmitting} onSubmit={handleSubmit(onSubmit)}>
            <h2 className="h5 mb-3 text-neutral-800 font-medium">Fund contract</h2>
            <h3 className="h6 text-neutral-800 font-medium">Select Wallet</h3>
            <p className="paragraphy-small neutral-text mb-3">The wallet you wish to use to fund the contract</p>
            {sampleWalletBalances.map((wallet, walletIndex) => (
              <Controller
                key={`wallet-radio-button-${walletIndex}`}
                name="selectedFundSource"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <WalletRadioButton
                    icon={wallet.icon}
                    address={wallet.address}
                    balance={wallet.balance}
                    symbol={contract.symbol}
                    className="mb-3"
                    checked={wallet.address === selectedFundSource.value}
                    {...field}
                    value={wallet.address}
                  />
                )}
              />
            ))}
            {/* RADIO SECTIONS FOR SELECTING THE METHOD OF FUNDING */}
            {selectedFundSource.value ? (
              <div className="pt-5 mt-5 border-t border-neutral-200">
                <h3 className="h6 text-neutral-800 font-medium">Select Funding Method</h3>
                <p className="paragraphy-small neutral-text mb-3">How much would you like to fund your contract?</p>
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
                            {formatNumber(+contract.amount)} <strong>{contract.symbol}</strong>
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
                          <span>Fund as you want</span>
                          <span>
                            {formatNumber(+amount.value)} <strong>{contract.symbol}</strong>
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
                          <span>Fund manually</span>
                          <span>
                            {formatNumber(+contract.amount)} <strong>{contract.symbol}</strong>
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
                    <LimitedSupply
                      label="Amount to be funded"
                      maximumLabel="Total token supply"
                      required
                      initial={+amount.value}
                      minimum={+contract.amount}
                      maximum={maxValue}
                      onMinChange={handleMinChange}
                      onUseMax={handleMaxChange}
                      maxReadOnly
                    />
                  </div>
                ) : null}
                {/* MANUAL FUNDING SECTION */}
                {fundingMethod.value === 'MANUAL' ? (
                  <CopyToClipboard text={contract.address} onCopy={() => setCopied(true)}>
                    <div className="mt-5 pt-3 px-3 flex flex-col items-center cursor-pointer relative">
                      <TokenProfile logo={contract.logo} name={contract.name} symbol={contract.symbol} />
                      <div className="row-center mt-2">
                        <CopyIcon className="fill-current h-4" />
                        <p className="paragraphy-small neutral-text">{contract.address}</p>
                      </div>
                      {copied ? (
                        <div className="absolute z-50 bottom-3 text-center w-full">
                          <span className="inline-block bg-white rounded-xl shadow-lg py-4 px-6 opacity-95">
                            Contract address copied!
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </CopyToClipboard>
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
                disabled={!selectedFundSource.value || !+amount.value || +amount.value < +contract.amount}
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
