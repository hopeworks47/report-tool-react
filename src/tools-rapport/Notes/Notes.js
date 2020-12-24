import React, { Component } from "react";
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect } from 'react-redux'
import { updateRapport } from '../../actions'
import SetupData from './SetupData'
import { Editor } from '@tinymce/tinymce-react';
import arrow from './icon/arrow-up.svg';
import { Switch } from '../../components';
import $ from 'jquery';

const Wrapper = styled.div`
background-color:#EDEDED;
position: fixed;
right: 0;
height: ${props => (props.closed)? "100px" : (props.fullscreen) ? "calc(100vh - 100px)" : "325px" };
width: ${props => (props.closed)? "100px" : props.width + "px"};
transition: 0.3s width, 0.3s height, 0.3s top;
border-top-left-radius: ${props => (props.closed)? "8px" : "0" };
border-bottom-left-radius: ${props => (props.closed)? "8px" : "0" };
display: ${props => (props.active)? "flex" : "none"};
align-items: center;
justify-content: center;
top: ${props => (props.closed)?"70vh": (props.fullscreen) ? props.top + "px" : "calc(100vh - 325px)"};
box-shadow: ${props => (props.closed)? "0 2px 4px rgba(0,0,0,0.5)" : "0 -2px 8px 1px rgba(0,0,0,0.2)" };
overflow:hidden;
z-index: 99;
`

const TextArea = styled.div`
display: ${props => (props.show)? "none" : "block" };
width:100%;
height:100%;
padding: 18px 12px;
box-sizing: border-box;
`

const Inner = styled.div`
height: auto;
margin-bottom: 24px;
width:100%;
display:flex;
flex-direction:column;
`
const Tabs = styled.div`
display:flex;
width: 100%;
font-size: 14px;
min-height: 28px;
`
const Tab = styled.div`
background-color:${props => (props.active)?"white":"#E0E0E0"}
border: 1px solid #D6D6D6
padding: 6px;
border-top-left-radius: 8px;
border-top-right-radius: 8px;
box-sizing: border-box;
color: #858585;
margin-bottom: -1px;
&:hover{
    cursor: pointer
}
`;

const Icons = styled.div`
display:flex;
flex-direction: column;
align-items:center;
justify-content: ${props => props.open?"center":"space-around"};
background-color: #009999;
height:100%;
width:100%;
max-width: 100px;
color: white;
font-size: 24px
&:hover{
    cursor:pointer
}
`

const Icon = styled.div`
display: ${props => (props.show)? "none" : "flex" };
height: 50px;
width: 50px;
align-items: center;
justify-content: center;
& > svg, & > img{
    height: 100%;
    width: 100%!important;
    transform: ${props => props.isRotate?"rotate(180deg)":""}
}
&:hover{
    cursor: pointer
}
`;

const IconTitle = styled.div`
    font-size: 22px;
`;

const SwitchContainer = styled.div`
    display:flex;
    flex-direction:column;
    justify-content: center;
    color: #7D7D7D;
    align-items: flex-end;
`;

const SentencesContainer = styled.div`
    width: 100%;
    height: 100%;
`;

const Sentences = styled.div`
    height: 100%;
    width: 100%;
    display: ${props => props.active?"flex":"none"};
    height: calc(100% - 330px);
    overflow:auto
`;

const Col = styled.div`
    width: 33%;
    display:flex;
    flex-direction:column
`;

const Sentence = styled.div`
    width: 100%;
    padding: 12px;
    margin-bottom: 6px;
    background-color: white;
    border-radius: 8px;
    box-sizing: border-box;
    border: 1px solid rgb(214, 214, 214);
    &:hover{
        cursor:pointer;
        background-color: rgb(51, 102, 204);
        color: white;
    }
`;

function mapStateToProps(state) {
    if(state.rapport.fields[7]!== undefined){
        return {
            tabs : state.rapport.fields[7].data.tabs,
            notes: state.rapport.active,
            importData : (state.importer.rapport !== null )?state.importer.rapport[7].data:null
        }
    }
    return {
        tabs: [],
        notes: false,
        importData: null
    }
}

