import { ADD_RAPPORT, UPDATE_RAPPORT, EXISTING_RAPPORT, SWITCH_STATE } from '../actions';

const rapport = (state = {
    active : false,
    unlock: false,
    fields : []
}, action) => {
  switch (action.type) {
      case ADD_RAPPORT:
        if(sectionExist(action.section, state.fields))
            return { ...state };
        return {
              ...state,
              fields : [
                  ...state.fields,
                  {
                      section: action.section,
                      data: action.data
                  }
              ]
          };
    case UPDATE_RAPPORT:
        let location = action.element.split(">");
        for(let i in state.fields){
            if(state.fields[i].section === location[0]){
                location.shift();
                updateValue(state.fields[i].data, location, action.text, action.elementType);
            }
        }
        return { ...state };
      case EXISTING_RAPPORT:
          return {
              ...state,
            fields: action.data
          };
    case SWITCH_STATE:
        if(action.stage === 1){
            return{
                ...state,
                active: true,
                unlock: true
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

export default rapport

function sectionExist(section, fields){
    for (let i = 0; i < fields.length; i++) {
        if(fields[i].section === section){
            return true;
        }
    }
    return false;
}

function updateValue(data, location, value, type){
    if(location.length === 1){
        if(type === "string"){
            data[location[0]] = value;
        }else if(type === "boolean"){
            data[location[0]] = !data[location[0]];
        }else if(type === "object"){
            data[location[0]] = value
        }
        return;
    }
    for(let key in data){
        if(key === location[0]){
            location.shift();
            updateValue(data[key], location, value, type)
        }
    }
}
