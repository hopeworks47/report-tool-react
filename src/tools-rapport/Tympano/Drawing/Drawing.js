import React from "react";
import styled from 'styled-components';
import { connect } from 'react-redux'
import { updateRapport } from '../../../actions'
import { Button, Switch } from '../../../components';
import DrawingArea from '../DrawingArea';

const Wrapper = styled.div`
display:flex;
flex-direction: column;
align-items:center;
@media screen and (max-width: 1024px) {
    margin: ${props => props.mobileMargin ? "0 30px" : "unset"}
}
`


const InnerWrap = styled.div`
display:flex;
align-items: flex-end
@media screen and (max-width: 1024px) {
    display: block ;
}
`

const Grid = styled.div`
width: 450px;
@media screen and (max-width: 1024px) {
    width: 350px ;
}
`

const Head = styled.div`
display:flex;
justify-content: space-between;
width: calc(100% - 35px);
margin-left: 35px;
margin-bottom: 6px;
`

const InnerGrid = styled.div`
display:flex
`

const Left = styled.div`
margin-right:6px;
min-width: 35px;
display: flex;
flex-direction: column;
justify-content: space-between
& > div{
    text-align: right
}
`

const Grille = styled.div`
width: 100%;
background-color: white;
border-radius: 8px;
border: 1px solid #7d7d7d
height: 400px;
display:flex;
flex-direction: column
position:relative;
`

const Row = styled.div`
height: 100%
border-bottom: 1px solid #7d7d7d
display:flex
&:last-child{
    border-bottom: 0
}
`
const Case = styled.div`
width: 100%
border-right: 1px solid #7d7d7d
&:last-child{
    border-right: 0
}
`

var activeGraph = {
    droite : true,
    gauche: false
}

const switchGraph = (dispatch) => {
    activeGraph = {
        droite: !activeGraph.droite,
        gauche: !activeGraph.gauche
    }
    dispatch(updateRapport("string", "tympanometrie>gauche>graph>active", activeGraph.gauche));
    dispatch(updateRapport("string", "tympanometrie>droite>graph>active", activeGraph.droite));
}

const clearGraph = (dispatch) => {
    if(activeGraph.gauche){
        dispatch(updateRapport("string", "tympanometrie>gauche>graph>clear", true));
        dispatch(updateRapport("string", "tympanometrie>gauche>graph>data", []));
        setTimeout(() => {
            dispatch(updateRapport("string", "tympanometrie>gauche>graph>clear", false))
        }, 100);
    }else{
        dispatch(updateRapport("string", "tympanometrie>droite>graph>clear", true));
        dispatch(updateRapport("string", "tympanometrie>droite>graph>data", []));
        setTimeout(() => {
            dispatch(updateRapport("string", "tympanometrie>droite>graph>clear", false))
        }, 100);
    }
}

const Drawing = ({importRight, importLeft, dispatch,mobileMargin }) => {
    let grid=[];
    for(var i = 0; i<12; i++){
        let row=[];
        for(var j = 0; j<6; j++){
            row.push(<Case key={i + "-" + j} />)
        }
        grid.push(<Row key={i}>{row}</Row>)
    }


    return(
        <Wrapper mobileMargin={mobileMargin}>
            Droite | Gauche
            <Switch color1="#5d6bb2" color2="#f15c5d" onChange={e => {
                switchGraph(dispatch);
                return true;
            }} />
            <InnerWrap>
                <Grid>
                    <Head>
                        <div>-400</div>
                        <div>-200</div>
                        <div>0</div>
                        <div>+200</div>
                    </Head>
                    <InnerGrid>
                        <Left>
                            <div>2.0</div>
                            <div>1.0</div>
                            <div>0</div>
                        </Left>
                        <Grille>
                            <DrawingArea importLine={(importLeft !== undefined)?importLeft:null}  side="gauche" />
                            <DrawingArea importLine={(importRight !== undefined)?importRight:null} side="droite" />
                            {grid}
                        </Grille>
                    </InnerGrid>
                </Grid>
                <div className={"mobile-Annuler-btn"}>
                    <Button
                        small secondary
                        text="Annuler"
                        handleClick={e => clearGraph(dispatch)} />
                </div>
            </InnerWrap>
        </Wrapper>
    );
}

export default connect()(Drawing);
