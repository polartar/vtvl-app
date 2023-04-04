import { IRecipientDoc } from 'types/models';

import SummaryRecipientRow from './SummaryRecipientRow';

const VestingSummaryTable = ({ recipients }: { recipients: IRecipientDoc[] }) => {
  return (
    <div>
      <div className="flex text-[#475467] text-xs w-full border-2">
        <div className=" w-36 p-3 flex-shrink-0 bg-[#f2f4f7]">Name</div>
        <div className="w-36 p-3 flex-shrink-0 bg-[#f2f4f7]">Status</div>
        <div className="w-36 p-3 flex-shrink-0 bg-[#f2f4f7]">Updated On</div>
        <div className=" w-full p-3   bg-[#f2f4f7]">Confirmation</div>
      </div>
      {recipients
        ?.filter((recipient) => recipient.data.status === 'accepted' && !!recipient.data.walletAddress)
        .map((recipient) => {
          return <SummaryRecipientRow recipient={recipient} key={recipient.id} />;
        })}
    </div>
  );
};

export default VestingSummaryTable;
