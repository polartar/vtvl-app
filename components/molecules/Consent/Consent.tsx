const Consent = () => (
  <div className="text-xs text-neutral-600 font-medium leading-5">
    <span>
      By connecting a wallet, you agree to VTVL{' '}
      <a href="/" className="font-bold text-primary-900 no-underline">
        Terms of Service
      </a>{' '}
      and acknowledge that you have read and understand the{' '}
      <a href="/" className="font-bold text-primary-900 no-underline">
        Privacy Policy
      </a>
      .
    </span>
  </div>
);

export default Consent;
