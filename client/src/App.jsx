import DaiTokenLogo from "cryptocurrency-icons/svg/color/dai.svg"
import GenericTokenLogo from "cryptocurrency-icons/svg/color/generic.svg"


export default function App() {
    return (
        <div class="flex flex-col items-center justify-center h-screen bg-yellow-200">
            <section class="bg-white rounded-3xl border shadow-xl p-8 w-2/6 mb-6">
                <header class="flex justify-between mb-4">
                    <div class="flex items-center">
                        <div className="flex items-center bg-[#f4b731] text-white rounded-full mr-2">
                            <img src={DaiTokenLogo} class="inline ml-2" />
                            <span className="ml-1 mr-3">105</span>
                        </div>

                        <h1 class="font-semibold text-gray-400">DAI</h1>
                    </div>

                    <div class="text-right">
                        <span class="font-bold text-green-500">+ 3%</span><br />
                        <span class="font-medium text-xs text-gray-500 flex justify-end">15 coin staked</span>
                    </div>
                </header>
                <footer class="flex justify-between">
                    <div>
                        <h3 class="font-semibold text-sm text-gray-500">USD</h3>
                        <h1 class="font-semibold text-xl text-gray-700">$ 1,936.00</h1>
                    </div>

                    <button class="border-2 border-yellow-400 text-black px-4 py-2 rounded-md text-1xl font-medium hover:bg-yellow-400 transition duration-300">
                        Stake
                    </button>
                </footer>
            </section>

            <section class="bg-white rounded-3xl border shadow-xl p-8 w-2/6 mb-6">
                <header class="mb-4">
                    <div class="flex items-center">
                        <div className="flex items-center bg-[#f4b731] text-white rounded-full mr-2">
                            <img src={GenericTokenLogo} class="inline ml-2" />
                            <span className="ml-1 mr-3">10</span>
                        </div>

                        <h1 class="font-semibold text-gray-400">DAPP</h1>
                    </div>
                </header>
                <footer class="flex justify-between">
                    <div>
                        <h3 class="font-semibold text-sm text-gray-500">USD</h3>
                        <h1 class="font-semibold text-xl text-gray-700">$ 125.00</h1>
                    </div>

                    <button class="border-2 border-yellow-400 text-black px-4 py-2 rounded-md text-1xl font-medium hover:bg-yellow-400 transition duration-300">
                        Convert
                    </button>
                </footer>
            </section>
        </div >
    )
}
