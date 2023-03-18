import Button from '@components/atoms/Button/Button';
import { Typography } from '@components/atoms/Typography/Typography';
import { useDashboardContext } from '@providers/dashboard.context';
import { useRecipientContext } from '@providers/recipient.context';
import { useTokenContext } from '@providers/token.context';
import axios from 'axios';
import useChainVestingContracts from 'hooks/useChainVestingContracts';
import Image from 'next/image';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { IRecipientData } from 'types/models/recipient';
import { PUBLIC_DOMAIN_NAME } from 'utils/constants';

import RecipientRow from './RecipientRow';

enum IStatus {
  ALL = 'ALL',
  DELIVERED = 'Delivered',
  ACCEPTED = 'Accepted',
  EXPIRED = 'Expired'
}

export const sendRecipientInvite = async (
  recipients: {
    email: string;
    name: string;
    orgId?: string;
    memberId: string;
  }[],
  symbol: string
): Promise<void> => {
  //TODO: extract api calls
  await axios.post(`${PUBLIC_DOMAIN_NAME}/api/email/recipient-invite`, {
    recipients: recipients,
    symbol: symbol
  });
};
export const isExpired = (timestamp: number | undefined) =>
  timestamp ? Math.floor(new Date().getTime() / 1000) - timestamp >= 3600 * 24 : true;

