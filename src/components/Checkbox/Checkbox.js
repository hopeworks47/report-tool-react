import React, { Component } from "react";
import styled from 'styled-components';
import { Label } from "../InputText";
import checkmark from './checkmark.svg';

const InputGroup = styled.div`
display: flex;
align-items: center;
color: #7D7D7D;
padding: 6px 12px;
`;

const Input = styled.input`
border: 0;
border-radius: 6px;
background-color: rgba(0,0,0,0.04);
box-shadow: inset 0 1px 1px 1px rgba(0,0,0,0.05);
color: #7D7D7D;
padding: 12px;
outline: none;
appearance: none;
height:20px;
width:20px
&:checked{
    background-image: url(${checkmark});
    background-size: 60%;
    background-position: center;
    background-repeat: no-repeat;
}
&:hover{
    cursor: pointer
}
`;



class Checkbox extends Component{
    constructor(props){
        super(props);
        this.state = { value: false };
        this.checkBox = React.createRef();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.defaultChecked !== this.props.defaultChecked){
            this.setState({
                value: this.props.defaultChecked
            });
            this.checkBox.current.checked = this.props.defaultChecked;
        }
    }

    render(){
        return(
            <InputGroup className={"input-checkbox"}>
                <Input type="Checkbox"
                       ref={this.checkBox}
                   onClick={() => {
                        this.props.onChange(!this.state.value);
                        this.setState({value:!this.state.value})
                    }}
                       defaultChecked={this.props.preChecked}
                />
                <Label>{this.props.label}</Label>
            </InputGroup>
        );
    }

}

export default Checkbox;
