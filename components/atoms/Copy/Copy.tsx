import CopyIcon from 'public/icons/copy-to-clipboard.svg';
import { useEffect, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

interface CopyProps {
  text: string;
  children: any;
  removeIcon?: boolean;
}

const Copy = ({ text, children, removeIcon = false }: CopyProps) => {
  const [copied, setCopied] = useState(false);

  // Display the copied notification for 2 seconds only.
  useEffect(() => {
    if (copied === true) {
      setTimeout(() => setCopied(false), 400);
    }
  }, [copied]);

  return (
    <CopyToClipboard text={text} onCopy={() => setCopied(true)}>
      <div className="cursor-pointer relative inline-flex flex-row items-center gap-2 group">
        {!removeIcon ? (
          <CopyIcon className="fill-current h-4 cursor-pointer transform-gpu transition-all group-hover:-translate-y-px group-hover:text-secondary-900" />
        ) : null}
        {copied ? (
          <div className={`absolute z-50 -bottom-2 w-full ${!removeIcon ? 'text-right -right-7' : 'text-center '}`}>
            <span className="inline-block bg-white rounded-full shadow-lg py-2 px-3 opacity-95 text-sm">Copied!</span>
          </div>
        ) : null}
        {children}
      </div>
    </CopyToClipboard>
  );
};

export default Copy;
