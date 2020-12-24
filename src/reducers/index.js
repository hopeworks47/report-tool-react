import { combineReducers } from 'redux'
import informations from './informations'
import rapport from './rapport'
import suivi from './suivi'
import pdf from './pdf'

import importer from './importer';


const rapportPatient = combineReducers({
    informations,
    rapport,
    suivi,
    pdf,
    importer
});

export default rapportPatient
