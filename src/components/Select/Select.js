import React, { Component } from "react";
import styled from 'styled-components';
import { InputGroup, Label } from "../InputText";
import selectImg from './select.svg';

const Selector = styled.select`
    border: 1px solid rgba(0,0,0,0);
    border-radius: 8px;
    font-size: 14px;
    background: url(${selectImg}) no-repeat rgba(0,0,0,0.04);
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
    &:focus{
        border: 1px solid #009999
    }
`;


class Select extends Component{
    constructor(props){
        super(props);
        this.select = React.createRef();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.initValue !== this.props.initValue)
            this.select.current.value = this.props.initValue;
    }

    render(){
        return (
            <InputGroup>
                <Label className={"input-label"}>{this.props.label}</Label>
                <Selector ref={this.select} onChange={e => this.props.onChange(e.target.value)} defaultValue={this.props.initValue}>
                    {this.props.options.map((x, i) => {
                        return <option key={i} value={x}>{x}</option>
                    })}
                </Selector>
            </InputGroup>
        )
    }
}

export default Select;
