import React, { Component } from "react";
import styled from 'styled-components';
import {Checkbox, DateTimePicker, Select, Subtitle} from '../../components'
import Graph from './Graph';
import Option from './Option'
import { connect } from 'react-redux'

import $ from 'jquery';
import {addRapport, updateRapport} from "../../actions";


const Container = styled.div`
width: 100%;
height:100%;
display: flex;
flex-direction:column;
align-items: center
`;

const TestType = styled.div`
    display: ${props => props.hide?"none":"flex"};
    width: 300px;
    align-items: center;
    margin-bottom: 12px;
`;

const Wrap = styled.div`
width: 100%;
height:100%;
display: flex;
justify-content: space-around;
margin-bottom: 12px;
align-items: center
`;

const Tools = styled.div`
color: #7D7D7D;
display: flex;
flex-direction: column;
align-items: center;
max-width: 220px;
margin: 0 10px;
& > div{
    margin-top: 12px;
    text-align: center
    display: flex;
    flex-direction: column;
    align-items: center;
}
@media screen and (max-width: 1024px) {
    background-color: white;
    display:none;
}
`;

const Tool = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    @media screen and (max-width: 1024px) {
        padding: 0 10px;
    }
`;
const Row = styled.div`
    display: ${props => props.mobileRowTools ? "none" : "flex"}
    justify-content: ${props => props.right ? "flex-end" : "flex-start"}
    align-items: ${props => props.center ? "center" : "unset"}
    color: #7D7D7D;
    align-items: center;
    width:100%;
    @media screen and (max-width: 1024px) {
        flex-wrap: ${props => props.mobileRowTools ? "wrap" : "unset"}
        align-items: ${props => props.mobileRowTools ? "flex-start" : "center"}
        ${props => {
            if (props.mobileRowTools) {
                return {
                    "display" : "flex"
                }
            }
        }}
    }
