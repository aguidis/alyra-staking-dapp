import { useAtomValue, useUpdateAtom } from 'jotai/utils'

import {
    votingContractAtom,
    voteStatusAtom,
    whiteListedVotersAtom,
    proposalsAtom,
    voterDetailsAtom,
    winningProposalAtom,
    voteEqualityAtom,
} from '../state'

const useWeb3 = () => {
    const contract = useAtomValue(votingContractAtom)

    const setVoteStatus = useUpdateAtom(voteStatusAtom)
    const setWhiteListedVoters = useUpdateAtom(whiteListedVotersAtom)
    const setProposals = useUpdateAtom(proposalsAtom)
    const setVoterDetails = useUpdateAtom(voterDetailsAtom)
    const setWinningProposal = useUpdateAtom(winningProposalAtom)
    const setVoteEquality = useUpdateAtom(voteEqualityAtom)

    const addEventListener = (eventName, successCallback) => {
        contract.events[eventName]({}).on('data', successCallback).on('error', console.error)
    }

    const fetchVoteStatus = async () => {
        const status = await contract.methods.state().call()
        setVoteStatus(status)
    }

    const fetchVoters = async () => {
        const voters = await contract.methods.getWhitelistedVoters().call()
        setWhiteListedVoters(voters)
    }

    const fetchProposals = async () => {
        const proposals = await contract.methods.getProposals().call()
        setProposals(proposals)
    }

    /**
     * @param string account
     * @param function callback if present, it means we just want to use the response for another context
     * @returns
     */
    const fetchVoterDetails = async (account, callback = null) => {
        const voterDetails = await contract.methods.getVoterDetails(account).call()

        if (callback) {
            callback(voterDetails)
            return
        }

        setVoterDetails(voterDetails)
    }

    const addVoter = async (address, account, errorCallback) => {
        try {
            await contract.methods.addVoter(address).send({ from: account })
        } catch (error) {
            errorCallback(error)
        }
    }

    const endVotersRegistration = async (account, errorCallback) => {
        try {
            await contract.methods.startProposalSession().send({ from: account })
        } catch (error) {
            errorCallback(error)
        }
    }

    const addProposal = async (proposal, account, errorCallback) => {
        try {
            await contract.methods.submitProposal(proposal).send({ from: account })
        } catch (error) {
            errorCallback(error)
        }
    }

    const endProposalsRegistration = async (account, errorCallback) => {
        try {
            await contract.methods.endProposalSession().send({ from: account })
        } catch (error) {
            errorCallback(error)
        }
    }

    const startVotingSession = async (account, errorCallback) => {
        try {
            await contract.methods.startVotingSession().send({ from: account })
        } catch (error) {
            errorCallback(error)
        }
    }

    const voteForProposal = async (selectedProposalId, account, errorCallback) => {
        try {
            await contract.methods.voteForProposal(selectedProposalId).send({ from: account })
        } catch (error) {
            errorCallback(error)
        }
    }

    const fetchWinner = async () => {
        const proposalVoteCountEqualities = await contract.methods
            .getProposalVoteCountEqualities()
            .call()

        if (proposalVoteCountEqualities.length > 0) {
            setVoteEquality(true)

            return
        }

        const winner = await contract.methods.getWinner().call()
        setWinningProposal(winner)
    }

    const computeVoteResult = async (account, errorCallback) => {
        try {
            await contract.methods.tallyingVotes().send({ from: account })
        } catch (error) {
            errorCallback(error)
        }
    }

    const endVotingSession = async (account, errorCallback) => {
        try {
            await contract.methods.endVotingSession().send({ from: account })
        } catch (error) {
            errorCallback(error)
        }
    }

    const onVoteStatusUpdate = async (contractEvent) => {
        setVoteStatus(contractEvent.returnValues.newStatus)
    }

    return {
        addEventListener,
        fetchVoteStatus,
        fetchVoters,
        fetchProposals,
        fetchVoterDetails,
        fetchWinner,
        addVoter,
        endVotersRegistration,
        addProposal,
        endProposalsRegistration,
        startVotingSession,
        voteForProposal,
        endVotingSession,
        computeVoteResult,
        onVoteStatusUpdate,
    }
}

export default useWeb3
