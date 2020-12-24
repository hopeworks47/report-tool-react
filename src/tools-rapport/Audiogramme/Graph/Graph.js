import React, { Component } from "react";
import styled from 'styled-components';


//////////////// styling ///////////////////

const width = 500;
const height = 420;

const Wrapper = styled.div`
    width: ${width}px;
    height: ${height}px;
    @media screen and (max-width: 1024px) {
        width: 350px;
    }
`;

const Top = styled.div`
    display: flex;
`;

const Units = styled.div`
    display: flex;
    width: ${props => props.width?props.width:""};
    min-width: ${props => props.width?props.width:""};
    margin: ${props => props.margin?props.margin:""};
    height:100%;
    flex-direction: ${props => props.vertical?"column":""}
`;

const Unit = styled.div`
    width: 100%;
    height: ${props => props.height?props.height:"100%"};
    display: flex;
    align-items: center;
    justify-content:  ${props => props.justifyContent?props.justifyContent:""};
`;

const Bottom = styled.div`
    display:flex
    height:100%;
`;

const GridContainer = styled.div`
    width: 100%;
    height: 100%;
    position: relative;
    & > div{
        position: absolute;
        top:0;
        left:0;
        height:100%;
        width: 100%;
        display: flex;
        flex-direction: column;
    }
`;

const Grid = styled.div`
    background-color: white;
    border-radius: 8px;
    border: 1px solid #7D7D7D;
`;

const GridRow = styled.div`
    display: flex;
    height:100%;
    border-bottom: ${props => props.border?props.last?"0px solid #7D7D7D":"1px solid #7D7D7D":""};
`;

const GridCell = styled.div`
    border-right: ${props => props.last?"0px solid #7D7D7D":"1px solid #7D7D7D"};
    width:100%;
    height:100%;
`;

const DotContainer = styled.div`
    height: 50%;
    width: 50%;
    float: left;
    transform: translate(-50%, -50%);
    display: flex;
    align-items:center;
    justify-content: center;
    &:hover{
        cursor:pointer;
        & > div{
            display: block;
        }
    }
`;

const CurrentDot = styled.div`
    min-height:24px;
    min-width:24px;
    background-image:url(${props => props.symbol});
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
    position: absolute;
    display: none;
`;

const AddedDot = styled.div`
    min-height:24px;
    min-width:24px;
    background-image:url(${props => props.symbol});
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
`;

const LinesContainer = styled.div`
    height:420px;
    width:100%;
    position: absolute;
    & > svg{
        position: absolute;
    }
`;

//////////// methods ///////////

const createArray = (from, to, jump) => {
    let units = [];
    for(let i = from;
        i <= to;
        i = i + jump)
        units.push(i);
    return units;
};


////////////// component class /////////////////

class Graph extends Component {
    constructor(props){
        super(props);
        this.state =
            {
                axis : {
                    x : {
                        units : "Hertz",
                        values : [125, 250, 375, 500, 750, 1000, 1500, 2000, 3000, 4000, 6000, 8000, 16000, 18000]
                    },
                    y : {
                        units : "dBHL",
                        values : createArray(-10,120,5)
                    }
                },
                dots : {},
                tools : {},
                activeTool : this.props.currentTool,
                activeDependency : this.props.dependency,
                dependencies : {},
                lineType : {}
            };
        this.LineContainer = React.createRef();
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        // update tooling
        if(this.props.currentTool !== nextProps.currentTool) {
            this.setState({ activeTool : nextProps.currentTool });
            this.setState({ activeDependency : nextProps.dependency });
        }else if(this.props.type !== nextProps.type){
            this.setState({
                axis : {
                    ...this.state.axis,
                    x: {
                        ...this.state.axis.x,
                        values: (nextProps.type === "16 000hz") ?
                            [125, 250, 375, 500, 750, 1000, 1500, 2000, 3000, 4000, 6000, 8000, 9000, 10000, 11000, 12000, 14000, 16000, 17000, 18000] :
                            [125, 250, 375, 500, 750, 1000, 1500, 2000, 3000, 4000, 6000, 8000, 16000, 18000]
                    }
                }
            });
        }

        return true;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.import === null && this.props.import !== null){
            this.setState({
                ...this.state,
                dots : (this.props.import.dots !== undefined)?this.props.import.dots:{},
                tools : (this.props.import.tools !== undefined)?this.props.import.tools:{},
                activeTool : this.props.currentTool,
                activeDependency : this.props.dependency,
                dependencies : (this.props.import.dependencies !== undefined)?this.props.import.dependencies:{},
                lineType : (this.props.import.lineType !== undefined)?this.props.import.lineType:{}
            });
            return;
        }

