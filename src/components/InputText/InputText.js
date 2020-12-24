import React, { Component } from "react";
import styled from 'styled-components';

const InputGroup = styled.div`
    padding: 6px 12px;
    color: #7D7D7D;
    width: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
`;
const Input = styled.input`
    border: 1px solid rgba(0,0,0,0);
    border-radius: 8px;
    font-size: 14px;
    background-color: rgba(0,0,0,0.04);
    box-shadow: inset 0 1px 1px 1px rgba(0,0,0,0.05);
    color: #7D7D7D;
    padding: 12px;
    outline: none;
    &:focus{
        border: 1px solid #009999
    }
    &::placeholder{
        color: #7D7D7D;
        opacity: 1
    }
`;


const Label = styled.div`
    font-size: 16px;
    margin-bottom:3px
    @media screen and (max-width: 1024px) {
        font-size:13px;
    }
`;



class InputText extends Component {
    constructor(props){
        super(props);
        this.input = React.createRef();
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.defaultValue !== this.props.defaultValue)
            this.input.current.value = this.props.defaultValue
    }

    render() {
        return(
            <InputGroup>
                <Label>{this.props.label}</Label>
                <Input
                    ref={this.input}
                    type="text"
                    defaultValue={this.props.defaultValue}
                    onChange={e => this.props.onChange(e.target.value)}
                    placeholder={this.props.initValue} />
            </InputGroup>
        );
    }

}


export { InputGroup, Label };
export default InputText;
