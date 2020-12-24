import React, { Component } from "react";
import styled from 'styled-components';
import PropTypes from 'prop-types'

const Container = styled.div`
width: 80px;
height: 32px;
border-radius: 18px;
background-color: ${props => (props.on) ? props.color1 : props.color2}
transition: 0.3s background-color
margin: 0 12px;
&:hover{
    cursor: pointer
}

`

const Button = styled.div`
height: calc(100% - 2px);
width: 50px;
background-color: #EDEDED
border: 1px solid #979797
border-radius: 18px;
left:${props => (props.on) ? "calc(100% - 50px)" : "0"};
position: relative;
transition: 0.3s left;

`;


class Switch extends Component {
    constructor(props){
        super(props);
        this.state = {
            on: false
        };
    }
    handleClick(){
        this.setState({
            on: !this.state.on
        });
        this.props.onChange(!this.state.on);
    }
  render() {
    return(
        <Container color1={this.props.color1} color2={this.props.color2} on={this.state.on}
                   onClick={e => {this.handleClick()}}>
            <Button on={this.state.on} />
        </Container>
    );
  }
}

Switch.propTypes = {
    color1: PropTypes.string.isRequired,
    color2: PropTypes.string.isRequired
};

export default Switch;
