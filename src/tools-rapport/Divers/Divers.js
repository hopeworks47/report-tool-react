import React, { Component } from "react";
import styled from 'styled-components';
import { connect } from 'react-redux'
import { addRapport, updateRapport } from '../../actions'
import { Select, DateTimePicker, InputText, Checkbox, Subtitle } from '../../components'
import $ from 'jquery';

const Wrapper = styled.div`
width:100%;
display:flex;
justify-content: space-around;
@media screen and (max-width: 1024px) {
    justify-content: center;
}
`

const Col = styled.div`
display:flex;
flex-direction:column;
width: 100%;
align-items:center;
max-width: 400px;
`;
let data = {
    validite: "Bonne",
    audiometre: "",
    calibration: "",
    methode: "Oui",
    transducteur: {
        intra: true,
        supra: false,
        champLibre: false
    },
    cc: "",
    reference: "",
    clinique: "",
    lang: "fr",
    date: new Date(),
    audiologiste: null
};

const mapDispatchToProps = (dispatch) => {
    return({
        setupData: () => {  dispatch(addRapport("divers", data))  },
        updateRapport : (element, value, type = "object") => dispatch(updateRapport(type, element, value))
    });
};


const mapStateToProps = (state) => {
    if(state.rapport.fields[6] !== undefined){
        return{
            clinique: state.rapport.fields[6].data.clinique,
            importData: (state.importer.rapport !== null )?state.importer.rapport[6].data:null,
            data : state.rapport.fields[6].data,
            intra: state.rapport.fields[6].data.transducteur.intra,
            champLibre : state.rapport.fields[6].data.transducteur.champLibre
        }
    }
    return {
        clinique: "",
        importData : null,
        data : data
    }
};


class Divers extends Component {
    constructor(props){
        super(props);
        this.props.setupData();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.importData === null && this.props.importData !== null){
            this.props.updateRapport( "divers>validite" , this.props.importData.validite);
            this.props.updateRapport( "divers>audiometre" , this.props.importData.audiometre);
            this.props.updateRapport( "divers>calibration" , this.props.importData.calibration);
            this.props.updateRapport( "divers>methode" , this.props.importData.methode);
            this.props.updateRapport( "divers>transducteur" , this.props.importData.transducteur);
            this.props.updateRapport( "divers>cc" , this.props.importData.cc);
            this.props.updateRapport( "divers>reference" , this.props.importData.reference);
            this.props.updateRapport( "divers>clinique" , this.props.importData.clinique);
            this.props.updateRapport( "divers>lang" , this.props.importData.lang);
            this.props.updateRapport( "divers>date" , this.props.importData.date);
            this.props.updateRapport( "divers>audiologiste" , this.props.importData.audiologiste);
            this.forceUpdate();
        }

        if(prevProps.clinique !== this.props.clinique){
            $.get("/API/clinique/get/" + this.props.clinique, data => {
                let cliniqueInfos = JSON.parse(data);
                this.props.updateRapport( "divers>audiometre" , cliniqueInfos[0].audiometre);
                this.props.updateRapport( "divers>calibration" , cliniqueInfos[0].calibration.split("-").join("/"));
                this.forceUpdate()
            });
        }
    }


    parseDate = date => {
        let day = (date.getDate() < 10)?"0"+date.getDate():date.getDate();
        let month = ((date.getMonth()+1) < 10)?"0"+(date.getMonth()+1):(date.getMonth()+1);

        return day + "/" + month + "/" + date.getFullYear();
    };

    render(){
        return(
            <Wrapper>
                <Col>
                    <Select
                        label="Validité du test"
                        onChange={e => {this.props.updateRapport( "divers>validite" , e);this.forceUpdate()}}
                        initValue={this.props.data.validite}
                        options={["Bonne", "Moyenne", "Nulle", "Repos sonore inadéquat"]} />
                    <Subtitle text="Transducteur" />
                    <Checkbox
                        label="Intra-auriculaire"
                        onChange={e => this.props.updateRapport( "divers>transducteur>intra" , e, "boolean")}
                        defaultChecked={this.props.intra}
                    />
                    <Checkbox
                        label="Supra-auriculaire"
                        onChange={e => this.props.updateRapport( "divers>transducteur>supra" , e, "boolean")}
                        defaultChecked={this.props.data.transducteur.supra}
                    />
                    <Checkbox
                        label="Champ libre"
                        onChange={e => this.props.updateRapport( "divers>transducteur>champLibre" , e, "boolean")}
                        defaultChecked={this.props.champLibre}
                    />
                </Col>
                <Col>
                    <InputText
                        label="Audiomètre"
                        onChange={e => this.props.updateRapport( "divers>audiometre" , e, "string")}
                        defaultValue={this.props.data.audiometre} />
                    <DateTimePicker
                        dateonly
                        label="Calibration "
                        onChange={e => this.props.updateRapport( "divers>calibration" , e, "string")}
                        defaultValue={this.parseDate(new Date(this.props.data.calibration))} />
                    <Select
                        label="ANSI en vigeur"
                        onChange={e => {this.props.updateRapport( "divers>methode" , e);this.forceUpdate()}}
                        initValue={this.props.data.methode}
                        options={["Oui", "Non"]} />
                    <InputText
                        label="CC"
                        onChange={e => this.props.updateRapport( "divers>cc" , e, "string")}
                        defaultValue={this.props.data.cc}
                    />
                </Col>
            </Wrapper>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Divers);
