import React, { Component } from "react";
import styled from 'styled-components';
import { Title, Subtitle, InputText, Button, Select, Checkbox, Switch } from '../../components';
import { switchState, updateSuivi, updateSwitch } from '../../actions'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import $ from 'jquery'

const Row = styled.div`
    display: flex;
    justify-content: ${props => props.right ? "flex-end" : "flex-start"}
    align-items: ${props => props.center ? "center" : "unset"}
    @media screen and (max-width: 1024px) {
        ${props => {
            if(props.mobileLayout) {
                return {
                    "justify-content" : "center"
                }
            }
        }}
    }
`
const Col30 = styled.div`
    width: 30%;
    display: ${props => props.hide?"none":"block"}
`
const Col40 = styled.div`
    width: 40%
`


const mapDispatchToProps = (dispatch) => {
    return({
        switchState : () => {dispatch(switchState(3))},
        updateSuivi: listes => {dispatch(updateSuivi(listes))},
        updateSwitch : (el) => {dispatch(updateSwitch(el))}
    })
}


const mapStateToProps = (state) => {
    if(state.rapport.fields[6] !== undefined){
        return {
            lang: state.rapport.fields[6].data.lang
        }
    }
    return{
        lang: "fr"
    };
}

let recommandations = {};

class Rapport extends Component {
    constructor(props){
        super(props);
        this.state = {
            selected : {}
        }
    }

    componentDidMount(){
        $.getJSON("/wp-content/themes/boss-child/RECOMMANDATIONS/ArbreDeRecommandations.json", data => {
            recommandations = data.francais
            this.setState({
                selected: {
                    0 : {
                        recommandation: {
                            nom: Object.keys(recommandations)[0],
                            liste: recommandations[Object.keys(recommandations)[0]].liste
                        },
                        precision: {
                            nom: Object.keys(recommandations[Object.keys(recommandations)[0]].sousListes)[0],
                            liste: recommandations[Object.keys(recommandations)[0]].sousListes[Object.keys(recommandations[Object.keys(recommandations)[0]].sousListes)[0]].liste
                        }
                    }
                }
            })
        })
    }

    switchPrecision = (e, i) => {
        let precision = {
            liste: null
        }
        if(recommandations[e].sousListes !== undefined){
            precision = {
                nom: Object.keys(recommandations[e].sousListes)[0],
                liste: recommandations[e].sousListes[Object.keys(recommandations[e].sousListes)[0]].liste
            }
        }
        this.setState({
            selected:{
                ...this.state.selected,
                [i]: {
                    recommandation: {
                        nom: e,
                        liste: recommandations[e].liste
                    },
                    precision: precision
                }
            }
        })
    }

    updatePrecision = (parent, e, i) => {
        this.setState({
            selected:{
                ...this.state.selected,
                [i]: {
                    ...this.state.selected[i],
                    precision: {
                        nom: e,
                        liste: recommandations[parent].sousListes[e].liste
                    }
                }
            }
        })
    }

    addRecommandation = () => {
        this.setState({
            selected:{
                ...this.state.selected,
                [Object.keys(this.state.selected).length] : {
                    recommandation: {
                        nom: Object.keys(recommandations)[0],
                        liste: recommandations[Object.keys(recommandations)[0]].liste
                    },
                    precision: {
                        nom: Object.keys(recommandations[Object.keys(recommandations)[0]].sousListes)[0],
                        liste: recommandations[Object.keys(recommandations)[0]].sousListes[Object.keys(recommandations[Object.keys(recommandations)[0]].sousListes)[0]].liste
                    }
                }
            }
        })
    }

    render(){
        return (
            <div className="w3-animate-right">
                <Row mobileLayout>
                    <Title text="Recommandations et suivi" />
                </Row>
                {
                    Object.keys(this.state.selected).map((x, i) => {
                        return(
                            <Row key={i}>
                                <Col30>
                                    <Select origin="suivi" label="Recommandation" onChange={e => {this.switchPrecision(e, i)}} options={Object.keys(recommandations)} />
                                </Col30>
                                <Col30 hide={(recommandations[this.state.selected[i].recommandation.nom].sousListes === undefined)}>
                                    <Select origin="suivi" onChange={e => {this.updatePrecision(this.state.selected[i].recommandation.nom, e, i)}} label={(this.props.lang === "fr")?"Type de produits recommandés":"Type of products recommended"}
                                        options={(recommandations[this.state.selected[i].recommandation.nom].sousListes === undefined)?[""]:Object.keys(recommandations[this.state.selected[i].recommandation.nom].sousListes)}
                                    />
                                </Col30>
                            </Row>
                        )
                    })
                }
                <Row mobileLayout>
                    <Button text={<FontAwesomeIcon icon="plus" />} handleClick={e => this.addRecommandation()} small/>
                </Row>
                <Row right center mobileLayout style={{marginBottom:6}}>
                    Le patient accepte de recevoir des courriels promotionnels
                    <Switch color1="#76D36D" color2="#7d7d7d" handleClick={() => {
                        this.props.updateSwitch("email")
                        return true;
                    }}/>
                </Row>
                <Row right>
                    <Button text="Suivant" handleClick={e => {
                        this.props.updateSuivi(this.state.selected);
                        this.props.switchState();
                        document.getElementById("root").scrollTo(0,0);
                        window.scrollTo(0,0);
                    }}/>
                </Row>
            </div>
            );
    }
  }

export default connect(mapStateToProps, mapDispatchToProps)(Rapport);
