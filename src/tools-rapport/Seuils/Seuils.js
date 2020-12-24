import React, { Component } from "react";
import styled from 'styled-components';
import { connect } from 'react-redux'
import { addRapport, updateRapport } from '../../actions'


const Wrapper = styled.div`
width: 100%;
display:flex;
justify-content: space-around;
color: #7D7D7D;
margin: 12px 0;
`;

const Side = styled.div`
width: 100%;
display:flex;
flex-direction: column;
margin: 0 12px;
max-width: 400px;
`;

const InnerWrapper = styled.div`
display:flex;
`;

const Left = styled.div`
width: 120px;
display:flex;
flex-direction: column;
& > div{
    justify-content: flex-end;
    height: 100%;
    display:flex;
    align-items:center;
    padding-right:6px;
    box-sizing: border-box;
}
`;

const Grid = styled.div`
background-color: white;
border: 1px solid #7D7D7D
border-radius: 8px;
`;

const Row = styled.div`
display:flex;
border-bottom: 1px solid #7D7D7D;
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
`;

const Top = styled.div`
display: flex;
width: calc(100% - 120px);
margin-left: 120px;
justify-content: space-around;
& > div{
    width: 100%
    text-align: center
}
`;

let data = {
    gauche: {
        ipsilaterale : {},
        controlaterale : {},
        metz : {}
    },
    droite: {
        ipsilaterale : {},
        controlaterale : {},
        metz : {}
    }
};
let hertz = [500, 1000, 2000, 4000];

const mapDispatchToProps = (dispatch) => {
    return({
        update : (side, data) => {dispatch(updateRapport("object", "seuils>"+side , data))},
        init : () => {dispatch(addRapport("seuils", data))}
    })
};

const mapStateToProps = state => {
    return{
        importData : (state.importer.rapport !== null )?state.importer.rapport[3].data:null
    }
};



class Seuils extends Component {
    constructor(props){
        super(props);
        this.props.init();
    }

    handleChange = (side, row, hertz, value) => {
        data[side][row][hertz] = value;
        this.props.update(side, data[side])
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.importData === null && this.props.importData !== null){
            data = this.props.importData;
            this.props.update("droite", data.droite);
            this.props.update("gauche", data.gauche);
            this.forceUpdate();
        }
    }

    render(){
        let grids = [];
        for(let h = 0; h<2; h++){
            let grid = [];
            for(let i = 0; i<3; i++){
                let row = [];
                for(let j in hertz){
                    let input, side, thisRow;
                    let thisFreq = hertz[j];
                    if(h === 0){
                        side = "droite";
                    }else{
                        side = "gauche";
                    }
                    switch (i){
                        case 0 :{
                            thisRow = "ipsilaterale";
                            break;
                        }
                        case 1 :{
                            thisRow = "controlaterale";
                            break;
                        }
                        case 2 :{
                            thisRow = "metz";
                            break;
                        }
                        default: {

                        }
                    }
                    row.push(<Case key={i + "-" + j}><input
                        ref={node => input = node}
                        defaultValue={data[side][thisRow][thisFreq]}
                        onChange={e => this.handleChange(side, thisRow, thisFreq, input.value)}
                        type="text" /></Case>)
                }
                grid.push(<Row key={i}>{row}</Row>);
            }
            grids.push(grid);
        }


        let bottom = [];
        for(let i in hertz){
            bottom.push(<div key={i}>{`${hertz[i]}`}</div>)
        }
        return(
            <Wrapper>
                <Side>
                    <Top>
                        {bottom}
                    </Top>
                    <InnerWrapper>
                        <Left>
                            <div>Ipsilatérale</div>
                            <div>Controlatérale</div>
                            <div>Metz</div>
                        </Left>
                        <Grid>
                            {grids[0]}
                        </Grid>
                    </InnerWrapper>
                </Side>
                <Side>
                    <Top>
                        {bottom}
                    </Top>
                    <InnerWrapper>
                        <Left>
                            <div>Ipsilatérale</div>
                            <div>Controlatérale</div>
                            <div>Metz</div>
                        </Left>
                        <Grid>
                            {grids[1]}
                        </Grid>
                    </InnerWrapper>
                </Side>
            </Wrapper>
        );
    }

}

export default connect( mapStateToProps, mapDispatchToProps )(Seuils);
