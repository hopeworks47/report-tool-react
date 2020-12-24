import {
	ADD_PATIENTID,
	ADD_RAPPORTID,
	AUTOSAVER,
	SHOW_ACUITY,
	SHOW_PATIENTS,
	START_RAPPORT,
	SWITCH_STATE,
	UPDATE_INFO
} from '../actions';

function stringGen(len) {
	let text = "";
	
	let charset = "abcdefghijklmnopqrstuvwxyz0123456789";
	
	for (let i = 0; i < len; i++)
		text += charset.charAt(Math.floor(Math.random() * charset.length));
	
	return text;
}

const informations = (state = {
	active: true,
	unlock: true,
	acuityImporter: false,
	patientImporter: false,
	rapportId: null,
	patientId: null,
	autosaver: null,
	fields: []
}, action) => {
	switch (action.type) {
		case ADD_PATIENTID:
			return {
				...state,
				patientId: parseInt(action.id)
			};
		case ADD_RAPPORTID:
			return {
				...state,
				rapportId: action.id
			};
		case START_RAPPORT:
			return {
				...state,
				rapportId: stringGen(10)
			};
		case AUTOSAVER:
			return {
				...state,
				autosaver: action.value
			};
		case SHOW_ACUITY : {
			return {
				...state,
				acuityImporter: !state.acuityImporter
			}
		}
		case SHOW_PATIENTS : {
			return {
				...state,
				patientImporter: !state.patientImporter
			}
		}
		case UPDATE_INFO:
			state.fields = action.infos;
			return state;
		case SWITCH_STATE:
			if (action.stage === 0) {
				return {
					...state,
					active: true
				}
			} else {
				return {
					...state,
					active: false
				}
			}
		default:
			return state
	}
};

export default informations
