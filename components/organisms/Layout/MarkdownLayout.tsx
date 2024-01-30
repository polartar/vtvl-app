import BackButton from '@components/atoms/BackButton/BackButton';
import ArrowIcon from 'public/icons/arrow-small-left.svg';
import { useRef } from 'react';

const MarkdownLayout = (props: any) => {
  const markdownLayout = useRef(null);
  const handleClickTop = () => {
    window.scrollTo(0, 0);
    console.log('Window object', window);
    // if (markdownLayout && markdownLayout.current) {
    //   markdownLayout.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // }
  };
  return (
    <div ref={markdownLayout} className="markdown-content p-6 text-left relative">
      <BackButton label="Back" href="/onboarding/sign-up" />
      {props.children}
      <BackButton label="Back" href="/onboarding/sign-up" />
      <div className="fixed bottom-10 right-10 z-50 text-sm text-neutral-500 cursor-pointer" onClick={handleClickTop}>
        <div className="animate-bounce">
          <ArrowIcon className="h-6 w-6 transform rotate-90 mb-2" />
        </div>
        Top
      </div>
    </div>
  );
};

export default MarkdownLayout;
