import { ethers } from 'ethers'
import { atom } from 'jotai'

import detectEthereumProvider from '@metamask/detect-provider'

import TokenFarmArtifact from './contracts/TokenFarm.json'
import IERC20Artifact from './contracts/IERC20.json'

import { addressEqual } from './helpers/address'

export const web3ProviderAtom = atom(async () => {
    const metamask = await detectEthereumProvider({
        mustBeMetaMask: true,
    })

    if (metamask === null) {
        throw new Error('Coucou pas metamask')
    }

    // The "any" network will allow spontaneous network changes
    return new ethers.providers.Web3Provider(metamask, 'any')
})

export const networkIdAtom = atom(async (get) => {
    const provider = get(web3ProviderAtom)
    const network = await provider.getNetwork()

    return network.chainId
})

export const tokenFarmContractAtom = atom(null)
export const stakableTokenContractAtom = atom(null)
export const tokenFarmContractWriteAtom = atom(
    null, // it's a convention to pass `null` for the first argument
    async (get, set, chainId) => {
        const provider = get(web3ProviderAtom)

        let tokenFarmContract = null
        let stakableTokenContract = null

        if (chainId in TokenFarmArtifact.networks) {
            const tokenFarmContractNetwork = TokenFarmArtifact.networks[chainId]
            const tokenFarmSigner = provider.getSigner()
            tokenFarmContract = new ethers.Contract(
                tokenFarmContractNetwork.address,
                TokenFarmArtifact.abi,
                tokenFarmSigner,
            )

            const stakableTokenContractAddress = await tokenFarmContract.allowedToken()
            const stakableTokenSigner = provider.getSigner()
            stakableTokenContract = new ethers.Contract(
                stakableTokenContractAddress,
                IERC20Artifact.abi,
                stakableTokenSigner,
            )
        }

        set(tokenFarmContractAtom, tokenFarmContract)
        set(stakableTokenContractAtom, stakableTokenContract)
    },
)

export const loggedInAccountAtom = atom(null)
export const accountBalanceAtom = atom(0)
export const accountDaiBalanceAtom = atom(0)
export const accountDappBalanceAtom = atom(0)
export const accountStakesAtom = atom([])

export const accountBalanceWriteAtom = atom(null, async (get, set) => {
    const provider = get(web3ProviderAtom)
    const loggedInAccount = get(loggedInAccountAtom)

    if (loggedInAccount === null) {
        set(accountBalanceAtom, 0)

        return
    }

    const balance = await provider.getBalance(loggedInAccount)

    const balanceEth = ethers.utils.formatEther(balance)
    const roundedBalance = Math.round(balanceEth * 1e4) / 1e4

    set(accountBalanceAtom, roundedBalance)
})

export const accountDaiBalanceWriteAtom = atom(null, async (get, set) => {
    const loggedInAccount = get(loggedInAccountAtom)
    const stakableTokenContract = get(stakableTokenContractAtom)

    if (loggedInAccount === null) {
        set(accountDaiBalanceAtom, 0)

        return
    }

    const balance = await stakableTokenContract.balanceOf(loggedInAccount)

    set(accountDaiBalanceAtom, parseInt(ethers.utils.formatEther(balance), 10))
})

export const accountDappBalanceWriteAtom = atom(null, async (get, set) => {
    const contract = get(tokenFarmContractAtom)
    const loggedInAccount = get(loggedInAccountAtom)

    if (loggedInAccount === null) {
        set(accountDappBalanceAtom, 0)

        return
    }

    const dappBalance = await contract.getDappTokenBalance()

    set(accountDappBalanceAtom, parseInt(ethers.utils.formatEther(dappBalance), 10))
})

export const accountStakesWriteAtom = atom(null, async (get, set) => {
    const contract = get(tokenFarmContractAtom)
    const loggedInAccount = get(loggedInAccountAtom)

    if (loggedInAccount === null) {
        set(accountStakesAtom, [])

        return
    }

    const stakes = await contract.getStakes({ from: loggedInAccount })

    const formattedStakes = stakes.map((stake) => {
        return {
            since: new Date(stake.since.toNumber() * 1000).toLocaleString(),
            amount: parseInt(ethers.utils.formatEther(stake.amount), 10),
        }
    })

    console.log('bg', formattedStakes)

    set(accountStakesAtom, formattedStakes)
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

export const stakeAmountAtom = atom(0)
