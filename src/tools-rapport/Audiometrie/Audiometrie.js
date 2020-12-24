import React, { Component } from "react";
import styled from 'styled-components';
import { Subtitle, InputText, Checkbox, Select } from '../../components';
import { connect } from 'react-redux'
import SetupData from './SetupData'
import {addRapport, updateRapport} from "../../actions";

const Wrapper = styled.div`
display:flex;
flex-direction: column;
width:100%;
align-items: center
`;

const Row = styled.div`
width:100%;
justify-content: ${props => (props.center)? "center" : (props.spaceBetween)?"space-between" : (props.right)?"flex-end":"unset"}
max-width: 900px;
display: ${props => (props.hidden)? "none" : "flex"}
@media screen and (max-width: 1024px) {
    justify-content:center ;
}
`;

const Col = styled.div`
    width:100%
`;
const UnitWrap = styled.div`
display: ${props => (props.hidden)? "none" : "flex"}
align-items: flex-end;
max-width: 100px;
margin-right: 32px;
@media screen and (max-width: 1024px) {
    margin-right: 20px;
}
`;
const Unit = styled.div`
margin: 6px 0;
@media screen and (max-width: 1024px) {
    font-size: 13px;
}
`;

const mapStateToProps = (state) => {
    if(state.rapport.fields[4] !== undefined){
        return {
            ndc: state.rapport.fields[4].data.ndc,
            binaural: state.rapport.fields[4].data.binaural,
            liste: state.rapport.fields[4].data.liste,
            type: state.rapport.fields[0].data.type,
            msp3 : {
                droite : state.rapport.fields[4].data.droite.msp.freq3,
                gauche : state.rapport.fields[4].data.gauche.msp.freq3
            },
            msp4 : {
                droite : state.rapport.fields[4].data.droite.msp.freq4,
                gauche : state.rapport.fields[4].data.gauche.msp.freq4
            },
            importData : (state.importer.rapport !== null )?state.importer.rapport[4].data:null,
            data : state.rapport.fields[4].data
        }
    }
    return {
        ndc : SetupData.ndc,
        binaural : SetupData.binaural,
        liste: SetupData.liste,
        type: "8000hz",
        importData: null,
        data : SetupData
    }

};

const mapDispatchToProps = (dispatch) => {
    return {
        init : data => dispatch(addRapport("audiometrie", data)),
        updateRapport : (element, value, type = "object") => dispatch(updateRapport(type, element, value))
    }
};