        let msp = {
            500 : null,
            1000 : null,
            2000 : null,
            4000 : null
        };

        Object.keys(this.state.dots).forEach(level => {
            Object.keys(this.state.dots[level]).forEach(freq => {
                if(
                    Number(freq) === 500 ||
                    Number(freq) === 1000 ||
                    Number(freq) === 2000 ||
                    Number(freq) === 4000
                ){
                    Object.keys(this.state.dots[level][freq]).forEach(tool => {
                        if(Number(tool) === 0 || Number(tool) === 1){
                            msp[freq] = {
                                level: level,
                                nr: this.state.dots[level][freq][tool]
                            };
                        }
                    })
                }
            })
        });

        if(
            msp[500] !== null &&
            msp[1000] !== null &&
            msp[2000] !== null
        ){
            let avg = (Number(msp[500].level) + Number(msp[1000].level) + Number(msp[2000].level))/3;
            this.props.msp3((msp[500].nr && msp[1000].nr && msp[2000].nr) ? ""+avg.toFixed(2) : ">"+avg.toFixed(2) );
            if(msp[4000] !== null){
                let avg = (Number(msp[500].level) + Number(msp[1000].level) + Number(msp[2000].level) + Number(msp[4000].level))/4;
                this.props.msp4((msp[500].nr && msp[1000].nr && msp[2000].nr && msp[4000].nr) ? ""+avg.toFixed(2)  : ">"+avg.toFixed(2)  );
            }
        }


