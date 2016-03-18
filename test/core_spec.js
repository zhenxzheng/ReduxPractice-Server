import {expect} from 'chai';
import {List, Map} from 'immutable';

import {setEntries, next, vote, restart} from '../src/core';

describe('application logic', () => {

	describe('setEntries', () => {

		it('adds the entries to the state', () => {
			const state = Map();
			const entries = List.of('Trainspotting', '28 Days Later');
			const nextState = setEntries(state, entries);
			expect(nextState).to.equal(Map({
				entries: List.of('Trainspotting', '28 Days Later'),
				initialEntries: List.of('Trainspotting', '28 Days Later')
			}));
		});
	});
	describe('next', () => {

		it('takes the next two entries under vote', () => {
			const state = Map({
				entries: List.of('Trainspotting', '28 Days Later', 'Sunshine')
			});
			const nextState = next(state);

			expect(nextState).to.equal(Map({
				vote: Map({
					round: 1,
					pair: List.of('Trainspotting', '28 Days Later')
				}),
				entries: List.of('Sunshine')
			}));
		});
		it('puts winner of current vote back to entries', () => {
			const state = Map({
				vote: Map({
					round: 1,
					pair: List.of('Trainspotting', '28 Days Later'),
					tally: Map({
						'Trainspotting': 4,
						'28 Days Later': 3
					})
				}),
				entries: List.of('Sunshine', 'Millions', '127 Hours')
			});
			const nextState = next(state);

			expect(nextState).to.equal(Map({
				vote: Map({
					round: 2,
					pair: List.of('Sunshine', 'Millions'),
				}),
				entries: List.of('127 Hours', 'Trainspotting')
			}));
		});

		it('puts both from tied vote back to entries', () => {
			const state = Map({
				vote: Map({
					round: 1,
					pair: List.of('Trainspotting', '28 Days Later'),
					tally: Map({
						'Trainspotting': 3,
						'28 Days Later': 3
					})
				}),
				entries: List.of('Sunshine', 'Millions', '127 Hours')
			});
			const nextState = next(state);

			expect(nextState).to.equal(Map({
				vote: Map({
					round: 2,
					pair: List.of('Sunshine', 'Millions'),
				}),
				entries: List.of('127 Hours', 'Trainspotting', '28 Days Later')
			}));
		});

		it('marks winner when just one entry left', () => {
			const state = Map({
				vote: Map({
					round: 1,
					pair: List.of('Trainspotting', '28 Days Later'),
					tally: Map({
						'Trainspotting': 3,
						'28 Days Later': 2
					})
				}),
				entries: List()
			});
			const nextState = next(state);

			expect(nextState).to.equal(Map({
				winner: 'Trainspotting'
			}));
		})
	});

	describe('vote', () => {

		it('creates a tally for the voted entry', () => {
			const voteState = Map({
				round: 1,
				pair: List.of('Trainspotting', '28 Days Later')
			});
			const nextState = vote(voteState, 'Trainspotting', 'voter1');

			expect(nextState).to.equal(Map({
				round: 1,
				pair: List.of('Trainspotting', '28 Days Later'),
				tally: Map({
					'Trainspotting': 1
				}),
				votes: Map({
					voter1: 'Trainspotting'
				})
			}));
		});

		it('adds to existing tally for the voted entry', () => {
			const state = Map({
				round: 1,
				pair: List.of('Trainspotting', '28 Days Later'),
				tally: Map({
					'Trainspotting': 3,
					'28 Days Later': 7
				}),
			});
			const nextState = vote(state, '28 Days Later', 'voter1');

			expect(nextState).to.equal(Map({
				round: 1,
				pair: List.of('Trainspotting', '28 Days Later'),
				tally: Map({
					'Trainspotting': 3,
					'28 Days Later': 8
				}),
				votes: Map({
					voter1: '28 Days Later'
				})
			}));
		});

		it('removes previous vote for the same voter', () => {
			const state = Map({
				round: 1,
				pair: List.of('Trainspotting', '28 Days Later'),
				tally: Map({
					'Trainspotting': 3,
					'28 Days Later': 7
				}),
				votes: Map({
					voter1: '28 Days Later'
				})
			})
			const nextState = vote(state, 'Trainspotting', 'voter1');

			expect(nextState).to.equal(Map({
				round: 1,
				pair: List.of('Trainspotting', '28 Days Later'),
				tally: Map({
					'Trainspotting': 4,
					'28 Days Later': 6
				}),
				votes: Map({
					voter1: 'Trainspotting'
				})
			}));
		});

		it('restarts the voting process', () => {
			const state = Map({
				vote: Map({
					round: 34,
					pair: List.of('Sunshine', '127 Hours'),
					tally: Map({
						'Sunshine': 3,
						'127 Hours': 7
					}),
					votes: Map({
						voter1: 'Sunshine'
					})
				}),
				entries: List(),
				initialEntries: List.of('Sunshine', 'Millions', '127 Hours')
			})
			const nextState = restart(state);

			expect(nextState).to.equal(Map({
				vote: Map({
					round: 35,
					pair: List.of('Sunshine', 'Millions'),
				}),
				entries: List.of('127 Hours'),
				initialEntries: List.of('Sunshine', 'Millions', '127 Hours')
			}));
		});
	});
});