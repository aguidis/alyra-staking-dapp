import { chainMapping } from '../constants/chainId'

export const getChainName = (chainId) => {
    if (!chainId) {
        return '-'
    }

    return chainMapping[chainId] || 'Unknown'
}

export const isValidChain = (chainId) => {
    return [1337].includes(chainId)
}
