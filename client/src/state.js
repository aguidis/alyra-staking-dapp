import { atom } from 'jotai'

import Web3 from 'web3'
import detectEthereumProvider from '@metamask/detect-provider'
import tokenFarm from './contracts/TokenFarm.json'

import { addressEqual } from './helpers/address'

export const loggedInAccountAtom = atom(null)
export const accountDaiBalanceAtom = atom(0)
export const accountDappBalanceAtom = atom(0)

export const web3InstanceAtom = atom(async () => {
    const provider = await detectEthereumProvider()

    // Get network provider and web3 instance.
    const web3 = new Web3(provider)
    web3.eth.handleRevert = true

    return web3
})

export const tokenFarmContractAtom = atom(async (get) => {
    const web3 = get(web3InstanceAtom)
    const networkId = await web3.eth.net.getId()
    const deployedNetwork = tokenFarm.networks[networkId]

    return new web3.eth.Contract(tokenFarm.abi, deployedNetwork && deployedNetwork.address)
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

