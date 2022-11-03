import MarkdownLayout from '@components/organisms/Layout/MarkdownLayout';
import TermsAndConditions from 'assets/text/terms-and-conditions.md';
import ReactMarkdown from 'react-markdown';

const TermsOfService = () => (
  <MarkdownLayout>
    <ReactMarkdown>{TermsAndConditions}</ReactMarkdown>
  </MarkdownLayout>
);

export default TermsOfService;
