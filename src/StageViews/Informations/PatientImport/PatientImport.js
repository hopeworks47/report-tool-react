import React, {Component} from "react";
import styled from 'styled-components';
import {Button, Subtitle, Title} from '../../../components';
import {colors} from '../../../components/values';
import {importPatient, showPatients} from '../../../actions'
import {connect} from 'react-redux'
import $ from 'jquery'

const Wrapper = styled.div`
    position: absolute;
    height: 100%;
    width: 100%;
    background-color: ${colors.overlay};
    z-index: 10;
    justify-content: flex-start;
    align-items: flex-start;
    padding: 20px;
    margin: -5px -12px;
    display:${props => (props.show) ? "flex" : "none"}
`;

const Row = styled.div`
    display: flex;
    width: 100%;
    justify-content: ${props => props.right ? "flex-end" : "flex-start"};
    margin: 6px 0;
`;

const Inner = styled.div`
    height: 100%;
    width: 100%;
    background-color: white;
    border-radius: 24px;
    max-height: 600px;
    max-width: 700px;
    padding: 24px;
    box-sizing:border-box;
    @media screen and (max-width: 1024px) {
		width: 60%;
		height: 60% ;
	}
`;

const ResultBox = styled.div`
    width: 100%;
    height:100%;
    max-height: 380px;
    background-color:rgba(0,0,0,0.04);
    border-radius: 8px;
    overflow: auto;
    @media screen and (max-width: 1024px) {
		height: 65% ;
	}
`;
const Patient = styled.div`
    display:flex;
    padding:12px;
    background-color: ${props => (props.selected) ? "rgb(51, 102, 204)" : "rgba(0,0,0,0)"};
    color:${props => (props.selected) ? "white" : "inherit"}
    &:hover{
        background-color:rgb(51, 102, 204);
        color: white;
        cursor: pointer
    }
    & > div{
        width: 100%;
    }
    & > div:nth-child(2){
        text-align: right;
    }
`;

const SearchBar = styled.input`
    border: 1px solid rgba(0,0,0,0);
    border-radius: 8px;
    width: 300px;
    font-size: 14px;
    background-color: rgba(0,0,0,0.04);
    box-shadow: inset 0 1px 1px 1px rgba(0,0,0,0.05);
    color: #7D7D7D;
    padding: 12px;
    outline: none;
`;

const mapStateToProps = (state) => {
	return {
		show: state.informations.patientImporter
	}
};

const mapDispatchToProps = (dispatch) => {
	return ({
		cancel: () => {
			dispatch(showPatients())
		},
		importPatient: (patientData) => {
			dispatch(importPatient(patientData))
		}
	})
};

class PatientImport extends Component {
	constructor(props) {
		super(props);
		this.state = {
			patients: [],
			rawValues: [],
			selectedPatient: null,
			search: ""
		};
	}
	
	shouldComponentUpdate(nextProps, nextState) {
		if (nextProps.show === true && this.props.show !== true) {
			$.get("/API/patient/get", (data) => {
				let patients = [];
				let rawPatients = JSON.parse(data);
				for (let i in rawPatients) {
					let cleanedPatient = JSON.parse(rawPatients[i].metas);
					patients.push(cleanedPatient);
				}
				this.setState({
					rawValues: rawPatients,
					patients: patients,
					selectedPatient: null,
					search: ""
				})
			});
			return true;
		}
		return true;
	}
	
	selectPatient = (i) => {
		if (this.state.selectedPatient === i) {
			this.import();
			return;
		}
		this.setState({
			...this.state,
			selectedPatient: i
		})
	};
	
	componentDidUpdate(prevProps, prevState, snapshot) {
		if (prevState.search !== this.state.search && this.state.search.length >= 3) {
			$.post("/API/patient/search", {
				searchString: this.state.search
			}, (data) => {
				let patients = [];
				let rawPatients = JSON.parse(data);
				for (let i in rawPatients) {
					let cleanedPatient = JSON.parse(rawPatients[i].metas);
					patients.push(cleanedPatient);
				}
				this.setState({
					rawValues: rawPatients,
					patients: patients,
					selectedPatient: null
				})
			});
		}
	}
	
	search = (e) => {
		this.setState({
			...this.state,
			search: e.target.value
		})
	};
	
	import = () => {
		console.log(this.state.rawValues[this.state.selectedPatient].id, this.state.patients[this.state.selectedPatient]);
		this.props.importPatient(this.state.patients[this.state.selectedPatient]);
		this.props.addId(this.state.rawValues[this.state.selectedPatient].id);
		this.props.cancel();
	};
	
	render() {
		return (
			<Wrapper show={this.props.show}>
				<Inner>
					<Row>
						<Title text="Importer de mes patients"/>
					</Row>
					<Row>
						<Subtitle text="Rechercher :"/><SearchBar type="text" onChange={this.search}/>
					</Row>
					<ResultBox>
						{
							this.state.patients.map((x, i) => {
								if (x === null || x === undefined)
									return false;
								return (
									<Patient selected={(this.state.selectedPatient === i)} key={i} onClick={e => {
										this.selectPatient(i)
									}}>
										<div>
											<div style={{
												fontWeight: "bold",
												fontSize: 18
											}}>{x.genre + " " + x.prenom + " " + x.nom}</div>
											<div>Date de naissance: {x.ddn.jour} {x.ddn.mois} {x.ddn.annee}</div>
										</div>
										<div>
											<div>RAMQ : {x.ramq.no} exp.: {x.ramq.exp.annee}/{x.ramq.exp.mois}</div>
										</div>
									</Patient>
								);
							})
						}
					</ResultBox>
					<Row right>
						<Button secondary text="Annuler" handleClick={() => this.props.cancel()}/>
						<Button text="Importer" handleClick={() => this.import()}/>
					</Row>
				</Inner>
			</Wrapper>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(PatientImport);
