import Link from 'next/link';

const Consent = () => (
  <div className="text-xs text-neutral-600 font-medium leading-5">
    <span>
      By connecting a wallet, you agree to VTVL{' '}
      <Link href="/terms">
        <span className="cursor-pointer font-bold text-primary-900 no-underline">Terms of Service</span>
      </Link>{' '}
      and acknowledge that you have read and understand the{' '}
      <Link href="/">
        <span className="cursor-pointer font-bold text-primary-900 no-underline">Privacy Policy</span>
      </Link>
      .
    </span>
  </div>
);

export default Consent;
