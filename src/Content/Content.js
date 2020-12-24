import React, {Component} from "react";
import styled from 'styled-components';
import Informations from '../StageViews/Informations';
import Rapport from '../StageViews/Rapport';
import Suivi from '../StageViews/Suivi';
import Pdf from '../StageViews/PDF';
import {connect} from 'react-redux'

// const Wrapper = styled.div`
// display: flex;
// width: 400%;
// position: relative;
// left: ${props => props.current * -100 + "%"};
// transition: 0.3s left;
// `

const Wrapper = styled.div`
display: flex;
width: 100%;
position: relative;
transition: 0.3s left;
`

const View = styled.div`
width: 100%;
padding: 6px 12px;
box-sizing: border-box
`

const displayNone = {
	display: 'none'
}
const displayBlock = {
	display: 'block'
}


class Content extends Component {
	constructor(props) {
		super(props)
	}

	render() {
		console.log(this.props.activitis)
		return (
			<Wrapper current={this.props.current}>
				<View style={this.props.activitis[0]? displayBlock : displayNone}>
					<Informations/>
				</View>
				<View style={this.props.activitis[1]? displayBlock : displayNone}>
					<Rapport/>
				</View>
				<View style={this.props.activitis[2]? displayBlock : displayNone}>
					<Suivi/>
				</View>
				<View style={this.props.activitis[3]? displayBlock : displayNone}>
					<Pdf/>
				</View>
			</Wrapper>
		);
	}
}

const mapStateToProps = (state) => {
	let activitis = [];
	for (var key in state) {
		activitis.push(state[key].active)
	}
	return {
		activitis: activitis
	}
}

export default connect(mapStateToProps)(Content);