function mapDispatchToProps(dispatch) {
    return({
        update: (tabs) => {dispatch(updateRapport("object", "notes>tabs", tabs))},
        switchLang: lang => {dispatch(updateRapport("string","divers>lang", lang))}
    })
}


class Notes extends Component {
    constructor(props){
        super(props)
        this.state = {
            closed: true,
            fullscreen: false,
            height: 0,
            width: document.getElementById('root').offsetWidth,
            currentText: "",
            francais: true,
            sentences: [],
            active: 0
        };
        this.editor = React.createRef();
    }

    componentDidMount(){
        $.get("/modules/phrases-tool/api/getPhrases.php", data => {
            if(this.props.tabs.length)
                return;

            let tabs = [];
            let rawTabs = [];
            data = JSON.parse(data);
            for(let j in data.tabs){
                let x = data.tabs[j];
                let phrases = [];
                for(let i in data.phrases){
                    if(data.phrases[i].tab_id === x.id){
                        phrases.push({
                            id: data.phrases[i].id,
                            francais: data.phrases[i].francais,
                            anglais: data.phrases[i].anglais,
                            col: data.phrases[i].col
                        });
                    }
                }
                rawTabs.push({
                    id: x.id,
                    francais: x.francais,
                    anglais: x.anglais,
                    phrases: phrases
                });
                tabs.push(
                    {
                        active: false,
                        title: x.francais,
                        text: "<p style='margin:0;font-family:Helvetica,Lato,sans-serif'><span><strong>"+ x.francais +" :</strong></span><span>&nbsp;</span></p>"
                    }
                )
            }
            tabs[0].active = true;
            this.props.update(tabs);
            this.setState({
                sentences: rawTabs
            })
        })
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.importData === null && this.props.importData !== null){
            this.props.update(this.props.importData.tabs);
            this.forceUpdate();
        }
    }

    switchLang = () => {
        let tabs = [];
        for(let i in this.state.sentences){
            let title = (this.state.francais)?this.state.sentences[i].anglais.replace(/\\/g, ""):this.state.sentences[i].francais.replace(/\\/g, "")
            tabs.push({
                active: false,
                title: title,
                text: this.props.tabs[i].text
            });
            if(Number(i) === this.state.active){
                tabs[i].active = true;
            }
        }
        this.props.switchLang("en");
        this.setState({
            francais: !this.state.francais,
        });
        this.props.update(tabs)
    };



    addSentence = sentence => {
        if(this.state.francais)
            window.addText(sentence.francais);
        else {
            window.addText(sentence.anglais);
        }
    };



    toggle = (e) =>{
        this.setState({
            closed: !this.state.closed,
            top: window.scrollY + window.innerHeight - 300,
            width: document.getElementById('root').offsetWidth,
            fullscreen: false
        });
        for(let i in this.props.tabs){
            if(this.props.tabs[i].active){
                this.setState({
                    currentText: this.props.tabs[i].text
                })
            }
        }
    };

    fullscreen = () => {
        if(!this.state.fullscreen){
            this.setState({
                fullscreen: !this.state.fullscreen,
                top: document.getElementById('root').offsetTop + 100
            })
        }else{
            this.setState({
                fullscreen: !this.state.fullscreen
            })
        }

    };

    updateText = (e) => {
        this.props.tabs.map((x) => {
            if(x.active){
                x.text = e
                this.setState({
                    currentText: e
                })
                this.props.update(this.props.tabs)
            }
        })
    };

    switchTab = (index) => {
        this.props.tabs.map((x, i) => {
            if(i === index){
                x.active = true
                this.setState({
                    currentText: x.text,
                    active: i
                })
            }else{
                x.active = false
            }
            return true;
        })
    };


  render() {
    return (
        <Wrapper onClick={() => {
                if(this.state.closed){
                    this.toggle("open")
                }
            }}
                 active={this.props.notes}
                 width={this.state.width}
                 top={this.state.top}
                 closed={this.state.closed}
                 height={this.state.height}
                 fullscreen={this.state.fullscreen} >
            <SetupData />
            <TextArea show={this.state.closed}>
                <SwitchContainer>
                    <div className={"mobile-notes-spacing"}>Francais | Anglais</div>
                    <Switch
                        color1="#f15c5d"
                        color2="#5d6bb2"
                        onChange={e => {
                            this.switchLang();
                        }}
                    />
                </SwitchContainer>
                <Inner>
                    <Tabs>
                        {
                            this.props.tabs.map((x, i) => (
                                <Tab key={i} onClick={() => this.switchTab(i)} active={x.active}>
                                    {
                                        x.title.replace(/\\/g, "")
                                    }
                                </Tab>
                            ))
                        }
                    </Tabs>
                    <Editor ref={this.editor} value={this.state.currentText.replace(/\\/g, "")} onEditorChange={this.updateText} apiKey='v43to48notxivvhlrxv7f7wr7ctl9mitc040b9ndw458m8cy' init={{
                        menubar: false,
                        oninit : "setPlainText",
                        plugins: "lists paste",
                        toolbar: "undo redo bold italic numlist bullist alignleft aligncenter alignright alignjustify",
                        height: "100%",
                        inline_styles : true,
                        content_style: "p {margin:0} ul, ol {margin:0;padding: 0 0 0 20px;} li{margin:0}",
                        init_instance_callback: function (editor) {
                            window.addText = e => {
                                editor.execCommand('mceInsertContent', false, e.replace(/\\/g, ""));
                            };
                            editor.on('PostProcess', function(ed) {
                                   // Add some styles to every paragraph
                                   ed.content = ed.content.replace(/<p[^>]+>|<p>/g, '<p style="margin:0px;font-family:helvetica">');
                                   ed.content = ed.content.replace(/<ul[^>]+>|<ul>/g, '<ul style="margin:0px;padding: 0 0 0 20px;font-family:helvetica">');
                                   ed.content = ed.content.replace(/<ol[^>]+>|<ol>/g, '<ol style="margin:0px;padding: 0 0 0 20px;font-family:helvetica">');
                                   ed.content = ed.content.replace(/<li[^>]+>|<li>/g, '<li style="margin:0px;font-family:helvetica">');
                              });
                          }

                    }} />
                </Inner>
                <SentencesContainer>
                    {this.state.sentences.map((x, i) => {
                        let cols1 = [];
                        let cols2 = [];
                        let cols3 = [];
                        x.phrases.map(y => {
                            if(y.col === "1")
                                cols1.push(y);
                            if(y.col === "2")
                                cols2.push(y);
                            if(y.col === "3")
                                cols3.push(y);
                            return true;
                        });
                        return(
                            <Sentences active={(this.state.active === i)}>
                                <Col>
                                {
                                    cols1.map(y => {
                                        return(
                                            <Sentence onClick={() => this.addSentence(y)}>{(this.state.francais)?y.francais.replace(/\\/g, ""):y.anglais.replace(/\\/g, "")}</Sentence>
                                        );
                                    })
                                }
                                </Col>
                                <Col>
                                {
                                    cols2.map(y => {
                                        return(
                                            <Sentence onClick={() => this.addSentence(y)}>{(this.state.francais)?y.francais.replace(/\\/g, ""):y.anglais.replace(/\\/g, "")}</Sentence>
                                        );
                                    })
                                }
                                </Col>
                                <Col>
                                {
                                    cols3.map(y => {
                                        return(
                                            <Sentence onClick={() => this.addSentence(y)}>{(this.state.francais)?y.francais:y.anglais}</Sentence>
                                        );
                                    })
                                }
                                </Col>
                            </Sentences>
                        )
                    })}
                </SentencesContainer>
            </TextArea>
            <Icons open={this.state.closed}>
                <Icon onClick={this.fullscreen} show={this.state.closed} isRotate={this.state.fullscreen}>
                    <img src={arrow} />
                </Icon>
                <Icon onClick={() => {(this.state.closed) ? this.toggle("open") : this.toggle("close")}}>
                    <FontAwesomeIcon icon={(this.state.closed) ? "sticky-note" : "times"} />
                </Icon>
                <IconTitle>Rapport</IconTitle>
            </Icons>
        </Wrapper>
    );
  }
}

export default connect( mapStateToProps, mapDispatchToProps )(Notes);
