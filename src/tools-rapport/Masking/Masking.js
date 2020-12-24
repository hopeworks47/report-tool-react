import React, { Component } from "react";
import styled from 'styled-components';
import { Subtitle, Checkbox, Select, InputText } from '../../components';
import { connect } from 'react-redux'
import { addRapport, updateRapport } from '../../actions'


const Wrapper = styled.div`
width: 100%;
display:${props => props.show?"flex":"none"};
justify-content: space-around;
color: #7D7D7D;
margin: 12px 0;
@media screen and (max-width: 1024px) {
    margin-top: ${props => props.mobileMarginTop ? "50px" : "unset"}
}
`;
const Col = styled.div`
width:100%;
display:flex;
flex-direction:column
`;

const Side = styled.div`
width: 100%;
display:flex;
flex-direction: column;
max-width: 500px
margin: 0 12px;
`;

const Spacer = styled.div`
width: 150px;
`;

const InnerWrapper = styled.div`
display:flex;
`;

const Left = styled.div`
width: 35px;
display:flex;
flex-direction: column;
& > div{
    height: 100%;
    display:flex;
    align-items:center;
    padding-right:3px;
    box-sizing: border-box;
}
`;

const Grid = styled.div`
background-color: white;
border: 1px solid #7D7D7D
border-radius: 8px;
`;

const Row = styled.div`
display:${props => props.hide?"none":"flex"};
border-bottom: 1px solid #7D7D7D;
width: 100%;
&:last-child{
    border-bottom:0
}
`;

const Case = styled.div`
border-right: 1px solid #7D7D7D;
&:last-child{
    border-right:0
}
& > input{
    background: none;
    border: 0;
    width: 100%;
    text-align: right;
    font-size: 14px;
    outline: none;
    padding: 6px;
    box-sizing: border-box;
}
`

const Bottom = styled.div`
display: flex;
width: calc(100% - 35px);
margin-left: 35px;
justify-content: space-around;
font-size:12px;
& > div{
    width: 100%
    text-align: center
}
`

let data = {
    gauche: {
        aerienne : {0 : 0},
        osseuse : {0 : 0}
    },
    droite: {
        aerienne : {0 : 0},
        osseuse : {0 : 0}
    },
    champLibre: {
        stimuli: {
            sonsPurs: false,
            sonsHulliles: false,
            sonsPulses: false,
            brf: false,
        },
        conditionnement: {
            visuel: false,
            jeu: false,
            reponsesMotrices: false
        },
        collaboration: "Bonne",
        collaborationAutre: ""
    }
};

const mapDispatchToProps = (dispatch) => {
    return({
        updateChampLibre: (object, value) => {dispatch(updateRapport("object", object , value))},
        update : (side, data) => {dispatch(updateRapport("object", "masking>"+side , data[side]))},
        init : () => {dispatch(addRapport("masking", data))}
    })
};

const mapStateToProps = state => {
    if(state.rapport.fields[1] !== undefined){
        return{
            type: state.rapport.fields[0].data.type,
            collaboration: state.rapport.fields[1].data.champLibre.collaboration,
            importData : (state.importer.rapport !== null )?state.importer.rapport[1].data:null,
        };
    }else{
        return{
            type: "",
            collaboration: "",
            importData : null
        }
    }
};

class Masking extends Component {
    constructor(props){
        super(props);
        this.props.init();
    }

