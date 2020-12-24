import React, { Component } from 'react';
import styled from 'styled-components';
import Stages from './Stages';
import Content from './Content';
import { connect } from 'react-redux';
import $ from 'jquery';
import {importRapport, importPatient, switchState, addPatientId, addRapportId} from "./actions";

const Wrapper = styled.div`
    margin:0;
    width:100%;
    background-color: #f7f7f7;
    font-family: Lato;
    position: relative;
`;

const mapDispatchToProps = (dispatch) => {
    return {
        importRapport: rapportData => {dispatch(importRapport(rapportData))},
        importPatient: patientData => {dispatch(importPatient(patientData))},
        switchState : state => {dispatch(switchState(state))},

        addPatientId: (id) => {dispatch(addPatientId(id))},
        addRapportId: (id) => {dispatch(addRapportId(id))},
    }
};

const mapStateToProps = (state) => {
    return{
        state : state
    }
};

let init = false;

const autosave = (e, data) => {
    if(data.informations.rapportId === null){
        return;
    }

    // console.log(data);
    $.post("/API/report/update", {
        patientId: data.informations.patientId ,
        rapportId : data.informations.rapportId,
        rapport: JSON.stringify(data.rapport.fields)
    }, function(success){
        // console.log(success);
    }).fail(function() {
        // console.log("can't connect to backend");
    })
};

class App extends Component {
    constructor(props){
        super(props);

    }

    shouldComponentUpdate(nextProps, nextState){
        return false;
    }
    initAutosave(){
        setInterval(() => {autosave(this, this.props.state)}, 5000);
    }
    componentDidMount() {
        let urlCode = window.location.search.substring(1);
        if(urlCode) {
            let urlCodeArr = urlCode.split("&");
            $.post("/API/report/get", {
                rapportHash : urlCodeArr[0],
                patientId : urlCodeArr[1]
            }, data => {
                if(!data)
                    return;

                $.post("/API/patient/get", {
                    patientId : urlCodeArr[1]
                }, patient => {
                    patient = JSON.parse(patient);
                    let metas = JSON.parse(patient[0].metas);
                    this.props.importPatient(metas);

                    this.props.addPatientId(urlCodeArr[1]);
                    this.props.addRapportId(urlCodeArr[0]);

                    this.props.switchState(3);
                    this.props.switchState(2);
                    this.props.switchState(1);
                });
                data[6].data.audiologiste = urlCodeArr[2];
                this.props.importRapport(data);

            })
        }
    }

    render() {
        if(!init){
            this.initAutosave();
            init = true;
        }
        return (
            <Wrapper>
                <Stages />
                <Content />
            </Wrapper>
        );
    }
}

export default connect( mapStateToProps, mapDispatchToProps )(App);

