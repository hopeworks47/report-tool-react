import React, { Component } from "react";
import styled from "styled-components";
import $ from 'jquery';

import { Button, Title, Subtitle, InputText, pdfGenerator } from '../../../components';
import { colors, fontSizes } from '../../../components/values';

const Wrapper = styled.div`
    height: 100%;
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    background-color: ${colors.overlay};
    display:${props => props.show?"flex":"none"};
    justify-content:center;
    align-items:center;
    z-index : 9999;
`;

const Inner = styled.div`
    background-color: ${colors.white};
    border-radius: 24px;
    height: 100%;
    width: 100%;
    max-width: 600px;
    max-height: 380px;
    padding: 24px;
`;

const Msg = styled.div`
    font-size: ${fontSizes.small};
    color: ${colors.text};
    margin: 3px 12px;
    min-height: 18px;
`;

const Row = styled.div`
    display: flex;
    align-items: flex-end;
`;

class EmailAndFaxForm extends Component {
    constructor(props){
        super(props);
        this.state = {
            email : "",
            phone : "",
            msg : ""
        }
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        if(this.state.email !== nextProps.defaultEmail &&
            !nextProps.show)
            this.setState({ email: nextProps.defaultEmail});

        return true;
    }

    uploadReport = () => {
        return new Promise((res, err) => {
            let report = pdfGenerator(this.props.report).output('blob');
            let data = new FormData();
            data.append('data' , report, 'generatedReport.pdf');
            $.ajax({
                url: '/API/upload/tmp',
                type: 'POST',
                data: data,
                success: reportPath => {
                    res(JSON.parse(reportPath)[0]);
                },
                cache: false,
                contentType: false,
                processData: false
            });
        })
    };

    getAndUploadTemplate = () => {
        return new Promise((res, err) => {
            $.ajax({
                url: '/API/email/template/report',
                type: 'GET',
                success: template => {
                    let data = new FormData();
                    data.append('template', new Blob([template]), 'emailTemplate.html');
                    $.ajax({
                        url: '/API/upload/tmp',
                        type: 'POST',
                        data: data,
                        success: templatePath => {
                            res(JSON.parse(templatePath)[0]);
                        },
                        cache: false,
                        contentType: false,
                        processData: false
                    });
                },
                cache: false,
                contentType: false,
                processData: false
            });
        })
    };

    sendReportByEmail = () => {
        Promise
        .all([
            this.uploadReport(),
            this.getAndUploadTemplate()
        ])
        .then(filesPath => {
            $.ajax({
                method: "POST",
                url: "/API/email/send",
                data: {
                    recipient : this.state.email,
                    subject : "Votre Rapport audiologique de chez ODYO",
                    from : "no-reply@odyo.ca",
                    message : "first:"+ this.props.report.informations.fields.prenom +"#last:" + this.props.report.informations.fields.nom,
                    template : filesPath[1],
                    attachments : filesPath[0]
                },
                success: data => {
                    console.log(data);
                    this.setState({
                        msg: "Courriel envoyé à l'adresse " + this.state.email
                    });
                }
            })
        });
    };

    sendReportByFax = () => {
        this.uploadReport()
        .then( reportPath => {
            $.ajax({
                method: "POST",
                url: "/API/fax/send",
                data: {
                    recipient : this.state.phone,
                    attachment : reportPath
                },
                success: data => {
                    console.log(data);
                    this.setState({
                        msg: "Fax envoyé au numéro " + this.state.phone
                    });
                }
            })
        })
    };

    render() {
        return(
            <Wrapper show={this.props.show}>
                <Inner>
                    <Title text={"Envoyer le rapport"} />
                    <Msg>
                        {
                            this.state.msg
                        }
                    </Msg>
                    <Subtitle text={"Par courriel"} />
                    <Row>
                        <InputText
                            label={"Courriel du destinataire"}
                            defaultValue={this.props.defaultEmail}
                            onChange={e => {
                                if(e === "")
                                    e = this.props.defaultEmail;

                                this.setState({
                                    email : e
                                })
                            }}
                        />
                        <div style={{marginBottom:6}}>
                            <Button text={"Envoyer"} handleClick={() => {
                                this.sendReportByEmail();
                            }}/>
                        </div>
                    </Row>
                    <Subtitle text={"Par fax"} />
                    <Row>
                        <InputText
                            label={"Téléphone du destinataire"}
                            onChange={e => {
                                this.setState({
                                    phone : e
                                })
                            }}
                        />
                        <div style={{marginBottom:6}}>
                            <Button text={"Envoyer"} handleClick={() => {
                                this.sendReportByFax();
                            }}/>
                        </div>
                    </Row>
                    <div style={{ width: "100%", display: "flex", justifyContent: "center", marginTop: 20}}
                    >
                        <Button secondary text={"Fermer"} handleClick={() => {
                            this.props.close();
                        }} />
                    </div>
                </Inner>
            </Wrapper>
        );
    }
}

export default EmailAndFaxForm;
