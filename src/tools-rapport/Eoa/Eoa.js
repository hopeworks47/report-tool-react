import React, { Component } from "react";
import styled from 'styled-components';
import { Subtitle, Select } from '../../components';
import { connect } from 'react-redux'
import SetupData from './SetupData'
import {addRapport, updateRapport} from '../../actions'

import { Button } from '../../components'

const Wrapper = styled.div`
display:${props => props.show?"flex":"none"};
flex-direction: column;
width:100%;
margin: 12px 0
`;

const Row = styled.div`
width:100%;
justify-content: ${props => (props.center)? "center" : (props.spaceBetween)?"space-between" : (props.right)?"flex-end":"unset"}
max-width: ${props => props.fullWidth?"none":"900px"};
display: ${props => (props.hidden)? "none" : "flex"}
flex-wrap: ${props => props.wrap ? "wrap" : "nowrap"} ;
`;

const Col = styled.div`
    width:${100/6}% ;
    @media screen and (max-width: 1024px) {
        text-align:center ;
        width: 20%;
    }
`;
const UnitWrap = styled.div`
display: ${props => (props.hidden)? "none" : "flex"}
align-items: flex-end;
max-width: 100px;
margin-right: 32px;
`;
const Unit = styled.div`
margin: 6px 0;
`;

const Oreille = styled.div`
color: #7D7D7D;
font-size: 21px;
margin: 24px 0;
`;
const Red = styled.span`
color: #f15c5d
`;
const Blue = styled.span`
color: #5d6bb2
`;

const mapStateToProps = (state) => {
    if(state.rapport.fields[5] !== undefined){
        return {
            type: state.rapport.fields[0].data.type,
            data : state.rapport.fields[5].data,
            importData : (state.importer.rapport !== null )?state.importer.rapport[5].data:null,
        }
    }
    return {
        type: "8000hz",
        data : SetupData,
        importData: null
    }

};

const mapDispatchToProps = (dispatch) => {
    return ({
        init : data => dispatch(addRapport("Eoa", data)),
        setTousDroite: values => {dispatch(updateRapport("object","Eoa>freq>droite", values))},
        setTousGauche: values => {dispatch(updateRapport("object","Eoa>freq>gauche", values))},
        updateRapport : (element, value, type = "object") => dispatch(updateRapport(type, element, value))
    })
};

class Eoa extends Component {
    constructor(props){
        super(props);
        this.props.init(SetupData);
        this.state = {
            droite: "",
            gauche: ""
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.importData === null && this.props.importData !== null){
            this.props.updateRapport("Eoa>freq", this.props.importData.freq);
            this.props.updateRapport("Eoa>type", this.props.importData.type);
            this.forceUpdate();
        }
    }

    handleChange = (el , value) => {
        this.props.updateRapport(el, value);
        this.forceUpdate()
    };

    setTous = (side, val) => {
        if(side === "droite"){
            this.props.setTousDroite({
                500: val,
                1000: val,
                1500: val,
                2000: val,
                2500: val,
                3000: val,
                4000: val,
                5000: val,
                6000: val,
                7000: val,
                8000: val,
                9000: val,
                10000: val
            });
            this.setState({droite:val})
        }else{
            this.props.setTousGauche({
                500: val,
                1000: val,
                1500: val,
                2000: val,
                2500: val,
                3000: val,
                4000: val,
                5000: val,
                6000: val,
                7000: val,
                8000: val,
                9000: val,
                10000: val
            });
            this.setState({gauche:val})
        }
    };

