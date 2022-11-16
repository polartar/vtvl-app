import Link from 'next/link';
import { useState } from 'react';

interface ConsentProps {
  variant?: 'default' | 'minimal';
}

const Consent = ({ variant = 'default' }: ConsentProps) => {
  const [agree, setAgree] = useState(true);
  return (
    <div className="text-xs text-neutral-600 font-medium leading-5">
      {variant === 'minimal' ? (
        <div className="row-center justify-center">
          <label
            className={`cursor-pointer flex items-center justify-center w-5 h-5 rounded-full border border-primary-900 overflow-hidden ${
              agree ? 'bg-primary-900' : ' bg-primary-50'
            }`}>
            {agree ? <img src="/icons/check.svg" alt="Agree" /> : null}
            <input
              type="checkbox"
              name="agree"
              className="opacity-0 absolute top-10"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
          </label>
          <div>
            I agree to VTVL{' '}
            <Link href="/terms">
              <span className="cursor-pointer font-bold text-primary-900 no-underline">Terms</span>
            </Link>{' '}
            of use and{' '}
            <Link href="/">
              <span className="cursor-pointer font-bold text-primary-900 no-underline">Privacy</span>
            </Link>{' '}
            Statement
          </div>
        </div>
      ) : (
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
      )}
    </div>
  );
};
export default Consent;
