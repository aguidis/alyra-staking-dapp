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

export const contractAtom = atom(null)
export const contractWriteAtom = atom(
    null, // it's a convention to pass `null` for the first argument
    (get, set, chainId) => {
        const provider = get(providerAtom)

        let contract = null

        if (chainId in TokenFarmArtifact.networks) {
            const contractAddress = TokenFarmArtifact.networks[chainId]

            const signer = provider.getSigner()

            contract = new ethers.Contract(contractAddress, TokenFarmArtifact.abi, signer)
        }

        set(contractAtom, contract)
    },
)

export const loggedInAccountAtom = atom(null)
export const accountBalanceAtom = atom(0)
export const accountDaiBalanceAtom = atom(0)
export const accountDappBalanceAtom = atom(0)

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
