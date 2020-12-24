import React, { Component } from "react";
import styled from 'styled-components';
import { InputGroup, Label } from "../InputText";
import calendar from './calendar.svg';

const Picker = styled.input`
    border: 0;
    border-radius: 8px;
    font-size: 14px;
    background: url(${calendar}) no-repeat rgba(0,0,0,0.04);
    background-position: center right;
    background-size: contain;
    box-shadow: inset 0 1px 1px 1px rgba(0,0,0,0.05);
    color: #7D7D7D;
    padding: 12px;
    outline: none;
    appearance: none;
    &:hover{
        cursor: pointer
    }
`;


class Datepicker extends Component {
    constructor(props){
        super(props);
        this.datepicker = React.createRef();
    }

    componentDidMount() {
        if(this.props.defaultValue)
            this.datepicker.current.value = this.props.defaultValue;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.defaultValue !== this.props.defaultValue)
            this.datepicker.current.value = this.props.defaultValue;
    }

    render(){
        return (
            <InputGroup>
                <Label>{this.props.label}</Label>
                <Picker ref={this.datepicker} type="date" onChange={(e) => {this.props.onChange(e.target.value)}}/>
            </InputGroup>
        );
    }

}

export default Datepicker;
