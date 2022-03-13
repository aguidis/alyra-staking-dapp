import { formatEther } from '@ethersproject/units'
import Identicon from './Identicon'

import useWallet from '../../hooks/useWallet'

export default function ConnectButton() {
    const { account, balance, connectWallet } = useWallet()

    return account ? (
        <div className="wallet-box">
            <div className="wb_account-balance">
                <p>{balance && parseFloat(formatEther(balance)).toFixed(3)} ETH</p>
            </div>

            <div className="wb_account-address">
                <p>
                    {account &&
                        `${account.slice(0, 6)}...${account.slice(
                            account.length - 4,
                            account.length,
                        )}`}
                </p>
                <Identicon account={account} />
            </div>
        </div>
    ) : (
        <button onClick={connectWallet} className="wallet-connect">
            Connect to wallet
        </button>
    )
}
