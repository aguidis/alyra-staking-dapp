import { useEffect } from 'react'

import { useAtomValue } from 'jotai/utils'
import { providerAtom, networkIdAtom, contractAtom } from './state'

import DaiTokenLogo from 'cryptocurrency-icons/svg/color/dai.svg'
import GenericTokenLogo from 'cryptocurrency-icons/svg/color/generic.svg'
import ConnectButton from './components/wallet/ConnectButton'

export default function App() {
    const provider = useAtomValue(providerAtom)
    const networkId = useAtomValue(networkIdAtom)
    const contract = useAtomValue(contractAtom)

    // Handle contract loading
    useEffect(() => {
        console.log('provider', provider)
        console.log('providnetworkIder', networkId)
        console.log('contract', contract)
    }, []) // Only execute on component mount

    // Handle chain change
    useEffect(() => {
        // The "any" network will allow spontaneous network changes
        provider.on('network', (newNetwork, oldNetwork) => {
            // When a Provider makes its initial connection, it emits a "network"
            // event with a null oldNetwork along with the newNetwork. So, if the
            // oldNetwork exists, it represents a changing network
            if (oldNetwork) {
                window.location.reload()
            }
        })
    }, []) // Only execute on component mount

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-yellow-200">
            <section className="bg-white rounded-3xl border shadow-xl p-8 w-2/6 mb-6">
                <ConnectButton />
            </section>
            <section className="bg-white rounded-3xl border shadow-xl p-8 w-2/6 mb-6">
                <header className="flex justify-between mb-4">
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
                </header>
                <footer className="flex justify-between">
                    <div>
                        <h3 className="font-semibold text-sm text-gray-500">USD</h3>
                        <h1 className="font-semibold text-xl text-gray-700">$ 1,936.00</h1>
                    </div>

                    <button className="border-2 border-yellow-400 text-black px-4 py-2 rounded-md text-1xl font-medium hover:bg-yellow-400 transition duration-300">
                        Stake
                    </button>
                </footer>
            </section>

            <section className="bg-white rounded-3xl border shadow-xl p-8 w-2/6 mb-6">
                <header className="mb-4">
                    <div className="flex items-center">
                        <div className="flex items-center bg-[#f4b731] text-white rounded-full mr-2">
                            <img src={GenericTokenLogo} className="inline ml-2" />
                            <span className="ml-1 mr-3">10</span>
                        </div>

                        <h1 className="font-semibold text-gray-400">DAPP</h1>
                    </div>
                </header>
                <footer className="flex justify-between">
                    <div>
                        <h3 className="font-semibold text-sm text-gray-500">USD</h3>
                        <h1 className="font-semibold text-xl text-gray-700">$ 125.00</h1>
                    </div>

                    <button className="border-2 border-yellow-400 text-black px-4 py-2 rounded-md text-1xl font-medium hover:bg-yellow-400 transition duration-300">
                        Convert
                    </button>
                </footer>
            </section>
        </div>
    )
}
