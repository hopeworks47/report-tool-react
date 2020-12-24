import {connect} from "react-redux";
import React, { Component } from "react";
import styled from 'styled-components';

import EmailAndFaxForm from './EmailAndFaxForm';

import {Button, Subtitle, pdfGenerator} from "../../components";
import $ from "jquery";


const Wrapper = styled.div`
    padding-top: 24px;
`;

const Row = styled.div`
    display:flex;
    justify-content:${props => props.right?"flex-end":"flex-start"};
    margin-bottom: 24px;
`;

const mapStateToProps = (state) => {
    return {
        state : state
    }
};

class Pdf extends Component{
    constructor(props){
        super(props);
        this.state = {
            prepareSend: false
        }
    }

    parseDate = date => {
        let day = (date.getDate() < 10)?"0"+date.getDate():date.getDate();
        let month = ((date.getMonth()+1) < 10)?"0"+(date.getMonth()+1):(date.getMonth()+1);

        return date.getFullYear() + "" + month + "" + day;
    };

    render() {
        return(
            <Wrapper className="w3-animate-right">
                <Row>
                    <Button text={"Télécharger"}
                        handleClick={() => {
                            pdfGenerator(this.props.state, this.props.state.rapport.fields[6].data.audiologiste).then(pdf => pdf.save(
                                "rapport-" +
                                this.props.state.informations.fields.nom + "-" +
                                this.props.state.informations.fields.prenom + "-" +
                                this.parseDate(new Date(this.props.state.rapport.fields[6].data.date))
                            ));
                        }}
                    />
                    <Subtitle text={"Télécharger le rapport en format PDF"} />
                </Row>
                <Row>
                    <EmailAndFaxForm
                        show={this.state.prepareSend}
                        defaultEmail={this.props.state.informations.fields.courriel}
                        report={this.props.state}
                        close={() => {
                            this.setState({
                                prepareSend: false
                            })
                        }}
                    />
                    <Button text={"Envoyer"} handleClick={() => {
                        this.setState({
                            prepareSend : true
                        })
                    }}/>
                    <Subtitle text={"Envoyer le rapport par courriel ou par fax"} />
                </Row>
                <Row>
                    <Button text={"Imprimer"} handleClick={() => {
                        pdfGenerator(this.props.state, this.props.state.rapport.fields[6].data.audiologiste).then(pdf => {
                            window.open(pdf.output('bloburl'), '_blank')
                        });
                    }} />
                    <Subtitle text={"Imprimer le rapport"} />
                </Row>
                <Row right>
                    <Button text={"Terminer et sauvegarder"} handleClick={() => {
                        $.post("/API/report/update", {
                            patientId: this.props.state.informations.patientId ,
                            rapportId : this.props.state.informations.rapportId,
                            rapport: JSON.stringify(this.props.state.rapport.fields)
                        }, function(success){
                            console.log(success);
                            window.location = window.location.href.split("?")[0];
                        }).fail(function() {
                            console.log("can't connect to backend");
                        })
                    }}/>
                </Row>
            </Wrapper>
        )
    }
}

export default connect( mapStateToProps )(Pdf);