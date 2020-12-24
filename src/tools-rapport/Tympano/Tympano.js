import React, {Component} from "react";
import styled from 'styled-components';
import { connect } from 'react-redux'
import { addRapport, updateRapport } from '../../actions'
import Drawing from './Drawing';
import { InputText, Select } from '../../components'

const Wrapper = styled.div`
width: 100%;
display:flex;
flex-direction:column;
align-items: center;
color: #7d7d7d
& > div{
    display:flex;
    justify-content: center;
    width:100%;
}
`;

const Side = styled.div`
display:flex;
flex-direction: column;
& > div{
    display: flex;
    align-items: flex-end;
    @media screen and (max-width: 1024px) {
        width: 80%;
    }
}
@media screen and (max-width: 1024px) {
    // align-items: ${props => props.mobileLayoutRight ? "flex-start" : "flex-end"};
    min-width: 15%;
}
`;
const Unit = styled.div`
padding: 6px 0;
min-width: 42px;

`;



let data = {
    freq:"226hz",
    droite: {
        pression:"",
        compliance: "",
        volume: "",
        gradient: "",
        type: "A",
        graph: {
            clear : false,
            active : true,
            data : []
        }
    },
    gauche:{
        pression:"",
        compliance: "",
        volume: "",
        gradient: "",
        type: "A",
        graph: {
            clear : false,
            active : false,
            data : []
        }
    }
};

const mapDispatchToProps = (dispatch) => {
    return({
        update : (element, data) => {dispatch(updateRapport("object", "tympanometrie>"+element , data))},
        init : () => {dispatch(addRapport("tympanometrie", data))}
    })
};

const mapStateToProps = state => {
    if(state.rapport.fields[2] !== undefined){
        return{
            importData : (state.importer.rapport !== null )?state.importer.rapport[2].data:null,
            freq : state.rapport.fields[2].data.freq,
            typeDroit : state.rapport.fields[2].data.droite.type,
            typeGauche : state.rapport.fields[2].data.gauche.type
        };
    }else{
        return{
            importData : null,
            freq : "226hz",
            typeDroit : "A",
            typeGauche : "A",
        }
    }
};

class Tympano extends Component {
    constructor(props) {
        super(props);
        this.props.init()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.importData === null && this.props.importData !== null){
            data = this.props.importData;
            data.droite.graph.active = true;
            data.gauche.graph.active = false;
            this.props.update("gauche", data.gauche);
            this.props.update("droite", data.droite);
            this.props.update("freq", data.freq);
            this.forceUpdate();
        }
    }

    render(){
        return(
            <Wrapper>
                <div style={{maxWidth : 300, marginBottom: 12}}>
                    <Select
                        label="Type"
                        onChange={e => this.props.update("freq", e)}
                        initValue={this.props.freq}
                        options={["226hz", "1000hz"]} />
                </div>
                <div>
                    <Side>
                        <div>
                            <InputText
                                onChange={e => this.props.update("droite>pression", e)}
                                defaultValue={data.droite.pression}
                                label="Pression" />
                            <Unit>daPa</Unit>
                        </div>
                        <div>
                            <InputText
                                onChange={e => this.props.update( "droite>compliance", e)}
                                defaultValue={data.droite.compliance}
                                label="Compliance" />
                            <Unit>mL</Unit>
                        </div>
                        <div>
                            <InputText
                                onChange={e => this.props.update( "droite>volume", e)}
                                defaultValue={data.droite.volume}
                                label="Volume" />
                            <Unit>mL</Unit>
                        </div>
                        <div>
                            <InputText
                                onChange={e => this.props.update( "droite>gradient", e)}
                                defaultValue={data.droite.gradient}
                                label="Gradient" />
                            <Unit>daPa</Unit>
                        </div>
                        <div>
                            <Select
                                label="Type"
                                onChange={e => this.props.update( "droite>type" , e)}
                                initValue={this.props.typeDroit}
                                options={["A", "A[d]", "A[s]", "B", "C", "Plat", "NT"]} />
                        </div>
                    </Side>
                    <Drawing
                        mobileMargin
                        importRight={(this.props.importData !== null)?this.props.importData.droite.graph.data:null}
                        importLeft={(this.props.importData !== null)?this.props.importData.gauche.graph.data:null}
                    />
                    <Side mobileLayoutRight>
                        <div>
                            <InputText
                                onChange={e => this.props.update( "gauche>pression" , e)}
                                defaultValue={data.gauche.pression}
                                label="Pression" />
                            <Unit>daPa</Unit>
                        </div>
                        <div>
                            <InputText
                                onChange={e => this.props.update( "gauche>compliance" , e)}
                                defaultValue={data.gauche.compliance}
                                label="Compliance" />
                            <Unit>mL</Unit>
                        </div>
                        <div>
                            <InputText
                                onChange={e => this.props.update( "gauche>volume" , e)}
                                defaultValue={data.gauche.volume}
                                label="Volume" />
                            <Unit>mL</Unit>
                        </div>
                        <div>
                            <InputText
                                onChange={e => this.props.update( "gauche>gradient" , e)}
                                defaultValue={data.gauche.gradient}
                                label="Gradient" />
                            <Unit>daPa</Unit>
                        </div>
                        <div>
                            <Select
                                label="Type"
                                onChange={e => this.props.update( "gauche>type"  , e)}
                                initValue={this.props.typeGauche}
                                options={["A", "A[d]", "A[s]", "B", "C", "Plat", "NT"]} />
                        </div>
                    </Side>
                </div>
            </Wrapper>
        );
    }

}

export default connect( mapStateToProps, mapDispatchToProps )(Tympano);
