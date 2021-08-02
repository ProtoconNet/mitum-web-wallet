import * as actions from '../actions';
import Queue from '../../lib/Queue';

const initialState = {
    queue: new Queue()
}

export const reducer = (state = initialState, action) => {
    switch (action.type) {
        case actions.ENQUEUE_OPERATION:
            state.queue.enque(action.hash);
            return {
                ...state,
                queue: state.queue
            }
        case actions.DEQUEUE_OPERATION:
            state.queue.deque();
            return {
                ...state,
                queue: state.queue
            }
        default:
            return state;
    }
}