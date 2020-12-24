import React, { Component } from "react";
import styled from 'styled-components';
import {InputGroup, Label} from "../InputText";

const Input = styled.textarea`
    border: 1px solid rgba(0,0,0,0);
    border-radius: 8px;
    font-size: 14px;
    background-color: rgba(0,0,0,0.04);
    box-shadow: inset 0 1px 1px 1px rgba(0,0,0,0.05);
    color: #7D7D7D;
    padding: 12px;
    outline: none;
    resize:none;
    &:focus{
        border: 1px solid #009999
    }
    &::placeholder{
        color: #7D7D7D;
        opacity: 1
    }
`;

class Textarea extends Component {
  render() {
    return(
        <InputGroup>
          <Label>{this.props.label}</Label>
          <Input type="text"  onChange={() => {return}} placeholder={this.props.initValue}>
            {this.props.children}
          </Input>
        </InputGroup>
    );
  }
}

export default Textarea;
