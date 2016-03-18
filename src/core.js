import {List, Map} from 'immutable';

export function setEntries(state, entries) {
	const initialList = List(entries);
	return state.set('entries', initialList)
				.set('initialEntries', initialList);
}

export function next(state, round = state.getIn(['vote','round'], 0)) {
	const entries = state.get('entries')
						.concat(getWinner(state.get('vote')));
	if (entries.size === 1) {
		return state.remove('vote')
					.remove('entries')
					.set('winner', entries.first());
	} else {
		return state.merge({
			vote: Map({
				round: round + 1,
				pair: entries.take(2)
			}),
			entries: entries.skip(2)
		});
	}
}

export function removePreviousVote(voteState, voter) {
	const previousVote = voteState.getIn(['votes', voter]);
	if (previousVote) {
		return voteState.updateIn(['tally', previousVote], tally => tally - 1)
						.removeIn(['votes', voter]);
	} else {
		return voteState;
	}
}

export function addVote(voteState, entry, voter) {
	if (voteState.get('pair').includes(entry)) {
		return voteState.updateIn(['tally', entry], 0, tally => tally + 1)
						.setIn(['votes', voter], entry);
	} else {
		return voteState;
	}
}

export function vote(voteState, entry, voter) {
	return addVote(
		removePreviousVote(voteState, voter),
		entry,
		voter
	);
}

export function restart(state) {
	const round = state.getIn(['vote','round'],0);
	return next(
		state.set('entries', state.get('initialEntries'))
				.remove('vote')
				.remove('winner'),
		round
	);
}


function getWinner(vote) {
	if (!vote) return [];
	const [a, b] = vote.get('pair');
	const aVotes = vote.getIn(['tally', a], 0);
	const bVotes = vote.getIn(['tally', b], 0);

	if (aVotes > bVotes) return [a];
	else if (bVotes > aVotes) return [b];
	else return [a, b];
}

export const INITIAL_STATE = Map();