        this.props.onChange(this.state);
    }


    addDot = (row, col) => {
        if(
            row === undefined ||
            col === undefined
        )
            return;

        // store symbol for used tool
        let tools = this.state.tools;
        if(this.state.tools[this.state.activeTool] === undefined){
            tools = {
                ...this.state.tools,
                [this.state.activeTool] : {
                    noDraw : (this.props.noDraw),
                    symbol : {
                        img: null,
                        imgNr : null
                    }
                }
            };
        }

        if(tools[this.state.activeTool].symbol.img === null ||
            tools[this.state.activeTool].symbol.imgNr === null){
            if(tools[this.state.activeTool].symbol.img === null &&
                !this.props.nonReponse){
                tools[this.state.activeTool].symbol.img = this.props.symbol;
            }
            else if(tools[this.state.activeTool].symbol.imgNr === null &&
                this.props.nonReponse){
                tools[this.state.activeTool].symbol.imgNr = this.props.symbol;
            }
        }



        // store dependency
        let dependencies = this.state.dependencies;
        if(this.state.activeDependency !== undefined &&
            this.state.dependencies[this.state.activeTool] === undefined &&
            this.state.dependencies[this.state.activeDependency] === undefined)
            dependencies = {
                ...this.state.dependencies,
                [this.state.activeTool] : {
                    [this.state.activeDependency] : true
                }
            };


        // store line type
        let lineType = this.state.lineType;
        if(this.state.lineType[this.state.activeTool] === undefined &&
            this.props.lineWidth !== undefined){
            lineType = {
                ...this.state.lineType,
                [this.state.activeTool] : {
                    width : this.props.lineWidth,
                    dash : (this.props.lineDash)?this.props.lineDash:0
                }
            }
        }


        // check if existing symbol in same col
        for(let i in this.state.axis.y.values){
            let searchRow = this.state.axis.y.values[i];


            // deleting dot on same col
            if(
                this.state.dots[searchRow] !== undefined &&
                this.state.dots[searchRow][col] !== undefined
            ){

                // from current tool
                if(this.state.dots[searchRow][col][this.state.activeTool] !== undefined &&
                    searchRow !== row)
                    delete this.state.dots[searchRow][col][this.state.activeTool];

                // from dependency tool
                if(this.state.activeDependency !== undefined &&
                    this.state.dots[searchRow][col][this.state.activeDependency] !== undefined)
                    delete this.state.dots[searchRow][col][this.state.activeDependency];
            }

        }


        if(
            this.state.dots[row] !== undefined &&
            this.state.dots[row][col] !== undefined
        ){
            // deleting HERE, clicked on existing
            if(this.state.dots[row][col][this.state.activeTool]){
                delete this.state.dots[row][col][this.state.activeTool];
                this.setState(this.state);
            }
            // adding the dot
            else{
                this.setState({
                    dots : {
                        ...this.state.dots,
                        [row] : {
                            ...this.state.dots[row],
                            [col] : {
                                ...this.state.dots[row][col],
                                [this.state.activeTool] : !this.props.nonReponse // true -> normal symbol, false -> non reponse
                            }
                        }
                    },
                    tools : tools,
                    dependencies : dependencies,
                    lineType : lineType
                })
            }
        }
        else{
            this.setState({
                dots : {
                    ...this.state.dots,
                    [row] : {
                        ...this.state.dots[row],
                        [col] : {
                            [this.state.activeTool] : !this.props.nonReponse // true -> normal symbol, false -> non reponse
                        }
                    }
                },
                tools : tools,
                dependencies : dependencies,
                lineType : lineType
            })
        }
    };

    checkForDots = (row, col) => {
        if(
            this.state.dots[row] !== undefined &&
            this.state.dots[row][col] !== undefined
        ){
            return Object.keys(this.state.dots[row][col]).map( (tool, i ) => {
                if(this.state.tools[tool].noDraw)
                    return false;

                return <AddedDot key={i} symbol={(this.state.dots[row][col][tool])?this.state.tools[tool].symbol.img:this.state.tools[tool].symbol.imgNr}/>;
            })
        }
    };

    searchLines = () => {
        let linesToDraw = {};
        let lineTypes = this.state.lineType;

        //prepare line container dimensions
        let dimensions = {height:0, width:0};
        if(this.LineContainer.current !== null){
            dimensions = {
                height : this.LineContainer.current.offsetHeight,
                width : this.LineContainer.current.offsetWidth
            };
        }

        // add all dot to array that will draw lines
        Object.keys(this.state.dots).map(row => {
            Object.keys(this.state.dots[row]).map( col => {
                Object.keys(this.state.dots[row][col]).map( tool => {
                    if(linesToDraw[tool] === undefined) {
                        linesToDraw = {
                            ...linesToDraw,
                            [tool] : [{ row : row, col : col, nr: !this.state.dots[row][col][tool] }]
                        }
                    }else{
                        linesToDraw = {
                            ...linesToDraw,
                            [tool] : [
                                ...linesToDraw[tool],
                                { row : row, col : col, nr: !this.state.dots[row][col][tool] }
                            ]
                        }
                    }
                });
            });
        });


        // merge array of dependencies, make sure to keep lineType for this new set
        Object.keys(this.state.dependencies).forEach(dependency => {
            Object.keys(this.state.dependencies[dependency]).forEach(dependantTool => {
                if(linesToDraw[dependency] !== undefined &&
                    linesToDraw[dependantTool] !== undefined){
                    let newObjectIndex = new Date().getTime(); // uniq id

                    linesToDraw = {
                        ...linesToDraw,
                        [dependency] : [],
                        [dependantTool] : [],
                        [newObjectIndex] : linesToDraw[dependency].concat(linesToDraw[dependantTool])
                    };

                    // get line type for current merged array
                    if(this.state.lineType[dependency] !== undefined){
                        lineTypes = {
                            ...lineTypes,
                            [newObjectIndex] : {
                                width : this.state.lineType[dependency].width,
                                dash : 0
                            }
                        };
                        if(this.state.lineType[dependency].dash !== undefined){
                            lineTypes = {
                                ...lineTypes,
                                [newObjectIndex] : {
                                    width : this.state.lineType[dependency].width,
                                    dash : this.state.lineType[dependency].dash
                                }
                            };
                        }
                    }
                }
            })
        });


        // just making sure everything is sort in the right order
        Object.keys(linesToDraw).forEach(tool => {
            linesToDraw[tool] = linesToDraw[tool].sort((a, b)  => {
                return Number(a.col) - Number(b.col);
            });
        });


        // line rendering
        return Object.keys(linesToDraw).map(tool => {
            return linesToDraw[tool].map((dot, index) => {
                if(index !== linesToDraw[tool].length-1){
                    let firstDot = {
                        x: (this.state.axis.x.values.indexOf(Number(dot.col))+1) * dimensions.width/this.state.axis.x.values.length,
                        y: (this.state.axis.y.values.indexOf(Number(dot.row))+1) * dimensions.height/(this.state.axis.y.values.length+1)
                    };
                    let secondDot = {
                        x: (this.state.axis.x.values.indexOf(Number(linesToDraw[tool][index+1].col))+1) * dimensions.width/this.state.axis.x.values.length,
                        y: (this.state.axis.y.values.indexOf(Number(linesToDraw[tool][index+1].row))+1) * dimensions.height/(this.state.axis.y.values.length+1)
                    };

                    let height = secondDot.y - firstDot.y;

                    let lineType = {
                        width: 0,
                        dash: 0
                    };

                    if(lineTypes[tool] !== undefined){
                        lineType.width = lineTypes[tool].width;
                        if(lineTypes[tool].dash !== undefined)
                            lineType.dash = lineTypes[tool].dash;
                    }

                    // check if non-reponse
                    if(dot.nr)
                        return false;
                    else if(
                        index+1 <= linesToDraw[tool].length-1 &&
                        linesToDraw[tool][index+1].nr
                    )
                        return false;


                    return(
                        <svg key={index}
                            style={{
                                top: ((height > 0)?firstDot.y:secondDot.y) + ((height === 0)?11:15),
                                left: firstDot.x,
                                height: (height === 0)?6:Math.abs(height),
                                width: secondDot.x - firstDot.x
                            }}
                        >
                            <line
                                x1={(height >= 0)?"0":"100%"}
                                y1={(height===0)?"50%":'0'}
                                x2={(height < 0)?"0":"100%"}
                                y2={(height===0)?"50%":'100%'}
                                stroke={(this.props.left)?"#5d6bb2":"#f15c5d"}
                                strokeDasharray={lineType.dash}
                                strokeWidth={lineType.width}/>
                        </svg>
                    )
                }
                return true;
            })
        })

    };

    leftOrRight = () => {
        return(
            <Units vertical width={"40px"} margin={(this.props.left)?"14px 0 0 6px":"14px 3px 0 0"}>
                <Unit justifyContent={(this.props.left)?"flex-start":"flex-end"} height={"0px"}>{ this.state.axis.y.units }</Unit>
                {
                    this.state.axis.y.values.map( (unit, index) => {
                        if(!(index%2))
                            return(<Unit key={index} justifyContent={(this.props.left)?"flex-start":"flex-end"}>{ unit }</Unit>);
                    })
                }
            </Units>
        )
    };


    render() {
        return(
            <Wrapper>
                <Top>
                    <div />
                    <Units width={"calc(100% - 40px)"} margin={(this.props.left)?"0 0 0 -35px":"0 0 0 16px"}>
                        <Unit>{ this.state.axis.x.units }</Unit>
                        {
                            this.state.axis.x.values.map( (unit, index) => {
                                if(index%2 && index !== this.state.axis.x.values.length-1)
                                    return(<Unit key={index} justifyContent={"center"}>{ (unit > 1000)?unit/1000 + "k":unit }</Unit>);
                            })
                        }
                    </Units>
                </Top>
                <Bottom>
                    {
                        (!this.props.left)?this.leftOrRight():""
                    }
                    <GridContainer>
                        <Grid>
                            <LinesContainer ref={this.LineContainer}>
                                {
                                    this.searchLines()
                                }
                            </LinesContainer>
                            {
                                this.state.axis.y.values.map( (row, rowIndex) => {
                                    if(!(rowIndex%2)){
                                        return(
                                            <GridRow key={rowIndex} border last={(rowIndex === this.state.axis.y.values.length-1)}>
                                                {
                                                    this.state.axis.x.values.map((col, colIndex) => {
                                                        if(rowIndex === 0 && colIndex%2)
                                                            return(<GridCell key={colIndex} last={(colIndex === this.state.axis.x.values.length-1)} />);
                                                        else if(colIndex%2)
                                                            return (
                                                                <GridCell key={colIndex} last={(colIndex === this.state.axis.x.values.length-1)}>
                                                                    <DotContainer
                                                                        onClick={() => this.addDot(
                                                                            this.state.axis.y.values[rowIndex-2],
                                                                            this.state.axis.x.values[colIndex-2]
                                                                        )}
                                                                    >
                                                                        {
                                                                            this.checkForDots(
                                                                                this.state.axis.y.values[rowIndex-2],
                                                                                this.state.axis.x.values[colIndex-2])
                                                                        }
                                                                        <CurrentDot symbol={this.props.symbol} />
                                                                    </DotContainer>
                                                                    <DotContainer
                                                                        onClick={() => this.addDot(
                                                                            this.state.axis.y.values[rowIndex-2],
                                                                            this.state.axis.x.values[colIndex-1]
                                                                        )}
                                                                    >
                                                                        {
                                                                            this.checkForDots(
                                                                                this.state.axis.y.values[rowIndex-2],
                                                                                this.state.axis.x.values[colIndex-1])
                                                                        }
                                                                        <CurrentDot symbol={this.props.symbol} />
                                                                    </DotContainer>
                                                                    <DotContainer
                                                                        onClick={() => this.addDot(
                                                                            this.state.axis.y.values[rowIndex-1],
                                                                            this.state.axis.x.values[colIndex-2]
                                                                        )}
                                                                    >
                                                                        {
                                                                            this.checkForDots(
                                                                                this.state.axis.y.values[rowIndex-1],
                                                                                this.state.axis.x.values[colIndex-2])
                                                                        }
                                                                        <CurrentDot symbol={this.props.symbol} />
                                                                    </DotContainer>
                                                                    <DotContainer
                                                                        onClick={() => this.addDot(
                                                                            this.state.axis.y.values[rowIndex-1],
                                                                            this.state.axis.x.values[colIndex-1]
                                                                        )}
                                                                    >
                                                                        {
                                                                            this.checkForDots(
                                                                                this.state.axis.y.values[rowIndex-1],
                                                                                this.state.axis.x.values[colIndex-1])
                                                                        }
                                                                        <CurrentDot symbol={this.props.symbol} />
                                                                    </DotContainer>
                                                                </GridCell>
                                                            )
                                                    })
                                                }
                                            </GridRow>
                                        )
                                    }
                                })
                            }
                        </Grid>
                    </GridContainer>
                    {
                        (this.props.left)?this.leftOrRight():""
                    }
                </Bottom>
            </Wrapper>
        );
    }
}

export default Graph;
