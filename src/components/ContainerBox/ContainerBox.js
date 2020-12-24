import React, { Component } from "react";
import styled from 'styled-components';

const Wrapper = styled.div`
    border: 1px solid rgba(0,0,0,0);
    border-radius: 8px;
    background-color: rgba(0,0,0,0.04);
    box-shadow: inset 0 1px 1px 1px rgba(0,0,0,0.05);
    padding: 12px;
    min-height: 80px
    margin: 6px 12px;
`;

class ContainerBox extends Component {
  render() {
    return(
        <Wrapper>
          {this.props.children}
        </Wrapper>
    );
  }
}

export default ContainerBox;
