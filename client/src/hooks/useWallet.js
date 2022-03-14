import { ethers } from 'ethers'

import { useAtom } from 'jotai'
import { useAtomValue } from 'jotai/utils'

import { web3InstanceAtom, loggedInAccountAtom, accountBalanceAtom } from '../state'

const useWallet = () => {
    const web3 = useAtomValue(web3InstanceAtom)
    const [account, setAccount] = useAtom(loggedInAccountAtom)
    const [balance, setBalance] = useAtom(accountBalanceAtom)

    async function connectWallet() {
        try {
            // A Web3Provider wraps a standard Web3 provider, which is
            // what MetaMask injects as window.ethereum into each page
            const provider = new ethers.providers.Web3Provider(window.ethereum)

            // MetaMask requires requesting permission to connect users accounts
            await provider.send('eth_requestAccounts', [])

            // TODO load tout cas dans state.js et gerer erreur avec error mes couilles boudaries

            // ethereum.enable(); (DEPRECATED), do instead :
            // @link https://docs.metamask.io/guide/ethereum-provider.html#ethereum-enable-deprecated
            // why returned accounts are lower cased ?
            // @link https://github.com/MetaMask/metamask-extension/issues/10671
            await window.ethereum.request({ method: 'eth_requestAccounts' })

            const accounts = await web3.eth.getAccounts()
            const balance = await web3.eth.getBalance(accounts[0])

            setAccount(accounts[0])
            setBalance(balance)
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
            const balance = await web3.eth.getBalance(accounts[0])

            setAccount(accounts[0])
            setBalance(balance)
        }
    }

    function logOut() {
        setAccount(null)
        setBalance(null)
    }

    return {
        web3,
        account,
        balance,
        connectWallet,
        onAccountChange,
        logOut,
    }
}

export default useWallet
