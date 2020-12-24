import React, { Component } from "react";
import styled from 'styled-components';

import {colors} from "../values";

const Wrapper = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${colors.overlay};
    padding: 20px;
    margin: -5px -12px;
    height:100%;
    width:100%;
`;

const Row = styled.div`
    display: flex;
    width: 100%;
    justify-content: ${props => props.right?"flex-end":"flex-start"};
    margin: 6px 0;
`;

const Inner = styled.div`
    height: 100%;
    width: 100%;
    max-height: ${props => props.maxHeight}px;
    max-width: ${props => props.maxWidth}px;
    background-color: white;
    border-radius: 24px;
    padding: 24px;
    box-sizing:border-box;
    display:flex;
    flex-direction:column;
`;

const ResultBox = styled.div`
    width: 100%;
    height:100%;
    background-color:rgba(0,0,0,0.04);
    border-radius: 8px;
    overflow: auto;
`;

class OverlayBox extends Component {
  render() {
    return(
        <Wrapper>
          <Inner maxHeight={this.props.maxHeight} maxWidth={this.props.maxWidth}>
            <ResultBox>
              {
                this.props.children
              }
            </ResultBox>
              <Row right>
                  {
                      this.props.buttons
                  }
              </Row>
          </Inner>
        </Wrapper>
    );
  }
}

export default OverlayBox;
