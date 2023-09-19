export default function handler(req: any, res: any) {
  res.setHeader('Cache-control', 's-maxage=6000, stale-while-revalidate=30');
  res.setHeader('Content-type', 'application/json');
  res.status(200).end({
    '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/suites/jws-2020/v1'],
    id: 'did:web:app.vtvl.io',
    verificationMethod: [
      {
        id: 'did:web:app.vtvl.io#wc-notify-subscribe-key',
        type: 'JsonWebKey2020',
        controller: 'did:web:app.vtvl.io',
        publicKeyJwk: { kty: 'OKP', crv: 'X25519', x: '8GbcsmyCjZkEhtEN8n8MYIf_M8vbuVcWe3MMbDndWT0' }
      },
      {
        id: 'did:web:app.vtvl.io#wc-notify-authentication-key',
        type: 'JsonWebKey2020',
        controller: 'did:web:app.vtvl.io',
        publicKeyJwk: { kty: 'OKP', crv: 'Ed25519', x: 'vdbnwN4TClOFfW87LTMQXtlOR0wzZ2v2H38BOQznyFo' }
      }
    ],
    keyAgreement: ['did:web:app.vtvl.io#wc-notify-subscribe-key'],
    authentication: ['did:web:app.vtvl.io#wc-notify-authentication-key']
  });
}
