import { ADD_PDF, SWITCH_STATE } from '../actions';

const pdf = (state = {
    active : false,
    unlock: false,
    fields : []
}, action) => {
  switch (action.type) {
    case ADD_PDF:
      return {
        ...state,
        fields : [
            ...state.fields,
            {
              attribute: action.text,
              value: ""
            }
        ]
    }
    case SWITCH_STATE:
        if(action.stage === 3){
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
}

export default pdf
