import React, {Component} from "react";
import styled from 'styled-components';
import {Button, DateTimePicker, Subtitle, Title} from '../../../components';
import {addPatientId, importPatient, showAcuity} from '../../../actions'
import {connect} from 'react-redux'
import $ from 'jquery'

const Wrapper = styled.div`
    position: absolute;
    height: 100%;
    width: 100%;
    background-color: rgba(0,0,0,0.2);
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
		width: 60% ;
		height: 60% ;
	}
`;

const ResultBox = styled.div`
    width: 100%;
    height:100%;
    max-height: 300px;
    background-color:rgba(0,0,0,0.04);
    border-radius: 8px;
    overflow: auto;
    @media screen and (max-width: 1024px) {
		height: 45% ;
	}
`;


const Appointment = styled.div`
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
const mois = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

const mapStateToProps = (state) => {
	return {
		show: state.informations.acuityImporter
	}
};

const mapDispatchToProps = (dispatch) => {
	return ({
		cancel: () => {
			dispatch(showAcuity())
		},
		addId: (id) => {
			dispatch(addPatientId(id))
		},
		import: (fields) => {
			dispatch(importPatient(fields))
		}
	})
}

class AcuityImport extends Component {
	constructor(props) {
		super(props);
		this.state = {
			minDate: (new Date()).setHours(8, 0, 0, 0),
			maxDate: (new Date()).setHours(19, 0, 0, 0),
			appt: [],
			loaded: false,
			selected: null,
			counter: -1
		};
	}
	
	componentDidUpdate(prevProps, prevState, snapshot) {
		if (this.props.show && !this.state.loaded) {
			$.get("/modules/rapport-auditif/api/getAppointments.php?minDate=" +
				new Date(this.state.minDate).getFullYear() + "-" + (new Date(this.state.minDate).getMonth() + 1) + "-" + new Date(this.state.minDate).getDate()
				+ "&maxDate=" +
				new Date(this.state.maxDate).getFullYear() + "-" + (new Date(this.state.maxDate).getMonth() + 1) + "-" + new Date(this.state.maxDate).getDate(),
				data => {
					if (Array.isArray(data)) {
						this.setState({
							...this.state,
							appt: data,
							selectedPatient: null,
							loaded: true
						})
					}
				}
			)
		}
	}
	
	changeMinDate = date => {
		this.setState({
			...this.state,
			minDate: new Date(date),
			loaded: false
		})
	}
	changeMaxDate = date => {
		this.setState({
			...this.state,
			maxDate: new Date(date),
			loaded: false
		})
	}
	
	selectPatient = i => {
		if (this.state.selectedPatient === i) {
			this.import();
			return;
		}
		this.setState({
			...this.state,
			selectedPatient: i
		})
	}
	
	import = () => {
		if (this.state.appt[this.state.selectedPatient] !== undefined) {
			let e = this.state.appt[this.state.selectedPatient];
			let dateDeNaissance = {
				jour: "",
				mois: "",
				annee: ""
			};
			let zip = "";
			for (let j in e.forms) {
				if (e.forms[j].name === "1 - Date de naissance") {
					let rawDate = e.forms[j].values[0].value.split("-");
					dateDeNaissance = {
						jour: rawDate[0],
						mois: mois[rawDate[1] - 1],
						annee: rawDate[2]
					}
				} else if (e.forms[j].name === "2 - Adresse du patient") {
					zip = e.forms[j].values[1].value;
				}
			}
			let rawAdresse = e.location.split(",");
			let adresse = {
				adresse: "",
				ville: "",
				province: "QC",
				pays: "Canada"
			};
			if (rawAdresse[0] !== undefined && rawAdresse[1] !== undefined) {
				adresse = {
					adresse: rawAdresse[0],
					ville: rawAdresse[1],
					province: "QC",
					pays: "Canada"
				}
			}
			;
			
			
			let fields = [
				{attribute: "Genre", value: ""},
				{attribute: "Prénom", value: e.firstName},
				{attribute: "Nom", value: e.lastName},
				{attribute: "Courriel", value: e.email},
				{attribute: "Jour", value: dateDeNaissance.Jour},
				{attribute: "Mois", value: dateDeNaissance.Mois},
				{attribute: "Année", value: dateDeNaissance.Année},
				{attribute: "Numéro de téléphone", value: e.phone},
				{attribute: "Adresse", value: adresse.adresse},
				{attribute: "Ville", value: adresse.ville},
				{attribute: "Province", value: "QC"},
				{attribute: "Pays", value: "Canada"},
				{attribute: "Code Postal", value: zip},
				{attribute: "RAMQ", value: ""},
				{attribute: "expAnnée", value: ""},
				{attribute: "expMois", value: ""}
			];
			this.props.import(fields);
			this.props.addId(this.state.counter);
			this.setState({
				counter: this.state.counter - 1
			})
		}
		this.props.cancel();
	};
	
	
	render() {
		return (
			<Wrapper show={this.props.show}>
				<Inner>
					<Row>
						<Title text="Importer patient d'Acuity"/>
					</Row>
					<Row>
						<Subtitle text="Rendez-vous entre"/>
					</Row>
					<Row>
						<DateTimePicker label={"de"} origin="acuity" onChange={e => this.changeMinDate(e)}
						                defaultValue={this.state.minDate} dateonly/>
						<Subtitle text="  "/>
						<DateTimePicker label={"à"} origin="acuity" onChange={e => this.changeMaxDate(e)}
						                defaultValue={this.state.maxDate} dateonly/>
					</Row>
					<ResultBox>
						{
							this.state.appt.map((x, i) => {
								let dateDeNaissance = {
									jour: "",
									mois: "",
									anneee: ""
								};
								for (let j in x.forms) {
									if (x.forms[j].name === "1 - Date de naissance") {
										let rawDate = x.forms[j].values[0].value.split("-");
										dateDeNaissance = {
											jour: rawDate[0],
											mois: mois[rawDate[1] - 1],
											anneee: rawDate[2]
										};
										break;
									}
								}
								return (
									<Appointment selected={(this.state.selectedPatient === i)} key={i} onClick={e => {
										this.selectPatient(i)
									}}>
										<div>
											<div style={{
												fontWeight: "bold",
												fontSize: 18
											}}>{x.firstName + " " + x.lastName}</div>
											<div>Date de
												naissance: {dateDeNaissance.Jour} {dateDeNaissance.Mois} {dateDeNaissance.Année}</div>
										</div>
										<div style={{display: "flex", flexDirection: "column"}}>
											<div>Numéro de téléphone : {x.phone}</div>
											<div>rdv : {x.date} à {x.time}</div>
										</div>
									</Appointment>
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

export default connect(mapStateToProps, mapDispatchToProps)(AcuityImport);
