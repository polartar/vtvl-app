export interface Owner {
    name: string
    walletAddress: string
    chainId?: number
    email?: string
}

export interface Safe {
    address: string
    chainId: number
    owners: [Owner]
    threshold: number
}