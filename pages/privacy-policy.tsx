import MarkdownLayout from '@components/organisms/Layout/MarkdownLayout';
import PrivacyPolicy from 'assets/text/privacy-policy.md';
import ReactMarkdown from 'react-markdown';

const PrivacyPolicyPage = () => (
  <MarkdownLayout>
    <ReactMarkdown>{PrivacyPolicy}</ReactMarkdown>
  </MarkdownLayout>
);

export default PrivacyPolicyPage;
