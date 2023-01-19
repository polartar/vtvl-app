import Button from '@components/atoms/Button/Button';
import BarRadio from '@components/atoms/FormControls/BarRadio/BarRadio';
import Form from '@components/atoms/FormControls/Form/Form';
import VestingProgress from '@components/atoms/VestingProgress/VestingProgress';
import AdditionalInformation from '@components/molecules/AdditionalInformation/AdditionalInformation';
import LimitedSupply from '@components/molecules/FormControls/LimitedSupply/LimitedSupply';
import MyTokenDetails from '@components/molecules/MyTokenDetails/MyTokenDetails';
import TokenProfile from '@components/molecules/TokenProfile/TokenProfile';
import SteppedLayout from '@components/organisms/Layout/SteppedLayout';
import { useTokenContext } from '@providers/token.context';
import format from 'date-fns/format';
import Router from 'next/router';
import { NextPageWithLayout } from 'pages/_app';
import { ReactElement, useState } from 'react';
import Countdown from 'react-countdown';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Area, Cell, ComposedChart, Line, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatNumber } from 'utils/token';

interface IMyTokenSchedule {
  toClaim: number;
  claimable: number;
}

const MyTokenSchedule: NextPageWithLayout = () => {
  const { mintFormState } = useTokenContext();
  const defaultClaimableValue: IMyTokenSchedule = { toClaim: 0, claimable: 1000 };
  const {
    control,
    handleSubmit,
    watch,
    getFieldState,
    getValues,
    setValue,
    reset,
    formState: { isSubmitting }
  } = useForm({
    defaultValues: defaultClaimableValue
  });

  const toClaim = { value: watch('toClaim'), state: getFieldState('toClaim') };
  const claimable = { value: watch('claimable'), state: getFieldState('claimable') };

  const handleMinChange = (e: any) => {
    setValue('toClaim', +e.target.value);
  };

  const handleMaxChange = () => {
    setValue('toClaim', +getValues('claimable'));
  };

  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  const resetFormStates = () => {
    setError(false);
    setSuccess(false);
    setMessage('');
  };

  const onSubmit: SubmitHandler<IMyTokenSchedule> = (data) => {
    console.log('submitting data', data);
    setError(true);
    setMessage('SAMPLE error if in any case. Oh no!');

    setTimeout(() => {
      setError(false);
      setSuccess(true);
      setMessage('SAMPLE success after Alright! back online!');

      setTimeout(() => {
        resetFormStates();
        reset();
        Router.push('/tokens/success');
      }, 4000);
    }, 3000);
  };

  // Temporary text for additional information section
  const additionalInformation = [
    {
      text: (
        <>
          <strong>{mintFormState.symbol || 'Token'}</strong> [Schedule-001] schedule unlocks every x based on x period.
        </>
      ),
      icon: 'success'
    },
    {
      text: (
        <>
          You can claim <strong>{mintFormState.symbol || 'Token'}</strong> after the unlocking period by clicking the
          "Claim {mintFormState.symbol || 'Token'}" button.
        </>
      ),
      icon: 'success'
    },
    {
      text: (
        <>
          You can return by <strong>date</strong> to claim your next vested tokens.
        </>
      ),
      icon: 'success'
    },
    {
      text: (
        <>
          Once you claim your token, it will take <strong>x</strong> amount of time and you need to pay a gas fee of x.
        </>
      ),
      icon: 'success'
    },
    {
      text: (
        <>
          <strong>Important</strong>: a good practice is to add this custom tokens to your selected wallet before
          claiming.
        </>
      ),
      icon: 'warning'
    },
    {
      text: (
        <>
          <strong>Important</strong>: please remember that you must have Polygon <strong>MATIC</strong> in your wallet
          to cover the gas fees each time you claim <strong>{mintFormState.symbol || 'Token'}</strong>.
        </>
      ),
      icon: 'warning'
    }
  ];

  const chartData = [
    { name: 'Claimed', value: 1000 },
    { name: 'Amount vested to-date', value: 500 },
    { name: 'Remaining', value: 9630 }
  ];

  const priceData = [
    { name: '1', value: 0.34233 },
    { name: '2', value: 0.33233 },
    { name: '3', value: 0.32233 },
    { name: '4', value: 0.38233 },
    { name: '5', value: 0.36233 },
    { name: '6', value: 0.39233 },
    { name: '7', value: 0.42233 },
    { name: '8', value: 0.45233 },
    { name: '9', value: 0.50233 },
    { name: '10', value: 0.48233 },
    { name: '11', value: 0.47233 },
    { name: '12', value: 0.48233 },
    { name: '13', value: 0.52233 },
    { name: '14', value: 0.58233 },
    { name: '15', value: 0.60233 },
    { name: '16', value: 0.59233 },
    { name: '17', value: 0.61233 }
  ];

  return (
    <div className="w-full">
      <div className="max-w-4xl xl:max-w-full">
        <h1 className="text-neutral-900 mb-2">Schedule-001</h1>
        <p className="paragraphy-small text-neutral-500 mb-4">
          Withdraw your <strong>{mintFormState.symbol || 'Token'}</strong> tokens from this vesting schedule.
        </p>
        <div className="grid md:grid-cols-12 gap-6">
          <div className="md:col-span-7">
            <Form
              isSubmitting={isSubmitting}
              error={error}
              success={success}
              message={message}
              onSubmit={handleSubmit(onSubmit)}>
              <ResponsiveContainer width={'99%'} height={300}>
                <PieChart width={400} height={400}>
                  <text
                    x={'50%'}
                    y={'43%'}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs fill-neutral-500">
                    Your total allocation
                  </text>
                  <text
                    x={'50%'}
                    y={'51%'}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="paragraphy-medium-medium fill-neutral-900">
                    {formatNumber(10000)} {mintFormState.symbol || 'Token'}
                  </text>
                  <text
                    x={'50%'}
                    y={'57%'}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs fill-success-500">
                    = ${formatNumber(5198.58, 2)}
                  </text>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={115}
                    outerRadius={140}
                    fill="#82ca9d">
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.name === 'Claimed'
                            ? 'var(--secondary-900)'
                            : entry.name === 'Unclaimed' || entry.name === 'Amount vested to-date'
                            ? 'var(--primary-900)'
                            : 'var(--success-500)'
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-lg text-neutral-900 mb-6">Your schedule summary</p>
              <VestingProgress duration="32 days left" progress={50} />
              <div className="grid grid-cols-4 gap-3 my-6">
                <div>
                  <p className="paragraphy-small-medium text-neutral-500 mb-2">Claimed</p>
                  <div className="paragraphy-small-semibold text-neutral-600 row-center">
                    <div className="w-3 h-3 rounded-full bg-secondary-900"></div>
                    {formatNumber(1000)} {mintFormState.symbol || 'Token'}
                  </div>
                </div>
                <div>
                  <p className="paragraphy-small-medium text-neutral-500 mb-2">Amount vested to-date</p>
                  <div className="paragraphy-small-semibold text-neutral-600 row-center">
                    <div className="w-3 h-3 rounded-full bg-primary-900"></div>
                    {formatNumber(500)} {mintFormState.symbol || 'Token'}
                  </div>
                </div>
                <div>
                  <p className="paragraphy-small-medium text-neutral-500 mb-2">Remaining</p>
                  <div className="paragraphy-small-semibold text-neutral-600 row-center">
                    <div className="w-3 h-3 rounded-full bg-success-500"></div>
                    {formatNumber(9630)} {mintFormState.symbol || 'Token'}
                  </div>
                </div>
                <div>
                  <p className="paragraphy-small-medium text-neutral-500 mb-2">Next unlock</p>
                  <div className="paragraphy-small-semibold text-neutral-600">
                    {/*
                      Add the current date here plus the end date time of the vesting schedule 
                      OR probably be the date time of the next linear release
                      all in milliseconds
                    */}
                    <Countdown
                      date={Date.now() + 10000}
                      renderer={({ days, hours, minutes, seconds }) => (
                        <>
                          {days}d {hours}h {minutes}m {seconds}s
                        </>
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 border-t border-b border-gray-200 py-6 mb-6">
                <div>
                  <p className="paragraphy-small-medium text-neutral-500 mb-2">Start</p>
                  <div className="flex flex-row items-start gap-2 text-xs font-semibold text-neutral-600">
                    <img src="/icons/calendar-clock.svg" className="w-5 h-5" alt="Cliff" />
                    {format(new Date(2022, 9, 26, 11, 7), 'LLL d, yyyy - h:mm aa')}
                  </div>
                </div>
                <div>
                  <p className="paragraphy-small-medium text-neutral-500 mb-2">End</p>
                  <div className="flex flex-row items-start gap-2 text-xs font-semibold text-neutral-600">
                    <img src="/icons/calendar-clock.svg" className="w-5 h-5" alt="Cliff" />
                    {format(new Date(2022, 11, 26, 11, 7), 'LLL d, yyyy - h:mm aa')}
                  </div>
                </div>
              </div>
              <LimitedSupply
                label="Claimable tokens"
                maximumLabel="Total claimable tokens"
                required
                initial={+toClaim.value}
                maximum={+claimable.value}
                onMinChange={handleMinChange}
                onUseMax={handleMaxChange}
                maxReadOnly
              />
              <Button
                type="submit"
                className="primary w-full mt-6"
                loading={isSubmitting}
                disabled={toClaim.value === 0}>
                Claim <strong>{formatNumber(toClaim.value)}</strong> {mintFormState.symbol || 'Token'}
              </Button>
            </Form>
          </div>
          <div className="md:col-span-5">
            <div className="panel p-0 h-48 mb-9 relative flex items-end">
              <div className="flex flex-col justify-between h-full items-stretch p-4 absolute inset-0 z-10">
                <div className="flex flex-row items-start justify-between">
                  <TokenProfile
                    address={mintFormState.address}
                    logo={mintFormState.logo || '/images/biconomy-logo.png'}
                    name={mintFormState.name || 'Token'}
                    symbol={mintFormState.symbol || 'Token'}
                    size="small"
                  />
                  <div className="text-right">
                    <p className="text-xxs text-neutral-500">
                      <strong>{mintFormState.symbol || 'Token'}/USD</strong> Price
                    </p>
                    <p className="paragraphy-large-semibold text-neutral-900">${formatNumber(0.493627)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <button className="secondary small py-1">Import your token to your wallet</button>
                </div>
              </div>
              {/* Behind the contents */}
              <ResponsiveContainer width={'100%'} height={140}>
                <ComposedChart
                  width={400}
                  height={400}
                  data={priceData}
                  margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary-900)" stopOpacity={0.15} />
                      <stop offset="70%" stopColor="#FFFFFF" stopOpacity={0.5} />
                    </linearGradient>
                  </defs>
                  <Line
                    type="linear"
                    unit="M"
                    strokeLinecap="round"
                    strokeWidth={2}
                    style={{ strokeDasharray: `40% 60%` }}
                    dataKey="value"
                    stroke="var(--primary-900)"
                    dot={false}
                    legendType="none"
                  />
                  <Area type="linear" dataKey="value" stroke="var(--primary-900)" fill="url(#colorUv)" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <p className="paragraphy-small-semibol text-secondary-900 mb-5">
              {mintFormState.symbol || 'Token'} holders
            </p>
            <h3 className="font-semibold text-neutral-900 inter mb-5">Additional Information</h3>
            <AdditionalInformation activities={additionalInformation} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Assign a stepped layout -- to refactor later and put into a provider / service / utility function because this is a repetitive function
MyTokenSchedule.getLayout = function getLayout(page: ReactElement) {
  const { mintFormState } = useTokenContext();
  // Update these into a state coming from the context
  const crumbSteps = [
    { title: 'My tokens', route: '/tokens' },
    // Update the title of this into the actual token name
    { title: mintFormState?.name || 'Token', route: '/tokens/001' },
    // Update the title of this into the actual schedule name
    { title: 'Schedule-01', route: '/tokens/001' }
  ];
  return (
    <SteppedLayout title="" crumbs={crumbSteps}>
      {page}
    </SteppedLayout>
  );
};

export default MyTokenSchedule;
