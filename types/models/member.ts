
export interface Address {
  walletAddress: string,
  chainId: number
}

export interface Member {
    userId: string
    fullName: string
    email: string
    wallet?: [Address]
    type: 'founder' | 'employee' | 'investor',
    status: 'invited' | 'signedUp'
}

export interface User {
    id: string
}