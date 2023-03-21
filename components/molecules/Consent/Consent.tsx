import { useGlobalContext } from '@providers/global.context';
import { useEffect, useState } from 'react';
import { WEBSITE_NAME } from 'utils/constants';

interface ConsentProps {
  variant?: 'default' | 'check';
  className?: string;
  checked?: boolean;
  onAgree?: (checked: any) => void;
}

const Consent = ({ variant = 'default', className = '', onAgree = (e) => {} }: ConsentProps) => {
  const {
    website: { name, links }
  } = useGlobalContext();
  const [agree, setAgree] = useState(false);
  useEffect(() => {
    onAgree(agree);
  }, [agree]);
  return (
    <div className={`text-xs text-neutral-600 font-medium leading-5 ${className}`}>
      {variant === 'check' ? (
        <div className="flex flex-row items-start gap-2 justify-center max-w-xs mx-auto">
          <label
            className={`cursor-pointer flex items-center justify-center w-4 h-4 mt-0.5 rounded-full border border-primary-900 overflow-hidden flex-shrink-0 ${
              agree ? 'bg-primary-900' : ' bg-primary-50'
            }`}>
            {agree ? <img src="/icons/check.svg" alt="Agree" className="w-3 mt-px" /> : null}
            <input
              type="checkbox"
              name="agree"
              className="opacity-0 absolute top-10"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
          </label>
          <div>
            I agree to {name || WEBSITE_NAME}{' '}
            <a href={links?.terms || 'https://vtvl.io/terms'} target="_blank" title="Terms and Conditions">
              <span className="cursor-pointer font-bold text-primary-900 no-underline">Terms of Service</span>
            </a>{' '}
            and acknowledge that I have read and understand the{' '}
            <a href={links?.privacy || 'https://vtvl.io/privacypolicy'} target="_blank" title="Privacy Policy">
              <span className="cursor-pointer font-bold text-primary-900 no-underline">Privacy Policy</span>
            </a>
            .
          </div>
        </div>
      ) : (
        <span>
          By connecting a wallet, you agree to {name || WEBSITE_NAME}{' '}
          <a href={links?.terms || 'https://vtvl.io/terms'} target="_blank" title="Terms and Conditions">
            <span className="cursor-pointer font-bold text-primary-900 no-underline">Terms of Service</span>
          </a>{' '}
          and acknowledge that you have read and understand the{' '}
          <a href={links.privacy || 'https://vtvl.io/privacypolicy'} target="_blank" title="Privacy Policy">
            <span className="cursor-pointer font-bold text-primary-900 no-underline">Privacy Policy</span>
          </a>
          .
        </span>
      )}
    </div>
  );
};
export default Consent;
