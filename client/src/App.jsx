import { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'

import { useAtom, useSetAtom } from 'jotai'
import { useAtomValue } from 'jotai/utils'
import {
    web3ProviderAtom,
    networkIdAtom,
    tokenFarmContractAtom,
    tokenFarmContractWriteAtom,
    stakableTokenContractAtom,
    accountDaiBalanceAtom,
    accountDappBalanceAtom,
    accountStakesAtom,
    accountStakesWriteAtom,
    stakeAmountAtom,
    stakeIndexToWithdrawAtom,
    interestAmountAtom,
    interestPercentAtom,
} from './state'

import DaiTokenLogo from 'cryptocurrency-icons/svg/color/dai.svg'
import GenericTokenLogo from 'cryptocurrency-icons/svg/color/generic.svg'
import ConnectButton from './components/wallet/ConnectButton'
import useWallet from './hooks/useWallet'
import useToggle from './hooks/useToggle'

import { ethers } from 'ethers'

export default function App() {
    // Handle modal display
    const { flag: showStakingModal, toggleFlag: toggleStakingModalShow } = useToggle()
    const { flag: stakingInProgress, toggleFlag: toggleStakingProgress } = useToggle()

    const { flag: showWithdrawModal, toggleFlag: toggleWithdrawModalShow } = useToggle()
    const { flag: withdrawInProgress, toggleFlag: toggleWithdrawProgress } = useToggle()

    const { onAccountChange } = useWallet()

    const web3Provider = useAtomValue(web3ProviderAtom)
    const networkId = useAtomValue(networkIdAtom)
    const tokenFarmContract = useAtomValue(tokenFarmContractAtom)
    const setTokenFarmContract = useSetAtom(tokenFarmContractWriteAtom)
    const stakableTokenContract = useAtomValue(stakableTokenContractAtom)
    const accountDaiBalance = useAtomValue(accountDaiBalanceAtom)
    const accountDappBalance = useAtomValue(accountDappBalanceAtom)
    const accountStakes = useAtomValue(accountStakesAtom)
    const setStakes = useSetAtom(accountStakesWriteAtom)

    const [stakeAmount, setStakeAmount] = useAtom(stakeAmountAtom)
    const [stakeIndexToWithdraw, setStakeIndexToWithdraw] = useAtom(stakeIndexToWithdrawAtom)
    const [interestAmount, setInterestAmount] = useAtom(interestAmountAtom)
    const [interestPercent, setInterestPercent] = useAtom(interestPercentAtom)

    // Handle contract loading
    useEffect(() => {
        setTokenFarmContract(networkId)
    }, []) // Only execute on component mount

    // Handle chain change
    useEffect(() => {
        const onChainChange = (newNetwork) => {
            setContract(newNetwork.chainId)
        }

        web3Provider.on('network', onChainChange)

        // remove listener when the component is unmounted
        return () => {
            web3Provider.removeAllListeners('network')
        }
    }, []) // Only execute on component mount

    // Handle account change
    useEffect(() => {
        // checker réponse à mon comm https://ethereum.stackexchange.com/questions/102078/detecting-accountschanged-and-chainchanged-with-ethersjs
        web3Provider.provider.on('accountsChanged', onAccountChange)

        // remove all listeners when the component is unmounted
        return () => {
            web3Provider.provider.removeAllListeners('accountsChanged')
        }
    }, [])

    // Handle TokenFarm events
    useEffect(() => {
        if (tokenFarmContract === null) {
            return
        }

        // @see https://github.com/ethers-io/ethers.js/issues/1504#issuecomment-826140461
        tokenFarmContract.on('Staked', (sender, timestamp, amount) => {
            console.log(`Staked by #${sender}, on ${timestamp}, with ${amount}`)
            setStakes()

            toast.success('Coins staked, Congratulations !')
            toggleStakingProgress()
            toggleStakingModalShow()
            setStakeAmount(0)
        })

        tokenFarmContract.on('Unstaked', (sender, timestamp, reward) => {
            console.log(`Unstaked by #${sender}, on ${timestamp}, with reward ${reward}`)
            setStakes()

            toast.success('Coins unstaked, Congratulations !')
            toggleWithdrawProgress()
            toggleWithdrawModalShow()
        })

        // remove all listeners when the component is unmounted
        return () => {
            tokenFarmContract.removeAllListeners('Staked')
            tokenFarmContract.removeAllListeners('Unstaked')
        }
    }, [tokenFarmContract])

    const increaseStakeAmount = () => {
        if (accountDaiBalance === 0) {
            return
        }

        const newAmount =
            stakeAmount + 10 <= accountDaiBalance ? stakeAmount + 10 : accountDaiBalance

        setStakeAmount(newAmount)
    }

    const updateStakeAmount = (event) => {
        const newAmount = isNaN(event.target.value) ? stakeAmount : Number(event.target.value)

        setStakeAmount(newAmount <= accountDaiBalance ? newAmount : stakeAmount)
    }

    const decreaseStakeAmount = () => {
        const newAmount = stakeAmount - 10 <= 0 ? 0 : stakeAmount - 10
        setStakeAmount(newAmount)
    }

    const stake = async () => {
        toggleStakingProgress()

        try {
            const stakeAmounWei = ethers.utils.parseEther(stakeAmount.toString())
            await stakableTokenContract.approve(tokenFarmContract.address, stakeAmounWei)

            const allowedTokenAddress = await tokenFarmContract.allowedToken()
            await tokenFarmContract.stake(stakeAmounWei.toString(), allowedTokenAddress)
        } catch (err) {
            toast.error(`Staking attempt failed : ${err.message}`)
            toggleStakingProgress()
        }
    }

    const onWithdrawClick = async (index) => {
        setStakeIndexToWithdraw(index)
        await computeInterest(index)
        toggleWithdrawModalShow()
    }

    const computeInterest = async (index) => {
        const amount = accountStakes[index].amount
        const weiAmount = ethers.utils.parseEther(amount.toString())

        const since = Math.floor(accountStakes[index].since / 1000)
        const now = Math.floor(Date.now() / 1000)

        const interest = await tokenFarmContract.computeStakeInterest(weiAmount, since, now)

        const formattedInterest = ethers.utils.formatEther(interest)
        const interestPercent = (formattedInterest * 100) / amount

        setInterestAmount(formattedInterest)
        setInterestPercent(interestPercent)
    }

    const withdraw = async () => {
        toggleWithdrawProgress()

        console.log('withdraw', stakeIndexToWithdraw)

        try {
            const stakeAmounWei = ethers.utils.parseEther(stakeAmount.toString())
            await stakableTokenContract.approve(tokenFarmContract.address, stakeAmounWei)

            const allowedTokenAddress = await tokenFarmContract.allowedToken()
            await tokenFarmContract.stake(stakeAmounWei.toString(), allowedTokenAddress)
        } catch (err) {
            toast.error(`Staking attempt failed : ${err.message}`)
            toggleStakingProgress()
        }
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-yellow-200">
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 5000,
                }}
            />

            <ConnectButton tokenFarmInstance={tokenFarmContract} />

            <section className="bg-white rounded-3xl border shadow-xl p-8 pt-4 w-2/6 mb-6">
                <header className="flex justify-between mb-4">
                    <div className="flex items-center">
                        <small className="font-semibold text-gray-400">Balance</small>
                        <div className="flex items-center bg-[#f4b731] text-white rounded-full mx-2">
                            <img src={DaiTokenLogo} className="inline ml-2" />
                            <span className="ml-1 mr-3">{accountDaiBalance}</span>
                        </div>

                        <h2 className="font-semibold text-gray-400 mr-2">DAI</h2>

                        <button
                            onClick={accountDaiBalance > 0 ? toggleStakingModalShow : undefined}
                            className={
                                accountDaiBalance > 0 ? 'cursor-pointer' : 'cursor-not-allowed'
                            }
                        >
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill={accountDaiBalance > 0 ? '#2824b6' : '#9ca3af'}
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M6 13C6 12.5926 6.36925 11.9034 7.44721 11.3644L6.55279 9.57556C5.15075 10.2766 4 11.5075 4 13C4 13.1414 4.01013 13.278 4.02953 13.41H4V16.91C4 18.5056 5.293 19.5266 6.66188 20.1009C8.08997 20.7 9.98275 21 12 21C14.0172 21 15.91 20.7 17.3381 20.1009C18.707 19.5266 20 18.5056 20 16.91V13.41H19.9705C19.9899 13.278 20 13.1414 20 13C20 11.5075 18.8492 10.2766 17.4472 9.57556L16.5528 11.3644C17.6308 11.9034 18 12.5926 18 13C18 13.3229 17.7438 13.8277 16.5784 14.2959C15.4724 14.7403 13.8615 15 12 15C10.1385 15 8.52764 14.7403 7.42156 14.2959C6.25622 13.8277 6 13.3229 6 13ZM18 15.8375V16.91C18 17.2445 17.728 17.7684 16.5644 18.2566C15.46 18.72 13.8528 19 12 19C10.1472 19 8.54003 18.72 7.43562 18.2566C6.272 17.7684 6 17.2445 6 16.91V15.8375C6.21976 15.9552 6.44703 16.0597 6.67594 16.1517C8.10236 16.7248 9.99151 17 12 17C14.0085 17 15.8976 16.7248 17.3241 16.1517C17.553 16.0597 17.7802 15.9552 18 15.8375Z"></path>
                                <path d="M13 8.9978L15.5578 6.30676L17.0075 7.68465L11.9998 12.9531L6.99219 7.68465L8.44182 6.30676L11 8.99815V3H13V8.9978Z"></path>
                            </svg>
                        </button>
                    </div>

                    <div className="flex items-center">
                        <small className="font-semibold text-gray-400">Reward token</small>

                        <div className="flex items-center bg-[#f4b731] text-white rounded-full mx-2">
                            <img src={GenericTokenLogo} className="inline ml-2" />
                            <span className="ml-1 mr-3">{accountDappBalance}</span>
                        </div>

                        <h2 className="font-semibold text-gray-400">DAPP</h2>
                    </div>
                </header>
                <main>
                    {accountStakes.length > 0 ? (
                        <table className="table-auto w-full">
                            <thead className="text-xs font-semibold uppercase text-gray-400 bg-gray-50">
                                <tr>
                                    <th className="p-2 whitespace-nowrap font-semibold text-left">
                                        Date
                                    </th>
                                    <th className="p-2 whitespace-nowrap font-semibold text-left">
                                        Amount
                                    </th>
                                    <th className="p-2 whitespace-nowrap font-semibold text-right">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-gray-100">
                                {accountStakes.map((stake, index) => (
                                    <tr key={index}>
                                        <td className="p-2 whitespace-nowrap">
                                            <div className="text-left">
                                                {stake.since.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="p-2 whitespace-nowrap">
                                            <div className="text-left font-medium text-green-500">
                                                {stake.amount}
                                            </div>
                                        </td>
                                        <td className="p-2 text-right">
                                            <button
                                                onClick={() => {
                                                    onWithdrawClick(index)
                                                }}
                                            >
                                                <svg
                                                    width="24"
                                                    height="24"
                                                    className="inline"
                                                    viewBox="0 0 24 24"
                                                    fill="#2824b6"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        clipRule="evenodd"
                                                        d="M8.45018 9.67033L10.9976 6.97259L10.9976 12.9983H12.9976V6.97179L15.5459 9.67033L17 8.2972L11.998 3.00015L6.99605 8.2972L8.45018 9.67033ZM7.44721 11.3007C6.36925 11.8432 6 12.5369 6 12.9471C6 13.2721 6.25622 13.7802 7.42156 14.2515C8.52764 14.6988 10.1385 14.9603 12 14.9603C13.8615 14.9603 15.4724 14.6988 16.5784 14.2515C17.7438 13.7802 18 13.2721 18 12.9471C18 12.5369 17.6308 11.8432 16.5528 11.3007L17.4472 9.49997C18.8492 10.2056 20 11.4446 20 12.9471C20 13.0894 19.9899 13.227 19.9705 13.3599H20V16.883C20 18.4891 18.707 19.5169 17.3381 20.095C15.91 20.6981 14.0172 21 12 21C9.98275 21 8.08997 20.6981 6.66188 20.095C5.293 19.5169 4 18.4891 4 16.883V13.3599H4.02954C4.01013 13.227 4 13.0894 4 12.9471C4 11.4446 5.15075 10.2056 6.55279 9.49997L7.44721 11.3007ZM17.3241 16.1196C17.553 16.027 17.7802 15.9218 18 15.8033V16.883C18 17.2196 17.728 17.7471 16.5644 18.2385C15.46 18.7049 13.8528 18.9868 12 18.9868C10.1472 18.9868 8.54003 18.7049 7.43562 18.2385C6.272 17.7471 6 17.2196 6 16.883V15.8033C6.21976 15.9218 6.44703 16.027 6.67594 16.1196C8.10236 16.6965 9.99151 16.9735 12 16.9735C14.0085 16.9735 15.8976 16.6965 17.3241 16.1196Z"
                                                    ></path>
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>You didn't stake yet.</p>
                    )}
                </main>
            </section>

            {showStakingModal ? (
                <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                        <div className="flex justify-end p-2">
                            <button
                                onClick={toggleStakingModalShow}
                                type="button"
                                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white"
                                data-modal-toggle="authentication-modal"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    ></path>
                                </svg>
                            </button>
                        </div>
                        <form className="px-6 pb-4 space-y-6 lg:px-8 sm:pb-6 xl:pb-8">
                            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                                Stake
                            </h3>

                            <div className="flex flex-row h-10 w-full rounded-lg relative bg-white mt-1">
                                <button
                                    onClick={decreaseStakeAmount}
                                    className="border-2 border-gray-400 h-full w-20 rounded-l cursor-pointer outline-none"
                                >
                                    <span className="m-auto text-2xl font-thin">−</span>
                                </button>
                                <input
                                    onChange={updateStakeAmount}
                                    type="text"
                                    value={stakeAmount}
                                    className="border-y-2 border-gray-400 text-center w-full font-semibold text-md hover:text-black focus:text-black  md:text-basecursor-default flex items-center text-gray-700  outline-none"
                                />
                                <button
                                    onClick={increaseStakeAmount}
                                    className="border-2 border-gray-400 text-gray-600 h-full w-20 rounded-r cursor-pointer"
                                >
                                    <span className="m-auto text-2xl font-thin">+</span>
                                </button>
                            </div>

                            <table className="min-w-full">
                                <tbody>
                                    <tr className="border-b">
                                        <td className="text-sm text-gray-500 dark:text-gray-300 font-light py-2 whitespace-nowrap">
                                            Reward frequency
                                        </td>
                                        <td className="text-sm text-right text-gray-500 dark:text-gray-300 font-light py-2 whitespace-nowrap">
                                            Every hour
                                        </td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="text-sm text-gray-500 dark:text-gray-300 font-light py-2 whitespace-nowrap">
                                            Reward estimate
                                        </td>
                                        <td className="text-sm text-right text-gray-500 dark:text-gray-300 font-light py-2 whitespace-nowrap">
                                            0.01%
                                        </td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="text-sm text-gray-500 dark:text-gray-300 font-light py-2 whitespace-nowrap">
                                            Minimum staking amount
                                        </td>
                                        <td className="text-sm text-right text-gray-500 dark:text-gray-300 font-light py-2 whitespace-nowrap">
                                            1 DAI
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <p className="text-gray-500 dark:text-gray-300 font-semibold">
                                Your coins will be transfered to your staking account.
                            </p>

                            {stakingInProgress ? (
                                <button
                                    type="button"
                                    className="w-full flex justify-center text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                    disabled="disabled"
                                >
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Processing...
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    onClick={stake}
                                    className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                >
                                    Stake
                                </button>
                            )}
                        </form>
                    </div>
                </div>
            ) : null}

            {showWithdrawModal ? (
                <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700 w-full max-w-md h-full md:h-auto">
                        <div className="flex justify-end p-2">
                            <button
                                onClick={toggleWithdrawModalShow}
                                type="button"
                                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white"
                                data-modal-toggle="authentication-modal"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    ></path>
                                </svg>
                            </button>
                        </div>
                        <form className="px-6 pb-4 space-y-6 lg:px-8 sm:pb-6 xl:pb-8">
                            <h3 className="mb-2 text-xl font-medium text-gray-900 dark:text-white">
                                Withdraw
                            </h3>

                            <h4 className="font-medium text-gray-900 dark:text-white">
                                Estimated DAI profit :
                                <span className="text-green-500 ml-2">+{interestAmount}</span>
                                <span className="text-sm text-green-500 ml-1">
                                    ({interestPercent}%)
                                </span>
                            </h4>

                            <p className="text-gray-500 dark:text-gray-300 font-semibold">
                                Once your tokens will be unstaked, they will be transfered to your
                                personnal account.
                            </p>

                            {withdrawInProgress ? (
                                <button
                                    type="button"
                                    className="w-full flex justify-center text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                    disabled="disabled"
                                >
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Processing...
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    onClick={withdraw}
                                    className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                >
                                    Withdraw {accountStakes[stakeIndexToWithdraw].amount} DAI
                                </button>
                            )}
                        </form>
                    </div>
                </div>
            ) : null}
        </div>
    )
}
