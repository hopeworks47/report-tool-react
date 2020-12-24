import React from "react";
import styled from 'styled-components';


const Button = styled.div`
width: 80px;
height: 40px;
background-color: ${props => (props.active)? "#D8D8D8" : "white"};
box-shadow: ${props => (props.active)? "inset 0 0 3px 0 rgba(0,0,0,0.5)" : "0px 6px 6px -4px rgba(60, 60, 60,0.2)"};
border-radius: 8px;
display: flex;
padding: 6px;
box-sizing: border-box;
margin-bottom: 12px;
& > img{
    height: 100%;
    width: 50%;
    object-fit: contain;
}
&:hover{
    cursor: pointer;
}
`;

const Option = ({ active,  icon1, icon2, onClick}) => {
    return (
        <Button active={active} onClick={() => onClick()}>
            <img src={icon1} />
            <img src={icon2} />
        </Button>
    );
};

export default Option;
