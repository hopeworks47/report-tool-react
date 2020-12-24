import React, { Component } from "react";
import styled, {keyframes} from 'styled-components';

import { fontSizes } from "../values";

const Btn = styled.div`
    padding: ${props => props.small?"6px":"10px"};
    position:relative;
    background-color: ${props => {
        if(props.isSecondary){
            return "rgba(0,0,0,0)"
        }else{
            if(props.loading){
                return "#cccccc"
            }
            return "#009999"
        }
    }};
    border-radius: 8px;
    border: ${props => {if(props.isSecondary){
            return "3px solid #009999"
        }else{
            if(props.loading){
                return "3px solid #cccccc"
            }
            return "3px solid #009999"
        }
    }};
    color: ${props => props.isSecondary ? "#009999" : "white"};
    display: inline-block;
    margin: 0 12px;
    font-size: ${props => props.small?fontSizes.xsmall:fontSizes.small};
    min-width: ${props => props.icon ? "16px" :props.small ? "80px" : "160px"};
    text-align: center;
    font-weight: 600;
    &:hover{
        cursor: ${(props) => {
            if(props.loading){
                return "default"
            }else{
                return "pointer"
            }
        }};
        background-color: ${(props) => {
            if(props.loading){
                return "#cccccc"
            }else{
                return "#007171"
            }
        }};
        color: white;
        border-color: ${(props) => {
            if(props.loading){
                return "#cccccc"
            }else{
                return "#007171"
            }
        }}
    }
    @media screen and (max-width: 1024px) {
        min-width: ${props => props.icon ? "16px" :props.small ? "40px" : "80px"};
        font-size: 13px;
    }
`;

const loads = keyframes`
    0% {
        left:40%
    }
  50% {
    left: 60%;
  }
  100% {
      left: 40%
  }
`;

const Loading = styled.div`
    height: 6px;
    width: 6px;
    border-radius: 50%;
    background-color: #666666;
    position: absolute;
    left: 40%;
    top: 50%;
    transform: translate(-50%,-50%);
    animation: ${loads} 2s ease infinite;
`

class Button extends Component {
    noClick() {
        return;
    }

  render() {
      let loading = () => {return(<Loading><div></div></Loading>)};

      return(
          <Btn
              icon={this.props.icon}
              small={this.props.small}
              loading={this.props.loading}
              isSecondary={(this.props.secondary)}
              onClick={(this.props.loading)? this.noClick : this.props.handleClick}>
              {(this.props.loading)? loading : this.props.text}
          </Btn>
      )
  }
}

export default Button;
