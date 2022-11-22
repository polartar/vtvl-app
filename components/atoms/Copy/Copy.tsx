import { useEffect, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

interface CopyProps {
  text: string;
  children: any;
}

const Copy = ({ text, children }: CopyProps) => {
  const [copied, setCopied] = useState(false);

  // Display the copied notification for 2 seconds only.
  useEffect(() => {
    if (copied === true) {
      setTimeout(() => setCopied(false), 2000);
    }
  });
  return (
    <CopyToClipboard text={text} onCopy={() => setCopied(true)}>
      <div className="cursor-pointer relative">
        {children}
        {copied ? (
          <div className="absolute z-50 -bottom-2 text-center w-full">
            <span className="inline-block bg-white rounded-full shadow-lg py-2 px-3 opacity-95 text-sm">Copied!</span>
          </div>
        ) : null}
      </div>
    </CopyToClipboard>
  );
};

export default Copy;
