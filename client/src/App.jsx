import { useEffect } from 'react'

import { useSetAtom } from 'jotai'
import { useAtomValue } from 'jotai/utils'
import { providerAtom, networkIdAtom, contractAtom, contractWriteAtom } from './state'

import DaiTokenLogo from 'cryptocurrency-icons/svg/color/dai.svg'
import GenericTokenLogo from 'cryptocurrency-icons/svg/color/generic.svg'
import ConnectButton from './components/wallet/ConnectButton'
import useToggle from './hooks/useToggle'

export default function App() {
    // Handle responsive menu
    const { flag: showStaking, toggleFlag: toggleMenu } = useToggle()

    const provider = useAtomValue(providerAtom)
    const networkId = useAtomValue(networkIdAtom)
    const contract = useAtomValue(contractAtom)
    const setContract = useSetAtom(contractWriteAtom)

    // Handle contract loading
    useEffect(() => {
        console.log('provider', provider)
        console.log('providnetworkIder', networkId)

        setContract(networkId)
    }, []) // Only execute on component mount

    // Handle chain change
    useEffect(() => {
        // The "any" network will allow spontaneous network changes
        provider.on('network', (newNetwork, oldNetwork) => {
            setContract(newNetwork.chainId)
        })
    }, []) // Only execute on component mount

    const stakingCard = (
        <>
            <main className="flex justify-between mb-4">
                <div className="flex items-center">
                    <div className="flex items-center bg-[#f4b731] text-white rounded-full mr-2">
                        <img src={DaiTokenLogo} className="inline ml-2" />
                        <span className="ml-1 mr-3">105</span>
                    </div>

                    <h1 className="font-semibold text-gray-400">DAI</h1>
                </div>

                <div className="text-right">
                    <span className="font-bold text-green-500">+ 3%</span>
                    <br />
                    <span className="font-medium text-xs text-gray-500 flex justify-end">
                        15 coin staked
                    </span>
                </div>
            </main>
            <footer className="flex justify-between">
                <div>
                    <h3 className="font-semibold text-sm text-gray-500">USD</h3>
                    <h1 className="font-semibold text-xl text-gray-700">$ 1,936.00</h1>
                </div>

                <button className="border-2 border-yellow-400 text-black px-4 py-2 rounded-md text-1xl font-medium hover:bg-yellow-400 transition duration-300">
                    Stake
                </button>
            </footer>
        </>
    )

    const rewardCard = (
        <>
            <main className="mb-4">
                <div className="flex items-center">
                    <div className="flex items-center bg-[#f4b731] text-white rounded-full mr-2">
                        <img src={GenericTokenLogo} className="inline ml-2" />
                        <span className="ml-1 mr-3">10</span>
                    </div>

                    <h1 className="font-semibold text-gray-400">DAPP</h1>
                </div>
            </main>
            <footer className="flex justify-between">
                <div>
                    <h3 className="font-semibold text-sm text-gray-500">USD</h3>
                    <h1 className="font-semibold text-xl text-gray-700">$ 125.00</h1>
                </div>

                <button className="border-2 border-yellow-400 text-black px-4 py-2 rounded-md text-1xl font-medium hover:bg-yellow-400 transition duration-300">
                    Convert
                </button>
            </footer>
        </>
    )

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-yellow-200">
            <ConnectButton farmTokenInstance={contract} />

            <section className="bg-white rounded-3xl border shadow-xl p-8 pt-4 w-2/6 mb-6">
                <header>
                    <ul className="flex justify-center -mb-px">
                        <li className="mr-2">
                            <a
                                href="#"
                                onClick={() => toggleMenu()}
                                className={`inline-flex py-4 px-4 text-sm font-medium text-center rounded-t-lg border-b-2 group ${showStaking &&
                                    'text-blue-600 border-blue-600 active dark:border-blue-500'
                                    }`}
                            >
                                <svg
                                    className={`mr-2 w-5 h-5 ${showStaking && 'text-blue-600 dark:text-blue-500'
                                        }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                                </svg>
                                Staking
                            </a>
                        </li>
                        <li>
                            <a
                                href="#"
                                onClick={() => toggleMenu()}
                                className={`inline-flex py-4 px-4 text-sm font-medium text-center rounded-t-lg border-b-2 group ${!showStaking &&
                                    'text-blue-600 border-blue-600 active dark:border-blue-500'
                                    }`}
                            >
                                <svg
                                    className={`mr-2 w-5 h-5 ${!showStaking && 'text-blue-600 dark:text-blue-500'
                                        }`}
                                    fill="currentColor"
                                    viewBox="0 0 576 512"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M572.1 82.38C569.5 71.59 559.8 64 548.7 64h-100.8c.2422-12.45 .1078-23.7-.1559-33.02C447.3 13.63 433.2 0 415.8 0H160.2C142.8 0 128.7 13.63 128.2 30.98C127.1 40.3 127.8 51.55 128.1 64H27.26C16.16 64 6.537 71.59 3.912 82.38C3.1 85.78-15.71 167.2 37.07 245.9c37.44 55.82 100.6 95.03 187.5 117.4c18.7 4.805 31.41 22.06 31.41 41.37C256 428.5 236.5 448 212.6 448H208c-26.51 0-47.99 21.49-47.99 48c0 8.836 7.163 16 15.1 16h223.1c8.836 0 15.1-7.164 15.1-16c0-26.51-21.48-48-47.99-48h-4.644c-23.86 0-43.36-19.5-43.36-43.35c0-19.31 12.71-36.57 31.41-41.37c86.96-22.34 150.1-61.55 187.5-117.4C591.7 167.2 572.9 85.78 572.1 82.38zM77.41 219.8C49.47 178.6 47.01 135.7 48.38 112h80.39c5.359 59.62 20.35 131.1 57.67 189.1C137.4 281.6 100.9 254.4 77.41 219.8zM498.6 219.8c-23.44 34.6-59.94 61.75-109 81.22C426.9 243.1 441.9 171.6 447.2 112h80.39C528.1 135.7 526.5 178.7 498.6 219.8z" />
                                </svg>
                                Reward
                            </a>
                        </li>
                    </ul>
                </header>

                {showStaking ? stakingCard : rewardCard}
            </section>
        </div>
    )
}
