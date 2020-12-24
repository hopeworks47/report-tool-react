/*
 * action types
 */
export const AUTOSAVER = 'AUTOSAVER';
export const SWITCH_STATE = 'SWITCH_STATE';
export const SHOW_ACUITY = 'SHOW_ACUITY';
export const SHOW_PATIENTS = 'SHOW_PATIENTS';

export const ADD_PATIENTID = 'ADD_PATIENTID';
export const ADD_RAPPORTID = 'ADD_RAPPORTID';
export const START_RAPPORT = 'START_RAPPORT';

export const UPDATE_INFO = 'UPDATE_INFO';

export const ADD_RAPPORT = 'ADD_RAPPORT';
export const UPDATE_RAPPORT = 'UPDATE_RAPPORT';
export const EXISTING_RAPPORT = 'EXISTING_RAPPORT';

export const UPDATE_SUIVI = 'ADD_SUIVI';
export const UPDATE_SWITCH = 'UPDATE_SWITCH';

export const ADD_PDF = 'ADD_PDF';

export const IMPORT_RAPPORT = 'IMPORT_RAPPORT';
export const IMPORT_PATIENT = 'IMPORT_PATIENT';

/*
 * action creators
 */
 export function autosaver(value) {
   return { type: AUTOSAVER, value }
 }
 export function switchState(stage) {
   return { type: SWITCH_STATE, stage }
 }
 export function showAcuity(){
     return { type: SHOW_ACUITY}
 }
 export function showPatients(){
     return { type: SHOW_PATIENTS}
 }

 export function addPatientId(id){
     return { type: ADD_PATIENTID, id: id }
 }
export function addRapportId(id){
    return { type: ADD_RAPPORTID, id: id }
}
 export function startRapport(){
     return { type: START_RAPPORT }
 }

export function updateInfos(infos) {
  return { type: UPDATE_INFO, infos }
}


export function addRapport(section, data) {
  return { type: ADD_RAPPORT, section, data}
}
export function updateRapport(elementType, element, text) {
  return { type: UPDATE_RAPPORT, elementType, element, text }
}
export function existingRapport(data){
     return { type: EXISTING_RAPPORT, data }
}

export function updateSuivi(listes) {
  return { type: UPDATE_SUIVI, listes }
}
export function updateSwitch(el){
    return { type: UPDATE_SWITCH, el }
}

export function addPdf(text) {
  return { type: ADD_PDF, text }
}

export function importRapport(rapport){
     return { type: IMPORT_RAPPORT, rapport}
}
export function importPatient(patient){
    return { type: IMPORT_PATIENT, patient}
}
