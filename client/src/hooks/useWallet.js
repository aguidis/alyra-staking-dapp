import { ethers } from 'ethers'

import { useAtom, useSetAtom } from 'jotai'
import { useAtomValue } from 'jotai/utils'

import {
    web3ProviderAtom,
    loggedInAccountAtom,
    accountBalanceAtom,
    accountBalanceWriteAtom,
    accountDaiBalanceWriteAtom,
    accountDappBalanceWriteAtom,
    accountStakesWriteAtom,
} from '../state'

const useWallet = () => {
    const web3Provider = useAtomValue(web3ProviderAtom)
    const [account, setAccount] = useAtom(loggedInAccountAtom)
    const balance = useAtomValue(accountBalanceAtom)
    const setBalance = useSetAtom(accountBalanceWriteAtom)
    const setDaiBalance = useSetAtom(accountDaiBalanceWriteAtom)
    const setDappBalance = useSetAtom(accountDappBalanceWriteAtom)
    const setStakes = useSetAtom(accountStakesWriteAtom)

    async function connectWallet() {
        try {
            // MetaMask requires requesting permission to connect users accounts
            await web3Provider.send('eth_requestAccounts', [])

            const accounts = await web3Provider.listAccounts()
            const account = accounts[0]

            setAccount(account)
            setBalance()
            setDaiBalance()
            setDappBalance()
            setStakes()
        } catch (err) {
            if (err.code === 4001) {
                // EIP-1193 userRejectedRequest error
                // If this happens, the user rejected the connection request.
                console.log('Please connect to MetaMask.')
            } else if (err.code === -32002) {
                console.log('Please unlock MetaMask.')
            } else {
                console.error(err)
            }
        }
    }

    const onAccountChange = async (accounts) => {
        if (accounts.length === 0) {
            // MetaMask is locked or the user has not connected any accounts
            alert('Please connect to MetaMask.')
        } else if (accounts[0] !== account) {
            const account = ethers.utils.getAddress(accounts[0])

            setAccount(account)
            setBalance()
            setDaiBalance()
            setDappBalance()
            setStakes()
        }
    }

    const updateAssetsBalance = () => {
        setBalance()
        setDaiBalance()
        setDappBalance()
        setStakes()
    }

    return {
        web3,
        account,
        balance,
        connectWallet,
        updateAssetsBalance,
        onAccountChange,
    }
}

export default useWallet
