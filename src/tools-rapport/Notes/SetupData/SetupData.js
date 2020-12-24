import React from "react";
import { addRapport } from '../../../actions'
import { connect } from 'react-redux'

const SetupData = ({dispatch}) => {
    let data = {
        tabs: []
    };
    dispatch(addRapport("notes", data));
    return(
        <div />
    )
};

export default connect()(SetupData);
