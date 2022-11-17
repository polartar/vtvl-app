import Input from '@components/atoms/FormControls/Input/Input';
import { NextPage } from 'next';

const MemberLoginPage: NextPage = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 max-w-2xl">
      <h1 className="text-neutral-900">Welcome to VTVL</h1>
      <p className="text-sm max-w-xl text-center text-neutral-500">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vitae iaculis nulla.
      </p>
      <div className="w-full my-6 panel flex flex-col items-center">
        <button className="line flex flex-row items-center justify-center gap-2.5 w-full">
          <img src="/icons/google.svg" alt="Google" className="w-8 h-8" />
          Sign in with Google
        </button>
        <div className="flex flex-row items-center justify-center gap-1 my-5">
          <hr className="border-t border-neutral-200 w-full grow" />
          <span className="shrink-0 grow text-xs font-medium text-neutral-400">Or signin with your email</span>
          <hr className="border-t border-neutral-200 w-full grow" />
        </div>
        <Input label="Your company email" required placeholder="Enter your company email adress" />
        <button className="secondary mt-5">Login</button>
        <hr className="border-t border-neutral-200 w-full my-5" />
        <span className="font-medium text-xs text-neutral-800">
          Can&apos;t find your access code? <span className="text-primary-900">Send a new code</span>
        </span>
      </div>
    </div>
  );
};

export default MemberLoginPage;