    render(){
        return(
            <Wrapper show={(this.props.type !== "8000hz")}>
                <div className={"rapport-mobile-text"}>
                    <Subtitle text="Émission oto-acoustique" />
                </div>
                <Row fullWidth center>
                    <Row>
                        <Select
                            label="Type"
                            onChange={e => this.handleChange( "Eoa>type" , e)}
                            initValue={this.props.data.type}
                            options={["Produits de distorison", "Transient"]} />
                    </Row>
                </Row>
                <Row>
                    <Oreille><Red>Oreille droite</Red></Oreille>
                </Row>
                <Row>
                    <Button text="Tous Présents" secondary handleClick={() => this.setTous("droite", "Présent")} />
                    <Button text="Tous Absents" secondary handleClick={() => this.setTous("droite", "Absent")}/>
                    <Button text="Tous NT" secondary handleClick={() => this.setTous("droite", "NT")}/>
                    <Button text="Tout effacer"  handleClick={() => this.setTous("droite", "")}/>
                </Row>
                <Row fullWidth wrap>
                    <Col>
                        <Select
                            label="500hz"
                            onChange={e => this.handleChange( "Eoa>freq>droite>500" , e)}
                            initValue={this.props.data.freq.droite[500]}
                            options={["","Présent","Absent","NT"]} />
                    </Col>
                    <Col>
                        <Select
                            label="1000hz"
                            onChange={e => this.handleChange("Eoa>freq>droite>1000"  , e)}
                            initValue={this.props.data.freq.droite[1000]}
                            options={["","Présent","Absent","NT"]} />
                    </Col>
                    <Col>
                        <Select
                            label="1500hz"
                            onChange={e => this.handleChange( "Eoa>freq>droite>1500"  , e)}
                            initValue={this.props.data.freq.droite[1500]}
                            options={["","Présent","Absent","NT"]} />
                    </Col>
                    <Col>
                        <Select
                            label="2000hz"
                            onChange={e => this.handleChange( "Eoa>freq>droite>2000" , e)}
                            initValue={this.props.data.freq.droite[2000]}
                            options={["","Présent","Absent","NT"]} />
                    </Col>
                    <Col>
                        <Select
                            label="2500hz"
                            onChange={e => this.handleChange( "Eoa>freq>droite>2500" , e)}
                            initValue={this.props.data.freq.droite[2500]}
                            options={["","Présent","Absent","NT"]} />
                    </Col>
                    <Col>
                        <Select
                            label="3000hz"
                            onChange={e => this.handleChange("Eoa>freq>droite>3000" , e)}
                            initValue={this.props.data.freq.droite[3000]}
                            options={["","Présent","Absent","NT"]} />
                    </Col>
                    <Col>
                        <Select
                            label="4000hz"
                            onChange={e => this.handleChange( "Eoa>freq>droite>4000"  , e)}
                            initValue={this.props.data.freq.droite[4000]}
                            options={["","Présent","Absent","NT"]} />
                    </Col>
                    <Col>
                        <Select
                            label="5000hz"
                            onChange={e => this.handleChange("Eoa>freq>droite>5000" , e)}
                            initValue={this.props.data.freq.droite[5000]}
                            options={["","Présent","Absent","NT"]} />
                    </Col>
                    <Col>
                        <Select
                            label="6000hz"
                            onChange={e => this.handleChange( "Eoa>freq>droite>6000"  , e)}
                            initValue={this.props.data.freq.droite[6000]}
                            options={["","Présent","Absent","NT"]} />
                    </Col>
                    <Col>
                        <Select
                            label="7000hz"
                            onChange={e => this.handleChange( "Eoa>freq>droite>7000", e)}
                            initValue={this.props.data.freq.droite[7000]}
                            options={["","Présent","Absent","NT"]} />
                    </Col>
                    <Col>
                        <Select
                            label="8000hz"
                            onChange={e => this.handleChange( "Eoa>freq>droite>8000"  , e)}
                            initValue={this.props.data.freq.droite[8000]}
                            options={["","Présent","Absent","NT"]} />
                    </Col>
                    <Col>
                        <Select
                            label="9000hz"
                            onChange={e => this.handleChange( "Eoa>freq>droite>9000" , e)}
                            initValue={this.props.data.freq.droite[9000]}
                            options={["","Présent","Absent","NT"]} />
                    </Col>
                    <Col>
                        <Select
                            label="10 000hz"
                            onChange={e => this.handleChange( "Eoa>freq>droite>10000" , e)}
                            initValue={this.props.data.freq.droite[10000]}
                            options={["","Présent","Absent","NT"]} />
                    </Col>
                </Row>
                <Row>
                    <Oreille> <Blue>Oreille gauche</Blue></Oreille>
                </Row>
                <Row>
                    <Button text="Tous Présents" secondary handleClick={() => this.setTous("gauche", "Présent")} />
                    <Button text="Tous Absents" secondary handleClick={() => this.setTous("gauche", "Absent")}/>
                    <Button text="Tous NT" secondary handleClick={() => this.setTous("gauche", "NT")}/>
                    <Button text="Tout effacer"  handleClick={() => this.setTous("gauche", "")}/>
                </Row>
                <Row fullWidth wrap>
                    <Col>
                        <Select
                            label="500hz"
                            onChange={e => this.handleChange( "Eoa>freq>gauche>500" , e)}
                            initValue={this.props.data.freq.gauche[500]}
                            options={["","Présent","Absent","NT"]} />
                    </Col>
                    <Col>
                        <Select
                            label="1000hz"
                            onChange={e => this.handleChange( "Eoa>freq>gauche>1000" , e)}
                            initValue={this.props.data.freq.gauche[1000]}
                            options={["","Présent","Absent","NT"]} />
                    </Col>
                    <Col>
                        <Select
                            label="1500hz"
                            onChange={e => this.handleChange( "Eoa>freq>gauche>1500" , e)}
                            initValue={this.props.data.freq.gauche[1500]}
                            options={["","Présent","Absent","NT"]} />
                    </Col>
                    <Col>
                        <Select
                            label="2000hz"
                            onChange={e => this.handleChange( "Eoa>freq>gauche>2000" , e)}
                            initValue={this.props.data.freq.gauche[2000]}
                            options={["","Présent","Absent","NT"]} />
                    </Col>
                    <Col>
                        <Select
                            label="2500hz"
                            onChange={e => this.handleChange( "Eoa>freq>gauche>2500" , e)}
                            initValue={this.props.data.freq.gauche[2500]}
                            options={["","Présent","Absent","NT"]} />
                    </Col>
                    <Col>
                        <Select
                            label="3000hz"
                            onChange={e => this.handleChange( "Eoa>freq>gauche>3000" , e)}
                            initValue={this.props.data.freq.gauche[3000]}
                            options={["","Présent","Absent","NT"]} />
                    </Col>
                    <Col>
                        <Select
                            label="4000hz"
                            onChange={e => this.handleChange( "Eoa>freq>gauche>4000" , e)}
                            initValue={this.props.data.freq.gauche[4000]}
                            options={["","Présent","Absent","NT"]} />
                    </Col>
                    <Col>
                        <Select
                            label="5000hz"
                            onChange={e => this.handleChange( "Eoa>freq>gauche>5000" , e)}
                            initValue={this.props.data.freq.gauche[5000]}
                            options={["","Présent","Absent","NT"]} />
                    </Col>
                    <Col>
                        <Select
                            label="6000hz"
                            onChange={e => this.handleChange( "Eoa>freq>gauche>6000" , e)}
                            initValue={this.props.data.freq.gauche[6000]}
                            options={["","Présent","Absent","NT"]} />
                    </Col>
                    <Col>
                        <Select
                            label="7000hz"
                            onChange={e => this.handleChange( "Eoa>freq>gauche>7000" , e)}
                            initValue={this.props.data.freq.gauche[7000]}
                            options={["","Présent","Absent","NT"]} />
                    </Col>
                    <Col>
                        <Select
                            label="8000hz"
                            onChange={e => this.handleChange( "Eoa>freq>gauche>8000" , e)}
                            initValue={this.props.data.freq.gauche[8000]}
                            options={["","Présent","Absent","NT"]} />
                    </Col>
                    <Col>
                        <Select
                            label="9000hz"
                            onChange={e => this.handleChange( "Eoa>freq>gauche>9000" , e)}
                            initValue={this.props.data.freq.gauche[9000]}
                            options={["","Présent","Absent","NT"]} />
                    </Col>
                    <Col>
                        <Select
                            label="10 000hz"
                            onChange={e => this.handleChange( "Eoa>freq>gauche>10000" , e)}
                            initValue={this.props.data.freq.gauche[10000]}
                            options={["","Présent","Absent","NT"]} />
                    </Col>
                </Row>
            </Wrapper>
        )
    }
}


export default connect( mapStateToProps, mapDispatchToProps )(Eoa);
