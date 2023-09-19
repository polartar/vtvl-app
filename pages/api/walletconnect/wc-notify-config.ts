export default function handler(req: any, res: any) {
  res.setHeader('Cache-control', 's-maxage=6000, stale-while-revalidate=30');
  res.setHeader('Content-type', 'application/json');
  res.status(200).end({
    schemaVersion: 1,
    types: [
      { name: 'promotional', description: 'Get notified when new features or products are launched' },
      { name: 'transactional', description: 'Get notified when new on-chain transactions target your account' },
      { name: 'private', description: 'Get notified when new updates or offers are sent privately to your account' },
      { name: 'alerts', description: 'Get notified when urgent action is required from your account' }
    ],
    name: 'VTVL',
    icons: ['https://imagedelivery.net/_aTEfDRm7z3tKgu9JhfeKA/839f0ac6-25ee-412b-e646-610e93440d00/md'],
    description:
      'VTVL: Simple, Powerful Web3 Token Vesting\n\nOur token vesting platform simplifies your vesting process and cap table management.'
  });
}
