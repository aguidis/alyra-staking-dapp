import { VoteStatus } from '../constants/voteStatus'

export const getVoteStatusLabel = (voteStatus) => {
    const voteStatusMapping = {}
    voteStatusMapping[VoteStatus.RegisteringVoters] = 'Voters registration'
    voteStatusMapping[VoteStatus.ProposalsRegistrationStarted] =
        'Proposals registration in progress'
    voteStatusMapping[VoteStatus.ProposalsRegistrationEnded] = 'Proposals registration over'
    voteStatusMapping[VoteStatus.VotingSessionStarted] = 'Voting session in progress'
    voteStatusMapping[VoteStatus.VotingSessionEnded] = 'Voting session over'
    voteStatusMapping[VoteStatus.VotesTallied] = 'Vote result'

    return voteStatusMapping[voteStatus]
}