export default function VestingContract() {
  const [filter, setFilter] = useState<{
    keyword: string;
    status: IStatus;
  }>({ keyword: '', status: IStatus.ALL });
  const { recipients: initialRecipients } = useRecipientContext();
  const [recipients, setRecipients] = useState<IRecipientData[]>(initialRecipients);
  const { vestingContracts, vestings } = useDashboardContext();
  const { vestingSchedules: vestingSchedulesInfo } = useChainVestingContracts(vestingContracts, vestings);
  const [allChecked, setAllChecked] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const { mintFormState } = useTokenContext();

  useEffect(() => {
    setRecipients(initialRecipients);
  }, [initialRecipients]);

  const filteredRecipients = useMemo(() => {
    return recipients.filter((recipient) => {
      if (
        filter.keyword &&
        !recipient.data.name?.toLowerCase().includes(filter.keyword.toLowerCase()) &&
        !recipient.data.email?.toLowerCase().includes(filter.keyword.toLowerCase())
      ) {
        return false;
      }

      if (filter.status === IStatus.ALL) {
        return true;
      } else if (filter.status === IStatus.ACCEPTED) {
        return recipient.data.status === 'accepted' && !recipient.data.walletAddress;
      } else if (filter.status === IStatus.DELIVERED) {
        return recipient.data.status === 'delivered' && !isExpired(recipient.data.updatedAt);
      } else {
        return recipient.data.status === 'delivered' && isExpired(recipient.data.updatedAt);
      }
    });
  }, [filter, recipients]);

  const filteredCounts = useMemo(() => {
    return {
      [IStatus.ALL]: recipients.length,
      [IStatus.ACCEPTED]: recipients.filter(
        (recipient) => recipient.data.status === 'accepted' && !recipient.data.walletAddress
      ).length,
      [IStatus.DELIVERED]: recipients.filter(
        (recipient) => recipient.data.status === 'delivered' && !isExpired(recipient.data.updatedAt)
      ).length,
      [IStatus.EXPIRED]: recipients.filter(
        (recipient) => recipient.data.status === 'delivered' && isExpired(recipient.data.updatedAt)
      ).length
    };
  }, [recipients]);

  const onRecipientChecked = (checked: boolean, id: string) => {
    const newRecipients = recipients.map((recipient) => {
      if (recipient.id === id) {
        return {
          ...recipient,
          checked
        };
      }
      return recipient;
    });
    setRecipients(newRecipients);
    if (checked && !allChecked) {
      setAllChecked(true);
    }
    if (!checked) {
      if (recipients.filter((recipient) => recipient.checked).length <= 1) {
        setAllChecked(false);
      }
    }
  };

  const getSelectedRecipients = () => recipients.filter((recipient) => recipient.checked);

  const setAllCheck = (checked: boolean) => {
    const newRecipients = recipients.map((recipient) => {
      return {
        ...recipient,
        checked
      };
    });
    setAllChecked(checked);
    setRecipients(newRecipients);
  };

  const sendBatchEmail = async () => {
    if (isInviting) return;
    setIsInviting(true);
    const inviteRecipients = recipients
      .filter((recipient) => recipient.checked)
      .map((recipient) => ({
        email: recipient.data.email,
        orgId: recipient.data.organizationId || '',
        name: recipient.data.name || '',
        memberId: recipient.id
      }));
    try {
      await sendRecipientInvite(inviteRecipients, mintFormState.symbol);
      toast.success('Invited recipients successfully');
    } catch (err) {
      toast.error('Something went wrong');
    }
    setIsInviting(false);
  };

  return (
    <div className="w-full">
      <div className="mb-9">
        <Typography size="title" variant="inter" className=" font-semibold text-neutral-900 ">
          Recipients
        </Typography>
      </div>

      <div className="w-full flex items-center gap-4">
        <div className="flex-grow flex items-center gap-2 px-5 py-2 bg-white border border-gray-100 rounded-lg">
          <div className="w-5 h-5 relative">
            <Image src="/icons/search.svg" layout="fill" />
          </div>
          <input
            className="w-full outline-none bg-transparent"
            placeholder="Search"
            value={filter.keyword}
            onChange={(e) => setFilter({ ...filter, keyword: e.target.value })}
          />
        </div>
      </div>

      <div className="mt-5 w-full flex justify-between flex-wrap gap-3">
        <div className="inline-flex border border-[hsl(217,16%,84%)] rounded-lg overflow-hidden">
          {Object.values(IStatus).map((status) => {
            return (
              <div
                key={status}
                className={`px-4 py-3 bg-white border-r border-[#d0d5dd] text-sm text-[#1d2939] cursor-pointer hover:bg-[#eaeaea] ${
                  filter.status === status ? 'bg-[#eaeaea]' : ''
                }`}
                onClick={() => {
                  setFilter({
                    ...filter,
                    status: status
                  });
                }}>
                {status}
                {status !== IStatus.ALL && (
                  <div
                    className={`avatar  bg-primary-50 text-primary-500 ml-3
                 w-5 h-5`}>
                    {filteredCounts && filteredCounts[status]}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div>
          <Typography variant="inter" className="text-center text-[#1b369a] font-medium mr-4" size="base">
            {getSelectedRecipients().length ? `${getSelectedRecipients().length} Recipients selected` : ''}
          </Typography>
          <Button
            type="button"
            loading={isInviting}
            className="px-5 bg-secondary-900 border border-secondary-900 rounded-8 p-1"
            onClick={() => sendBatchEmail()}>
            <Typography className="text-center text-white font-medium" size="base">
              Resend Email
            </Typography>
          </Button>
        </div>
      </div>

      <div className="border border-[#d0d5dd] rounded-xl w-full overflow-hidden mt-3">
        <div className="flex bg-[#f2f4f7] text-[#475467] text-xs">
          <div className="w-16 py-3 pl-3">
            <input type="checkbox" checked={allChecked} onChange={(e) => setAllCheck(e.target.checked)} />
          </div>
          <div className="w-36 py-3">Name</div>
          <div className="w-52 py-3">E-mail Address</div>
          <div className="w-52 py-3">Wallet Address</div>
          <div className="w-40 py-3">Date Email sent</div>
          <div className="w-32 py-3">Email status</div>
          <div className="w-40 py-3">Total locked</div>
          <div className="w-40 py-3">Total allocation</div>
          <div className="min-w-[200px] flex-grow py-3"></div>
        </div>

        {filteredRecipients?.map((recipient) => (
          <RecipientRow
            key={recipient.id}
            recipient={recipient}
            vestingSchedulesInfo={vestingSchedulesInfo}
            setCheck={onRecipientChecked}
            symbol={mintFormState.symbol}
          />
        ))}
      </div>
    </div>
  );
}
