import { IMPORT_RAPPORT, IMPORT_PATIENT } from '../actions';

const importer = (state = {
    rapport : null,
    patient: null,
}, action) => {
    switch (action.type) {
        case IMPORT_RAPPORT :
            return {
                ...state,
                rapport : action.rapport
            };
        case IMPORT_PATIENT:
            return {
                ...state,
                patient : action.patient
            };
        default :
            return state;
    }
};

export default importer;