import React, {Component} from "react";
import styled from 'styled-components';
import Stage from './Stage'
import {connect} from 'react-redux'


const Wrapper = styled.div`
    width: 100%;
    height: 100px;
    background-color: white;
    display:flex;
    align-items:center;
    justify-content:center
`;
const Inner = styled.div`
    width:100%;
    max-width:800px;
    display:flex;
    justify-content: space-evenly;
`;

const mapStateToProps = (state) => {
	return {
		informations: {
			active: state.informations.active,
			unlock: state.informations.unlock
		},
		rapport: {
			active: state.rapport.active,
			unlock: state.rapport.unlock
		},
		suivi: {
			active: state.suivi.active,
			unlock: state.suivi.unlock
		},
		pdf: {
			active: state.pdf.active,
			unlock: state.pdf.unlock
		}
	}
};

class Stages extends Component {

	render() {
		return (
			<Wrapper>
				<Inner>
					<Stage index={0}
					       active={this.props.informations.active}
					       unlock={this.props.informations.unlock}
					       icon="user"
					       text="Informations"/>
					<Stage index={1}
					       active={this.props.rapport.active}
					       unlock={this.props.rapport.unlock}
					       icon="assistive-listening-systems"
					       text="Rapport"/>
					<Stage index={2}
					       active={this.props.suivi.active}
					       unlock={this.props.suivi.unlock}
					       icon="mail-bulk"
					       text="Suivi"/>
					<Stage index={3}
					       active={this.props.pdf.active}
					       unlock={this.props.pdf.unlock}
					       icon="file-pdf"
					       text="PDF"/>
				</Inner>
			</Wrapper>
		);
	}
};

export default connect(mapStateToProps)(Stages);

//<Wrapper>
// 		    <Inner>
// 		        <Stage index={0}
// 		               active={this.props.informations.active}
// 		               unlock={this.props.informations.unlock}
// 		               icon="user"
// 		               text="Informations"/>
// 		        <Stage index={1} active={this.props.rapport.active} unlock={this.props.rapport.unlock} icon="assistive-listening-systems" text="Rapport"/>
// 		        <Stage index={2} active={this.props.suivi.active} unlock={this.props.suivi.unlock} icon="mail-bulk" text="Suivi"/>
// 		        <Stage index={3} active={this.props.pdf.active} unlock={this.props.pdf.unlock} icon="file-pdf" text="PDF"/>
// 		    </Inner>
// 		</Wrapper>