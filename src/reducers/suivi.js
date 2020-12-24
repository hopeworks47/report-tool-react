import { UPDATE_SUIVI, SWITCH_STATE, UPDATE_SWITCH } from '../actions';

const suivi = (state = {
    active : false,
    unlock: false,
    prothese: false,
    present: false,
    email: false,
    listes: []
}, action) => {
  switch (action.type) {
    case UPDATE_SUIVI:
      return {
        ...state,
        listes: action.listes
    };
    case UPDATE_SWITCH:
        return {
            ...state,
            [action.el] : !state[action.el]
        };
    case SWITCH_STATE:
        if(action.stage === 2){
            return{
                ...state,
                unlock: true,
                active: true
            }

        }else{
            return{
                ...state,
                active: false
            }
        }
    default:
      return state
  }
};

export default suivi