class Audiometrie extends Component {
    constructor(props){
        super(props);
        this.props.init(SetupData);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.importData === null && this.props.importData !== null){
            this.props.updateRapport("audiometrie>ndc", this.props.importData.ndc);
            this.props.updateRapport("audiometrie>binaural", this.props.importData.binaural);
            this.props.updateRapport("audiometrie>droite",this.props.importData.droite);
            this.props.updateRapport("audiometrie>gauche",this.props.importData.gauche);
            this.props.updateRapport("audiometrie>champLibre",this.props.importData.champLibre);
            this.props.updateRapport("audiometrie>both",this.props.importData.both);
            this.props.updateRapport("audiometrie>materielEnregistre",this.props.importData.materielEnregistre);
            this.props.updateRapport("audiometrie>liste",this.props.importData.liste);
            this.props.updateRapport("audiometrie>identificationImages",this.props.importData.identificationImages);
            this.props.updateRapport("audiometrie>langue",this.props.importData.langue);
            this.forceUpdate();
        }
    }

    render(){
        return(
            <Wrapper>
                <Row center hidden={this.props.type !== "Champ Libre"}>
                    <Col />
                    <Col>
                        <Select
                            label="Liste utilisée"
                            onChange={e => {this.props.updateRapport( "audiometrie>liste" , e);this.forceUpdate()}}
                            initValue={this.props.liste}
                            options={["","Images", "Liste Enfant", "Liste Adulte"]} />
                    </Col>
                    <Col />
                </Row>
                <Row center className={"input-checkbox"}>
                    <Checkbox
                        onChange={e => this.props.updateRapport( "audiometrie>ndc", e, "boolean")}
                        defaultChecked={(this.props.importData !== null)?this.props.importData.ndc:SetupData.ndc}
                        label="Niveau de Comfort" />
                </Row>
                <Row spaceBetween>
                    <Col>
                        <Row>
                            <UnitWrap>
                                <InputText
                                    onChange={e => this.props.updateRapport( "audiometrie>droite>msp>freq3" , e, "string")}
                                    defaultValue={this.props.data.droite.msp.freq3}
                                    label="MSP 3" />
                                <Unit>dBHL</Unit>
                            </UnitWrap>
                            <UnitWrap>
                                <InputText
                                    onChange={e => this.props.updateRapport( "audiometrie>droite>msp>freq4" , e, "string")}
                                    defaultValue={this.props.data.droite.msp.freq4}
                                    label="MSP 4" />
                                <Unit>dBHL</Unit>
                            </UnitWrap>
                        </Row>
                        <Row>
                            <UnitWrap>
                                <InputText
                                    onChange={e => this.props.updateRapport( "audiometrie>droite>srp" , e, "string")}
                                    defaultValue={this.props.data.droite.srp}
                                    label="SRP" />
                                <Unit>dBHL</Unit>
                            </UnitWrap>
                            <UnitWrap hidden={this.props.ndc}>
                                <InputText
                                    onChange={e => this.props.updateRapport( "audiometrie>droite>sdp" , e, "string")}
                                    defaultValue={this.props.data.droite.sdp}
                                    label="SDP" />
                                <Unit>dBHL</Unit>
                            </UnitWrap>
                            <UnitWrap hidden={!this.props.ndc}>
                                <InputText
                                    onChange={e => this.props.updateRapport( "audiometrie>droite>ndc" , e, "string")}
                                    defaultValue={this.props.data.droite.ndc}
                                    label="NDC" />
                                <Unit>dBHL</Unit>
                            </UnitWrap>
                        </Row>
                    </Col>
                    <Col>
                        <Row right>
                            <UnitWrap>
                                <InputText
                                    onChange={e => this.props.updateRapport( "audiometrie>gauche>msp>freq3" , e, "string")}
                                    defaultValue={this.props.data.gauche.msp.freq3}
                                    label="MSP 3" />
                                <Unit>dBHL</Unit>
                            </UnitWrap>
                            <UnitWrap>
                                <InputText
                                    onChange={e => this.props.updateRapport( "audiometrie>gauche>msp>freq4" , e, "string")}
                                    defaultValue={this.props.data.gauche.msp.freq4}
                                    label="MSP 4" />
                                <Unit>dBHL</Unit>
                            </UnitWrap>
                        </Row>
                        <Row right>
                            <UnitWrap>
                                <InputText
                                    onChange={e => this.props.updateRapport( "audiometrie>gauche>srp" , e, "string")}
                                    defaultValue={this.props.data.gauche.srp}
                                    label="SRP" />
                                <Unit>dBHL</Unit>
                            </UnitWrap>
                            <UnitWrap hidden={this.props.ndc}>
                                <InputText
                                    onChange={e => this.props.updateRapport( "audiometrie>gauche>sdp" , e, "string")}
                                    defaultValue={this.props.data.gauche.sdp}
                                    label="SDP" />
                                <Unit>dBHL</Unit>
                            </UnitWrap>
                            <UnitWrap hidden={!this.props.ndc}>
                                <InputText
                                    onChange={e => this.props.updateRapport( "audiometrie>gauche>ndc" , e, "string")}
                                    defaultValue={this.props.data.gauche.ndc}
                                    label="NDC" />
                                <Unit>dBHL</Unit>
                            </UnitWrap>
                        </Row>
                    </Col>
                </Row>
                <Row hidden={this.props.type !== "Champ Libre"} center>
                    <Col>
                        <div style={{textAlign:"center"}}>
                            <Subtitle text="Champ Libre" />
                        </div>
                        <Row center>
                            <UnitWrap>
                                <InputText
                                    onChange={e => this.props.updateRapport( "audiometrie>champLibre>msp>freq3", e, "string")}
                                    defaultValue={this.props.data.champLibre.msp.freq3}
                                    label="MSP 3" />
                                <Unit>dBHL</Unit>
                            </UnitWrap>
                            <UnitWrap>
                                <InputText
                                    onChange={e => this.props.updateRapport( "audiometrie>champLibre>msp>freq4" , e, "string")}
                                    defaultValue={this.props.data.champLibre.msp.freq4}
                                    label="MSP 4" />
                                <Unit>dBHL</Unit>
                            </UnitWrap>
                            <UnitWrap>
                                <InputText
                                    onChange={e => this.props.updateRapport( "audiometrie>champLibre>srp" , e, "string")}
                                    defaultValue={this.props.data.champLibre.srp}
                                    label="SRP" />
                                <Unit>dBHL</Unit>
                            </UnitWrap>
                            <UnitWrap hidden={this.props.ndc}>
                                <InputText
                                    onChange={e => this.props.updateRapport( "audiometrie>champLibre>sdp" , e, "string")}
                                    defaultValue={this.props.data.champLibre.sdp}
                                    label="SDP" />
                                <Unit>dBHL</Unit>
                            </UnitWrap>
                            <UnitWrap hidden={!this.props.ndc}>
                                <InputText
                                    onChange={e => this.props.updateRapport( "audiometrie>champLibre>ndc" , e, "string")}
                                    defaultValue={this.props.data.champLibre.ndc}
                                    label="NDC" />
                                <Unit>dBHL</Unit>
                            </UnitWrap>
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <Subtitle text="Identification" />
                </Row>
                <Row center>
                    <Col />
                    <Col>
                        <Select
                            label="Langue utilisée"
                            onChange={e => {this.props.updateRapport("audiometrie>langue", e);this.forceUpdate()}}
                            initValue={this.props.data.langue}
                            options={["Français", "Anglais", "Espagnol", "Autre"]} />
                    </Col>
                    <Col />
                </Row>
                <Row center>
                    <Checkbox
                        onChange={e => this.props.updateRapport( "audiometrie>materielEnregistre", e, "boolean")}
                        defaultChecked={(this.props.importData !== null)?this.props.importData.materielEnregistre:SetupData.materielEnregistre}
                        label="Matériel Enregistré" />
                </Row>
                <Row center>
                    <Checkbox
                        onChange={e => this.props.updateRapport( "audiometrie>identificationImages", e, "boolean")}
                        defaultChecked={(this.props.importData !== null)?this.props.importData.identificationImages:SetupData.identificationImages}
                        label="Identifications d'images" />
                </Row>
                <Row spaceBetween>
                    <Col>
                        <Row>
                            <UnitWrap>
                                <InputText
                                    onChange={e => this.props.updateRapport( "audiometrie>droite>identification>premier>resultat" , e, "string")}
                                    defaultValue={this.props.data.droite.identification.premier.resultat}
                                    label="Résultat" />
                                <Unit>%</Unit>
                            </UnitWrap>
                            <UnitWrap>
                                <InputText
                                    onChange={e => this.props.updateRapport( "audiometrie>droite>identification>premier>niveau" , e, "string")}
                                    defaultValue={this.props.data.droite.identification.premier.niveau}
                                    label="Niveau" />
                                <Unit>dBHL</Unit>
                            </UnitWrap>
                            <UnitWrap>
                                <InputText
                                    onChange={e => this.props.updateRapport( "audiometrie>droite>identification>premier>masking" , e, "string")}
                                    defaultValue={this.props.data.droite.identification.premier.masking}
                                    label="Masking" />
                                <Unit>dBHL</Unit>
                            </UnitWrap>
                        </Row>
                        <Row hidden={this.props.type === "Champ Libre"}>
                            <UnitWrap>
                                <InputText
                                    onChange={e => this.props.updateRapport( "audiometrie>droite>identification>deuxieme>resultat" , e, "string")}
                                    defaultValue={this.props.data.droite.identification.deuxieme.resultat}
                                    label="Résultat" />
                                <Unit>%</Unit>
                            </UnitWrap>
                            <UnitWrap>
                                <InputText
                                    onChange={e => this.props.updateRapport( "audiometrie>droite>identification>deuxieme>niveau" , e, "string")}
                                    defaultValue={this.props.data.droite.identification.deuxieme.niveau}
                                    label="Niveau" />
                                <Unit>dBHL</Unit>
                            </UnitWrap>
                            <UnitWrap>
                                <InputText
                                    onChange={e => this.props.updateRapport( "audiometrie>droite>identification>deuxieme>masking" , e, "string")}
                                    defaultValue={this.props.data.droite.identification.deuxieme.masking}
                                    label="Masking" />
                                <Unit>dBHL</Unit>
                            </UnitWrap>
                        </Row>
                    </Col>
                    <Col>
                        <Row right>
                            <UnitWrap>
                                <InputText
                                    onChange={e => this.props.updateRapport( "audiometrie>gauche>identification>premier>resultat" , e, "string")}
                                    defaultValue={this.props.data.gauche.identification.premier.resultat}
                                    label="Résultat" />
                                <Unit>%</Unit>
                            </UnitWrap>
                            <UnitWrap>
                                <InputText
                                    onChange={e => this.props.updateRapport( "audiometrie>gauche>identification>premier>niveau" , e, "string")}
                                    defaultValue={this.props.data.gauche.identification.premier.niveau}
                                    label="Niveau" />
                                <Unit>dBHL</Unit>
                            </UnitWrap>
                            <UnitWrap>
                                <InputText
                                    onChange={e => this.props.updateRapport( "audiometrie>gauche>identification>premier>masking" , e, "string")}
                                    defaultValue={this.props.data.gauche.identification.premier.masking}
                                    label="Masking" />
                                <Unit>dBHL</Unit>
                            </UnitWrap>
                        </Row>
                        <Row right hidden={this.props.type === "Champ Libre"}>
                            <UnitWrap>
                                <InputText
                                    onChange={e => this.props.updateRapport( "audiometrie>gauche>identification>deuxieme>resultat" , e, "string")}
                                    defaultValue={this.props.data.gauche.identification.deuxieme.resultat}
                                    label="Résultat" />
                                <Unit>%</Unit>
                            </UnitWrap>
                            <UnitWrap>
                                <InputText
                                    onChange={e => this.props.updateRapport( "audiometrie>gauche>identification>deuxieme>niveau" , e, "string")}
                                    defaultValue={this.props.data.gauche.identification.deuxieme.niveau}
                                    label="Niveau" />
                                <Unit>dBHL</Unit>
                            </UnitWrap>
                            <UnitWrap>
                                <InputText
                                    onChange={e => this.props.updateRapport( "audiometrie>gauche>identification>deuxieme>masking" , e, "string")}
                                    defaultValue={this.props.data.gauche.identification.deuxieme.masking}
                                    label="Masking" />
                                <Unit>dBHL</Unit>
                            </UnitWrap>
                        </Row>
                    </Col>
                </Row>
                <Row center>
                    <Checkbox
                        onChange={e => this.props.updateRapport( "audiometrie>binaural", e, "boolean")}
                        defaultChecked={(this.props.importData !== null)?this.props.importData.binaural:SetupData.binaural}
                        label="Binaural" />
                </Row>
                <Row center hidden={!this.props.binaural}>
                    <UnitWrap>
                        <InputText
                            onChange={e => this.props.updateRapport( "audiometrie>both>resultat" , e, "string")}
                            defaultValue={this.props.data.both.resultat}
                            label="Résultat" />
                        <Unit>%</Unit>
                    </UnitWrap>
                    <UnitWrap>
                        <InputText
                            onChange={e => this.props.updateRapport( "audiometrie>both>niveau" , e, "string")}
                            defaultValue={this.props.data.both.niveau}
                            label="Niveau" />
                        <Unit>dBHL</Unit>
                    </UnitWrap>
                    <UnitWrap>
                        <InputText
                            onChange={e => this.props.updateRapport( "audiometrie>both>masking" , e, "string")}
                            defaultValue={this.props.data.both.masking}
                            label="Masking" />
                        <Unit>dBHL</Unit>
                    </UnitWrap>
                </Row>
            </Wrapper>
        )
    }
}


export default connect( mapStateToProps, mapDispatchToProps )(Audiometrie);
