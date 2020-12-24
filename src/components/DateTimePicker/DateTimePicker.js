import React, { Component } from "react";
import styled from 'styled-components';
import Datetime from 'react-datetime';
import './dateTimePicker.css'

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    margin-top: 6px;
    flex-direction: column;
    width: 100%;
    box-sizing:border-box;
    padding:0 15px 15px;
    align-items:flex-start
    @media screen and (max-width: 1024px) {
        width: ${props => props.mobileToolDate ? "50%" : "100%"}
    }
`;
const Label = styled.div`
    min-width: 50px;
    @media screen and (max-width: 1024px) {
        font-size: ${props => props.mobileToolDate? "20px" : "16px"}
    }
`;



class DateTimePicker extends Component {
    constructor(props){
        super(props);
        this.picker = React.createRef();
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.defaultValue !== this.props.defaultValue) {
            this.picker.current.state.inputValue = this.props.defaultValue;
            this.forceUpdate()
        }
    }

    render() {
    return (
        <Wrapper mobileToolDate={this.props.mobileToolDate}>
            <Label mobileToolDate={this.props.mobileToolDate}>{this.props.label + " :"}</Label>
            <Datetime
                ref={this.picker}
                onChange={e => this.props.onChange(e._d)}
                defaultValue={this.props.defaultValue}
                dateFormat="DD/MM/YYYY"
                timeFormat={(this.props.dateonly)?false:"HH:mm"}
            />
        </Wrapper>
    );
  }
}

export default DateTimePicker;
