import { ethers } from 'ethers'
import { atom } from 'jotai'

import detectEthereumProvider from '@metamask/detect-provider'
import TokenFarmArtifact from './contracts/TokenFarm.json'

import { addressEqual } from './helpers/address'

export const providerAtom = atom(async () => {
    const metamask = await detectEthereumProvider({
        mustBeMetaMask: true,
    })

    if (metamask === null) {
        throw new Error('Coucou pas metamask')
    }

    return new ethers.providers.Web3Provider(metamask, 'any')
})

export const networkIdAtom = atom(async (get) => {
    const provider = get(providerAtom)
    const network = await provider.getNetwork()

    return network.chainId
})

export const contractAtom = atom((get) => {
    const provider = get(providerAtom)
    const networkId = get(networkIdAtom)
    const contractAddress = TokenFarmArtifact.networks[networkId]

    const signer = provider.getSigner()

    return new ethers.Contract(contractAddress, TokenFarmArtifact.abi, signer)
})

export const loggedInAccountAtom = atom(null)
export const accountBalanceAtom = atom(0)
export const accountDaiBalanceAtom = atom(0)
export const accountDappBalanceAtom = atom(0)

export const tokenFarmContractAtom = atom(async (get) => {
    // TODO avec ethers.js
})

export const contractOwnerAtom = atom(async (get) => {
    const contract = get(tokenFarmContractAtom)

    return await contract.methods.owner().call()
})

export const isOwnerAtom = atom((get) => {
    const contract = get(contractOwnerAtom)
    const account = get(loggedInAccountAtom)

    if (contract === null || account === null) {
        return false
    }

    return addressEqual(contract, account)
})
