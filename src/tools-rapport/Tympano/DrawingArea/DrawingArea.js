import React, { Component } from "react";
import Immutable from "immutable";
import { connect } from 'react-redux'
import { updateRapport } from '../../../actions'
import styled from 'styled-components';

const DrawArea = styled.div`
height:100%;
width:100%;
position:absolute;
z-index: ${props => (props.isActive) ? 10 : 1};
`;

const Path = styled.path`
fill: none;
stroke-width: 2px;
stroke: ${props => (props.side === "droite") ? "#f15c5d" : "#5d6bb2"};
stroke-linejoin: round;
stroke-linecap: round;
`;

const Svg = styled.svg`
width: 100%;
height: 100%;
position:absolute;
top:0;
left:0;
`;

const mapStateToProps = (state, ownProps) => {
    if(state.rapport.fields[2] !== undefined){
        return {
            isActive : state.rapport.fields[2].data[ownProps.side].graph.active,
            clear: state.rapport.fields[2].data[ownProps.side].graph.clear
        }
    }
    return {
        isActive: false,
        clear: false
    }
};

function mapDispatchToProps(dispatch) {
    return({
        saveGraph: (side, lines) => {
            dispatch(updateRapport("object", "tympanometrie>"+side+">graph>data", lines))
        }
    })
}

class DrawingArea extends Component {
    constructor(props) {
        super(props);

        this.state = {
            lines: new Immutable.List(),
            importedLines : [],
            isDrawing: false
        };

        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
    }

    componentDidMount() {
        document.addEventListener("mouseup", this.handleMouseUp);
    }

    componentWillUnmount() {
        document.removeEventListener("mouseup", this.handleMouseUp);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // eslint-disable-next-line no-mixed-operators
        if(this.props.clear && this.state.lines.size !== 0 || this.props.clear && this.state.importedLines.length !== 0){
            this.setState({ lines : new Immutable.List(), importedLines: [] });
        }

        if(prevProps.importLine === null && this.props.importLine !== null){
            this.setState({importedLines : this.props.importLine})
        }
    }

    handleMouseDown(mouseEvent) {
        if (mouseEvent.button !== 0) {
            return;
        }

        const point = this.relativeCoordinatesForEvent(mouseEvent);

        this.setState(prevState => ({
            lines: prevState.lines.push(new Immutable.List([point])),
            isDrawing: true
        }));
    }

    handleMouseMove(mouseEvent) {
        if (!this.state.isDrawing) {
            return;
        }

        const point = this.relativeCoordinatesForEvent(mouseEvent);

        this.setState(prevState =>  ({
            lines: prevState.lines.updateIn([prevState.lines.size - 1], line => line.push(point))
        }));
    }

    handleMouseUp() {
        this.setState({ isDrawing: false });
        let lines = [];
        this.state.lines.map((line) => {
            lines.push("M " +
                line
                .map(p => {
                    return `${p.get('x')} ${p.get('y')}`;
                })
                .join(" L ")
            );
            return true;
        });
        this.props.saveGraph(this.props.side, lines.concat(this.state.importedLines))
    }

    relativeCoordinatesForEvent(mouseEvent) {
        const boundingRect = this.refs.drawArea.getBoundingClientRect();
        return new Immutable.Map({
            x: mouseEvent.clientX - boundingRect.left,
            y: mouseEvent.clientY - boundingRect.top,
        });
    }



    render() {
        return (
            <DrawArea
            ref="drawArea"
            onMouseDown={this.handleMouseDown}
            onMouseMove={this.handleMouseMove}
            isActive={this.props.isActive}
            >
                {
                    this.state.importedLines.map(line => {
                        return(
                            <Svg>
                                <Path side={this.props.side} d={line} />
                            </Svg>
                        )
                    })
                }
            <Drawing side={this.props.side} clear={this.props.clear}  lines={this.state.lines} />
            </DrawArea>
        );
    }
}

function Drawing({ lines, side, clear }) {
    return (
        <Svg>
        {lines.map((line, index) => (
            <DrawingLine key={index} side={side} line={line} />
        ))}
        </Svg>
    );
}

function DrawingLine({ line, side }) {
    const pathData = "M " +
    line
    .map(p => {
        return `${p.get('x')} ${p.get('y')}`;
    })
    .join(" L ");


    return <Path side={side} d={pathData} />;
}

export default connect( mapStateToProps, mapDispatchToProps )(DrawingArea);
