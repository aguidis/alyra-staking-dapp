export function isValidProposal(proposal) {
    // Prevent falsy value
    if (!proposal) {
        return false
    }

    // Only allow alphanumeric characters and spaces
    const regex = new RegExp('^[a-zA-Z0-9_ ]*$')
    if (!regex.test(proposal)) {
        return false
    }

    return proposal.length > 5 && proposal.length <= 60
}