    handleChange = (side, row, hertz, value) => {
        data[side][row][hertz] = value;
        this.props.update(side, data);
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.importData === null && this.props.importData !== null){
            data = {
                gauche: {
                    aerienne: (this.props.importData.gauche.aerienne !== undefined) ? this.props.importData.gauche.aerienne : {},
                    osseuse: (this.props.importData.gauche.osseuse !== undefined) ? this.props.importData.gauche.osseuse : {}
                },
                droite: {
                    aerienne: (this.props.importData.droite.aerienne !== undefined) ? this.props.importData.droite.aerienne : {},
                    osseuse: (this.props.importData.droite.osseuse !== undefined) ? this.props.importData.droite.osseuse : {}
                },
                champLibre: this.props.importData.champLibre
            };
            this.props.update("gauche",data);
            this.props.update("droite",data);
            this.props.updateChampLibre("masking>champLibre", this.props.importData.champLibre);
            this.forceUpdate()
        }
    }

    render(){
        let hertz = [250, 500, 750, 1000, 1500, 2000, 3000, 4000, 6000, 8000];
        if(this.props.type === "16 000hz"){
            hertz = [250, 500, 750, 1000, 1500, 2000, 3000, 4000, 6000, 8000, 9000, 10000, 11000, 12500, 14000, 16000];
        }

        let grids = [];
        for(let h = 0; h<2; h++){
            let grid = [];
            for(let i = 0; i<2; i++){
                let row = [];
                for(let j in hertz){
                    let input, side, thisRow;
                    let thisFreq = hertz[j];
                    if(h === 0){
                        side = "droite";
                    }else{
                        side = "gauche";
                    }
                    if(i === 0){
                        thisRow = "aerienne"
                    }else{
                        thisRow = "osseuse"
                    }
                    row.push(<Case key={i + "-" + j}><input
                        defaultValue={(data[side][thisRow][thisFreq] !== undefined)?data[side][thisRow][thisFreq]:""}
                        ref={node => input = node}
                        onChange={e => this.handleChange(side, thisRow, thisFreq, input.value)}
                        type="text" /></Case>)
                }
                grid.push(<Row key={i}>{row}</Row>);
            }
            grids.push(grid);
        }


        let bottom = [];
        for(let i in hertz){
            bottom.push(<div key={i}>{`${hertz[i]/1000}`}</div>)
        }

        return(
            <div style={{width : "100%"}}>
                <Wrapper show={!(this.props.type !== "Champ Libre")}>
                    <Row>
                        <Col>
                            <Subtitle text="Stimuli" />
                            <Checkbox
                                onChange={e => {this.props.updateChampLibre("masking>champLibre>stimuli>sonsPurs", e)}}
                                label="Sons Purs"
                                defaultChecked={data.champLibre.stimuli.sonsPurs}
                            />
                            <Checkbox
                                onChange={e => {this.props.updateChampLibre("masking>champLibre>stimuli>sonsHulliles", e)}}
                                label="Sons Hululés"
                                defaultChecked={data.champLibre.stimuli.sonsHulliles}
                            />
                            <Checkbox
                                onChange={e => {this.props.updateChampLibre("masking>champLibre>stimuli>sonsPulses", e)}}
                                label="Sons Pulsés"
                                defaultChecked={data.champLibre.stimuli.sonsPulses}
                            />
                            <Checkbox
                                onChange={e => {this.props.updateChampLibre("masking>champLibre>stimuli>brf", e)}}
                                label="Bruit de bande étroite"
                                defaultChecked={data.champLibre.stimuli.brf}
                            />
                        </Col>
                        <Col>
                            <Subtitle text="Conditionnement" />
                            <Checkbox
                                onChange={e => {this.props.updateChampLibre("masking>champLibre>conditionnement>visuel", e)}}
                                label="Visuel"
                                defaultChecked={data.champLibre.conditionnement.visuel}
                            />
                            <Checkbox
                                onChange={e => {this.props.updateChampLibre("masking>champLibre>conditionnement>jeu", e)}}
                                label="Jeu"
                                defaultChecked={data.champLibre.conditionnement.jeu}
                            />
                            <Checkbox
                                onChange={e => {this.props.updateChampLibre("masking>champLibre>conditionnement>reponsesMotrices", e)}}
                                label="Autre"
                                defaultChecked={data.champLibre.conditionnement.reponsesMotrices}
                            />
                        </Col>
                        <Col>
                            <Subtitle text="Collaboration" />
                            <Select onChange={e => {this.props.updateChampLibre("masking>champLibre>collaboration", e)}}
                                    label=""
                                    initValue={data.champLibre.collaboration}
                                    options={["Bonne","Autre"]} />
                            <Row hide={this.props.collaboration !== "Autre"}>
                                <InputText
                                    textarea
                                    label="Explications :"
                                    onChange={e => {this.props.updateChampLibre("masking>champLibre>collaborationAutre", e)}}
                                    defaultValue={data.champLibre.collaborationAutre}
                                />
                            </Row>
                        </Col>
                    </Row>
                </Wrapper>
                <Wrapper show={(this.props.type !== "Champ Libre")} mobileMarginTop>
                    <Side>
                        <InnerWrapper>
                            <Left>
                                <div>C.A.</div>
                                <div>C.O.</div>
                            </Left>
                            <Grid>
                                {grids[0]}
                            </Grid>
                        </InnerWrapper>
                        <Bottom>
                            {bottom}
                        </Bottom>
                    </Side>
                    <Spacer />
                    <Side>
                        <InnerWrapper>
                            <Left>
                                <div>C.A.</div>
                                <div>C.O.</div>
                            </Left>
                            <Grid>
                                {grids[1]}
                            </Grid>
                        </InnerWrapper>
                        <Bottom>
                            {bottom}
                        </Bottom>
                    </Side>
                </Wrapper>
            </div>
        );
    }

}

export default connect(mapStateToProps, mapDispatchToProps)(Masking);