`;
const Oreille = styled.div`
width: 100%;
text-align:center;
color: #7D7D7D;
font-size: 21px;
margin: 24px 0;
@media screen and (max-width: 1024px) {
    font-size: 25px ;
    font-family: Myriad Pro condensend
}
`;
const Red = styled.span`
color: #f15c5d
`;
const Blue = styled.span`
color: #5d6bb2
`;

const mapStateToProps = (state) => {
    if(state.rapport.fields[0] === undefined){
        return {
            nonReponse : false,
            mode : "Standard",
            type: "8000hz",
            dateAnterieur: ""
        }
    }
    return {
        nonReponse : state.rapport.fields[0].data.nonReponse,
        type : state.rapport.fields[0].data.type,
        mode : state.rapport.fields[0].data.mode,
        dateAnterieur : state.rapport.fields[0].data.dateAnterieur,
        importRight : (state.importer.rapport !== null)?state.importer.rapport[0].data.graph.right:null,
        importLeft : (state.importer.rapport !== null)?state.importer.rapport[0].data.graph.left:null,
        importData : (state.importer.rapport !== null)?state.importer.rapport[0].data:null,
    }
};

let initData = {
    dateAnterieur: "",
    type: "8000hz",
    mode: "Standard",
    nonReponse: false,
    graph: {
        left: null,
        right: null
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        addRapport : () => dispatch(addRapport("audiogramme", initData)),
        updateRapport : (element, value, type = "object") => dispatch(updateRapport(type, element, value)),
    }
};

let cercle, cercleNr, x, xNr, triangle, triangleNr,
    carre, carreNr, iRouge, iBleu, flecheRouge, flecheRougeNr,
    flecheBleu, flecheBleuNr, bracketRouge, bracketRougeNr,
    bracketBleu, bracketBleuNr, etoileRouge, etoileBleu,
    anterieur, dashedBleu, dashedRouge, champLibre;

const getIcons = options => {
    return new Promise((res, err) => {
        let url = "https://odyoonline.com/report-icons/";
            options[1].symbols[1].img.right = url + "cercle.svg";
            options[1].symbols[1].img.rightNr = url + "cercle_nr.svg";
            options[1].symbols[1].img.left = url + "x.svg";
            options[1].symbols[1].img.leftNr = url + "x_nr.svg";
            options[1].symbols[2].img.right = url + "triangle.svg";
            options[1].symbols[2].img.rightNr = url + "triangle_mr.svg";
            options[1].symbols[2].img.left = url + "carre.svg";
            options[1].symbols[2].img.leftNr = url + "carre_nr.svg";
            options[1].symbols[3].img.right = url + "i_rouge.svg";
            options[1].symbols[3].img.left = url + "i_bleu.svg";
            options[2].symbols[1].img.right = url + "fleche_rouge.svg";
            options[2].symbols[1].img.rightNr = url + "fleche_rouge_nr.svg";
            options[2].symbols[1].img.left = url + "fleche_bleu.svg";
            options[2].symbols[1].img.leftNr = url + "fleche_bleu_nr.svg";
            options[2].symbols[2].img.right = url + "bracket_rouge.svg";
            options[2].symbols[2].img.rightNr = url + "bracket_rouge_nr.svg";
            options[2].symbols[2].img.left = url + "bracket_bleu.svg";
            options[2].symbols[2].img.leftNr = url + "bracket_bleu_nr.svg";
            options[3].symbols[1].img.right = url + "etoile_rouge.svg";
            options[3].symbols[1].img.left = url + "etoile_bleu.svg";
            options[3].symbols[2].img.right = url + "anterieur.svg";
            options[3].symbols[2].img.left = url + "anterieur.svg";
            options[2].symbols[3].img.right = url + "dashed_rouge.svg";
            options[2].symbols[3].img.left = url + "dashed_bleu.svg";
            options[0].symbols[1].img.right = url + "champ_libre.svg";
            options[0].symbols[1].img.left = url + "champ_libre.svg";
            res(options);
    })
};

class Audiogramme extends Component{
    constructor(props){
        super(props);
        this.props.addRapport();
        this.state = {
            init: true,
            options: {
                0:{
                    title: "",
                    hidden:true,
                    symbols:{
                        1:{
                            active:false,
                            id:8,
                            title: "Champ Libre",
                            img:{
                                right:champLibre,
                                left:champLibre
                            }
                        }
                    }
                },
                1:{
                    title: "Condution Aérienne",
                    symbols: {
                        1:{
                            active: true,
                            id: 0,
                            title: "Non Masqué",
                            dependency: 1,
                            lineWidth: 2,
                            nr: true,
                            img : {
                                right : cercle,
                                left : x,
                                rightNr: cercleNr,
                                leftNr: xNr
                            }
                        },
                        2:{
                            active: false,
                            id: 1,
                            title: "Masqué",
                            dependency: 0,
                            lineWidth: 2,
                            nr: true,
                            img : {
                                right : triangle,
                                left : carre,
                                rightNr: triangleNr,
                                leftNr: carreNr
                            }
                        },
                        3:{
                            active: false,
                            id: 2,
                            title: "Inconfort",
                            img : {
                                right : iRouge,
                                left : iBleu,
                            }
                        }
                    }

                },
                2:{
                    title: "Conduction Osseuse",
                    symbols: {
                        1:{
                            active: false,
                            id: 3,
                            title: "Non Masqué",
                            nr: true,
                            img : {
                                right : flecheRouge,
                                left : flecheBleu,
                                rightNr : flecheRougeNr,
                                leftNr : flecheBleuNr
                            }
                        },
                        2:{
                            active: false,
                            id: 4,
                            title: "Masqué",
                            nr: true,
                            img : {
                                right : bracketRouge,
                                left : bracketBleu,
                                rightNr : bracketRougeNr,
                                leftNr : bracketBleuNr
                            }
                        },
                        3:{
                            active: false,
                            id: 5,
                            title: "Pointillé",
                            lineWidth: 2,
                            lineDash: 5,
                            noDraw: true,
                            img: {
                                right: dashedRouge,
                                left: dashedBleu
                            }
                        }
                    }
                },
                3:{
                    title: "Autre",
                    symbols: {
                        1:{
                            active: false,
                            id: 6,
                            title: "Surassourdissement et/ou\n" +
                                "Masque insuffisant et/ou\n" +
                                "Plateau impossible",
                            img : {
                                right : etoileRouge,
                                left : etoileBleu
                            }
                        },
                        2:{
                            active: false,
                            id: 7,
                            title: "Résultats antérieurs",
                            img: {
                                right: anterieur,
                                left: anterieur
                            }
                        }
                    }
                }
            }
        };
        getIcons(this.state.options).then((updatedOptions) => {
            this.setState({
                init: false,
                options : updatedOptions
            })
        });
    }

    switchTool = toolId => {
        let currentTool = {
            catIndex : 0,
            toolIndex : 0
        };
        let nextTool = {
            catIndex : 0,
            toolIIndex : 0
        };
        Object.keys(this.state.options).map(category => {
            let catIndex = category;
            category = this.state.options[category];
            Object.keys(category.symbols).map(symbol => {
                let toolIndex = symbol;
                symbol = category.symbols[symbol];
                if(symbol.active)
                    currentTool = {catIndex : catIndex, toolIndex : toolIndex};
                if(toolId === symbol.id)
                    nextTool = {catIndex : catIndex, toolIndex : toolIndex};

                return true;
            });
            return true;
        });
        let options = this.state.options;
        let updatedOptions = {
            ...options,
            [currentTool.catIndex]: {
                ...options[currentTool.catIndex],
                symbols: {
                    ...options[currentTool.catIndex].symbols,
                    [currentTool.toolIndex]: {
                        ...options[currentTool.catIndex].symbols[currentTool.toolIndex],
                        active: false
                    }
                }
            }
        };
        let finalOptions = {
            ...updatedOptions,
            [nextTool.catIndex]:{
                ...updatedOptions[nextTool.catIndex],
                symbols:{
                    ...updatedOptions[nextTool.catIndex].symbols,
                    [nextTool.toolIndex]:{
                        ...updatedOptions[nextTool.catIndex].symbols[nextTool.toolIndex],
                        active: true
                    }
                }
            }
        };
        this.setState({
            options: finalOptions
        })
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.importData === null && this.props.importData !== null) {
            if(this.props.importData.type !== undefined)
                this.props.updateRapport("audiogramme>type", this.props.importData.type);

            if(this.props.importData.mode !== undefined)
                this.props.updateRapport("audiogramme>mode", this.props.importData.mode);

            if(this.props.importData.dateAnterieur !== undefined)
                this.props.updateRapport("audiogramme>dateAnterieur", this.props.importData.dateAnterieur);
        }

        if(prevProps.type !== "Champ Libre" && this.props.type === "Champ Libre"){
            this.setState({
                ...this.state,
                options : {
                    ...this.state.options,
                    0:{
                        ...this.state.options[0],
                        hidden:false
                    }
                }
            })
        }else if(prevProps.type === "Champ Libre" && this.props.type !== "Champ Libre") {
            this.setState({
                ...this.state,
                options: {
                    ...this.state.options,
                    0: {
                        ...this.state.options[0],
                        hidden: true
                    }
                }
            })
        }
    }


    isNr = (itIsNr, itIsCurrentTool) => {
        if(!itIsNr || !itIsCurrentTool)
            return;

        return(
            <Checkbox
                label={"Non-réponse"}
                onChange={e => this.props.updateRapport( "audiogramme>nonReponse", e, "boolean")}
                preChecked={this.props.nonReponse} />
        );
    };

    parseDate = date => {
        let day = (date.getDate() < 10)?"0"+date.getDate():date.getDate();
        let month = ((date.getMonth()+1) < 10)?"0"+(date.getMonth()+1):(date.getMonth()+1);

        return day + "/" + month + "/" + date.getFullYear();
    };

    render(){
        let currentTool = {
            left: null,
            right: null
        };
        Object.keys(this.state.options).map(category => {
            category = this.state.options[category];
            Object.keys(category.symbols).map(symbol => {
                symbol = category.symbols[symbol];
                if(symbol.active)
                    currentTool = symbol;
            })
        });

        return(
            <Container>
                <TestType className={"mobile-type-rapport"}>
                    <Select
                        label="Type de rapport"
                        onChange={e =>
                            {
                                this.props.updateRapport("audiogramme>type", e);
                                this.props.updateRapport("divers>transducteur>intra" , (e !== "Champ Libre"), "boolean");
                                this.props.updateRapport("divers>transducteur>champLibre" , (e === "Champ Libre"), "boolean");

                            }
                        }
                        initValue={this.props.type}
                        options={["8000hz", "16 000hz", "Champ Libre"]}
                    />
                </TestType>
                <Row className={"rapport-mobile-text"}>
                    <Subtitle text="Audiogramme" />
                </Row>
                <TestType hide={this.props.type !== "8000hz"}>
                    <Select
                        label="Mode d'évaluation"
                        onChange={e => this.props.updateRapport("audiogramme>mode", e)}
                        initValue={this.props.mode}
                        options={["Standard", "Jeu", "Visuel"]} />
                </TestType>
                <Row>
                    <Oreille><Red>Oreille droite</Red></Oreille>
                    <Oreille><Blue>Oreille gauche</Blue></Oreille>
                </Row>
                <Row className={"mobile-tools-layout"} mobileRowTools>
                    {
                        Object.keys(this.state.options).map((category, i) => {
                            category = this.state.options[category];
                            if(category.hidden)
                                return <div/>;
            
                            return (
                                <div key={i} className={"mobile-tool-option-layout"}>
                                    <div style={{marginBottom: 8}} className={"mobile-tool-title"}>{category.title}</div>
                                    <div className={"mobile-tool-option-layout-2"}>
                                        {
        
                                            Object.keys(category.symbols).map((symbol, i) => {
                                                symbol = category.symbols[symbol];
                                                return(
                                                    <Tool key={i} mobileToolLayout>
                                                        <div >{symbol.title}</div>
                                                        <Option
                                                            icon1={symbol.img.right}
                                                            icon2={symbol.img.left}
                                                            active={symbol.active}
                                                            onClick={() =>
                                                            {
                                                                this.switchTool(symbol.id);
                                                            }}
                                                        />
                                                        {
                                                            this.isNr(symbol.nr, symbol.active)
                                                        }
                                                    </Tool>
                                                )
                                            })
                                        }
                                    </div>
                                    
                                </div>
                            )
                        })
                    }
                    <DateTimePicker
                        mobileToolDate
                        dateonly
                        defaultValue={
                            (this.props.dateAnterieur !== "") ?
                                this.parseDate(new Date(this.props.dateAnterieur))
                                :""
                        }
                        onChange={e => this.props.updateRapport( "audiogramme>dateAnterieur", e, "string")}
                        label={"Date Antérieur"} />
                </Row>
                <Wrap>
                    <Graph
                        import={this.props.importRight}
                        currentTool={currentTool.id}
                        dependency={currentTool.dependency}
                        symbol={(this.props.nonReponse && currentTool.nr)?currentTool.img.rightNr:currentTool.img.right}
                        lineWidth={currentTool.lineWidth}
                        lineDash={currentTool.lineDash}
                        nonReponse={(currentTool.nr && this.props.nonReponse)}
                        type={this.props.type}
                        noDraw={currentTool.noDraw}
                        onChange={graph => this.props.updateRapport("audiogramme>graph>right", graph)}
                        msp3={value => this.props.updateRapport("audiometrie>droite>msp>freq3", Math.round(value).toString())}
                        msp4={value => this.props.updateRapport("audiometrie>droite>msp>freq4", Math.round(value).toString())}
                    />
                    <Tools className={"desktop-tools-layout"}>
                        {
                            Object.keys(this.state.options).map((category, i) => {
                                category = this.state.options[category];
                                if(category.hidden)
                                    return <div/>;

                                return (
                                    <div key={i}>
                                        <div style={{marginBottom: 8}}>{category.title}</div>
                                        {
                                            Object.keys(category.symbols).map((symbol, i) => {
                                                symbol = category.symbols[symbol];
                                                return(
                                                    <Tool key={i}>
                                                        <div>{symbol.title}</div>
                                                        <Option
                                                            icon1={symbol.img.right}
                                                            icon2={symbol.img.left}
                                                            active={symbol.active}
                                                            onClick={() =>
                                                            {
                                                                this.switchTool(symbol.id);
                                                            }}
                                                        />
                                                        {
                                                            this.isNr(symbol.nr, symbol.active)
                                                        }
                                                    </Tool>
                                                )
                                            })
                                        }
                                    </div>
                                )
                            })
                        }
                        <DateTimePicker
                            dateonly
                            defaultValue={
                                (this.props.dateAnterieur !== "") ?
                                    this.parseDate(new Date(this.props.dateAnterieur))
                                    :""
                            }
                            onChange={e => this.props.updateRapport( "audiogramme>dateAnterieur", e, "string")}
                            label={"Date Antérieur"} />
                    </Tools>
                    <Graph
                        import={this.props.importLeft}
                        left
                        currentTool={currentTool.id}
                        dependency={currentTool.dependency}
                        symbol={(this.props.nonReponse && currentTool.nr)?currentTool.img.leftNr:currentTool.img.left}
                        lineWidth={currentTool.lineWidth}
                        lineDash={currentTool.lineDash}
                        nonReponse={(currentTool.nr && this.props.nonReponse)}
                        type={this.props.type}
                        noDraw={currentTool.noDraw}
                        onChange={graph => this.props.updateRapport("audiogramme>graph>left", graph)}
                        msp3={value => this.props.updateRapport("audiometrie>gauche>msp>freq3", Math.round(value).toString())}
                        msp4={value => this.props.updateRapport("audiometrie>gauche>msp>freq4", Math.round(value).toString())}
                    />
                </Wrap>
            </Container>
        );
    }
}
export default connect( mapStateToProps, mapDispatchToProps )(Audiogramme);
