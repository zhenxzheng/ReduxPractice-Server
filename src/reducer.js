import {setEntries, next, vote, restart, INITIAL_STATE} from './core';

export default function reducer(state = INITIAL_STATE , action) {
	// Figure out which function to call and call it
	switch(action.type) {
		case 'RESTART': 
			return restart(state);
		case 'SET_ENTRIES':
			return setEntries(state, action.entries);
		case 'NEXT':
			return next(state);
		case 'VOTE':
			return state.update('vote',
								voteState => vote(voteState, action.entry, action.clientId));
	}
	return state;
}