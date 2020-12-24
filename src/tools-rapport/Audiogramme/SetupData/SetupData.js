import React from "react";
import styled from 'styled-components';
import { addRapport } from '../../../actions'
import { connect } from 'react-redux'

const Nothing = styled.div`
display:none
`;

const SetupData = ({dispatch, init}) => {
    if(!init){
        return(
            <Nothing />
        )
    }
    let data = {
        dateAnterieur: "",
        type: "8000hz",
        mode: "Standard",
        nonReponse: false,
        graph: {
            left: null,
            right: null
        }
    };
    dispatch(addRapport("audiogramme", data));
    return(
        <Nothing />
    )
};

export default connect()(SetupData);
