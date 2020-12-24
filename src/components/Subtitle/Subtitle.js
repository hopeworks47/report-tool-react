import React, { Component } from "react";
import styled from 'styled-components';

const Text = styled.div`
font-size:21px;
margin: 12px 12px 6px;
color: #7D7D7D
@media screen and (max-width: 1024px) {
    font-size: 18px;
    margin-top : 20px;
}
`;

class Subtitle extends Component {

  render() {
    return (
        <Text>
            {this.props.text}
        </Text>
    );
  }
}

export default Subtitle;
