import { BigNumber } from 'ethers'
import { ethers } from 'ethers'

export function shortenAddress(address) {
    return `${address.slice(0, 6)}...${address.slice(address.length - 4, address.length)}`
}

export function compareAddress(firstAddress, secondAddress) {
    try {
        const parsedFirstAddress = BigNumber.from(firstAddress)
        const parsedSecondAddress = BigNumber.from(secondAddress)

        if (parsedFirstAddress.gt(parsedSecondAddress)) {
            return 1
        }

        if (parsedFirstAddress.lt(parsedSecondAddress)) {
            return -1
        }

        return 0
    } catch {
        throw new TypeError("Invalid input, address can't be parsed")
    }
}

export function addressEqual(firstAddress, secondAddress) {
    if (firstAddress === null || secondAddress === null) {
        return false
    }

    try {
        return ethers.utils.getAddress(firstAddress) === ethers.utils.getAddress(secondAddress)
    } catch {
        throw new TypeError("Invalid input, address can't be parsed")
    }
}
