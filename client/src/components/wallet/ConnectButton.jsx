import Identicon from './Identicon'

export default function ConnectButton() {
    const account = '0x99A87097f773E2182Aa320e0df0D489A9c966FAD'

    return account ? (
        <div className="wallet-box">
            <div className="wb_account-balance">
                <p>99.95 ETH</p>
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
