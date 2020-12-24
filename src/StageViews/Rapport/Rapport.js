import React from "react";
import styled from 'styled-components';
import { Title, Subtitle, Button, Switch } from '../../components';
import { switchState } from '../../actions'
import { connect } from 'react-redux'
import { Audiogramme, Masking, Tympano, Seuils, Audiometrie, Eoa, Divers, Notes } from '../../tools-rapport'
import SetupData from "../../tools-rapport/Eoa/SetupData/SetupData";

const Wrapper = styled.div`
position: relative
`;

const Inner = styled.div`
width: 100%
`;

const Row = styled.div`
    display: flex;
    justify-content: ${props => props.right ? "flex-end" : "flex-start"}
    align-items: ${props => props.center ? "center" : "unset"}
    color: #7D7D7D;
    align-items: center
`;

const Oreille = styled.div`
width: 100%;
text-align:center;
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

const FinalSwitch = styled.div`
margin: 24px 0;
`;
const Hr = styled.div`
width: 80%;
height: 1px;
background-color: #cccccc;
margin: 72px 10%;
box-sizing: border-box;
display: ${props => props.show ? "none" : "block"}
`;

const Rapport = ({ dispatch, type }) => {
    return (
        <Wrapper className="w3-animate-right">
            <Inner>
                <Row>
                    <Title text="Rapport Audiologique" />
                </Row>
                <Row>
                    <Audiogramme />
                </Row>
                <Row>
                    <Masking />
                </Row>
                <Hr />
                <Row className={"rapport-mobile-text"}>
                    <Subtitle text="Tympanométrie" />
                </Row>
                <Row>
                    <Oreille> <Red>Oreille droite</Red></Oreille>
                    <Oreille> <Blue>Oreille gauche</Blue></Oreille>
                </Row>
                <Row>
                    <Tympano />
                </Row>
                <Hr />
                <Row className={"rapport-mobile-text"}>
                    <Subtitle text="Seuils de réflexe stapédien" />
                </Row>
                <Row>
                    <Oreille><Red>Oreille droite</Red></Oreille>
                    <Oreille><Blue>Oreille gauche</Blue></Oreille>
                </Row>
                <Row>
                    <Seuils />
                </Row>
                <Hr />
                <Row className={"rapport-mobile-text"}>
                    <Subtitle text="Audiométrie Vocale" />
                </Row>
                <Row>
                    <Oreille><Red>Oreille droite</Red></Oreille>
                    <Oreille><Blue>Oreille gauche</Blue></Oreille>
                </Row>
                <Row>
                    <Audiometrie />
                </Row>
                <Hr />
                <Row>
                    <Eoa />
                </Row>
                <Hr className={"not shown"} show={( type === "8000hz")}/>
                <Row className={"rapport-mobile-text"}>
                    <Subtitle text="Divers" />
                </Row>
                <Row>
                    <Divers />
                </Row>
                <Row right>
                    <FinalSwitch>Rapport complété</FinalSwitch>
                    <Switch color1="#76D36D" color2="#7d7d7d" handleClick={e => {
                        return true
                    }}/>
                </Row>
                <Row right>
                    <Button text="Suivant" handleClick={e => {
                        dispatch(switchState(2))
                        document.getElementById("root").scrollTo(0,0)
                        window.scrollTo(0,0)
                    }}/>
                </Row>
            </Inner>
            <Notes />
        </Wrapper>
        );
  };

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
export default connect(mapStateToProps)(Rapport);
