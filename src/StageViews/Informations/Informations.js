import React, {Component} from "react";
import styled from 'styled-components';
import AcuityImport from './AcuityImport';
import PatientImport from './PatientImport';
import {Button, InputText, Select, Subtitle, Switch, Title} from '../../components';
import {
	addPatientId,
	showAcuity,
	showPatients,
	startRapport,
	switchState,
	updateInfos,
	updateRapport
} from '../../actions'
import {connect} from 'react-redux'
import $ from 'jquery'

const Wrapper = styled.div`
width:100%;
display:flex;
`;

const Half = styled.div`
    width: 50%;
    min-width: 128px;
    @media screen and (max-width: 1024px) {
        min-width: 50% ;
    }
`;

const Row = styled.div`
    display: flex;
    justify-content: ${props => props.right ? "flex-end" : "flex-start"}
    align-items: ${props => props.center ? "center" : "unset"}
    color: #7D7D7D;
    @media screen and (max-width: 1024px) {
        flex-wrap: wrap;
    }
`;

class Informations extends Component {
	constructor(props) {
		super(props);
		this.state = {
			infos: {
				genre: "",
				prenom: "",
				nom: "",
				courriel: "",
				ddn: {
					jour: "",
					mois: "",
					annee: ""
				},
				telephone: "",
				adresse: {
					rue: "",
					ville: "",
					province: "QC",
					pays: "Canada",
					codePostal: ""
				},
				ramq: {
					no: "",
					exp: {
						annee: "",
						mois: ""
					}
				},
				prothese: false
			},
			cliniques: [],
		};
		
		
		$.get("/API/clinique/get", data => {
			let cliniquesData = JSON.parse(data);
			let cliniques = [];
			for (let i = 0; i < cliniquesData.length; i++) {
				cliniques.push(cliniquesData[i].clinique);
			}
			if (this.props.clinique === "")
				this.props.updateRapport("divers>clinique", cliniques[0]);
			this.setState({cliniques: cliniques});
		});
	}
	
	shouldComponentUpdate(nextProps, nextState) {
		return true;
	}
	
	componentDidUpdate(prevProps, prevState, snapshot) {
		if (prevProps.patientImport === null && this.props.patientImport !== null) {
			this.setState({
				infos: this.props.patientImport
			});
		}
		if (prevProps.rapportId === null && this.props.rapportId !== null) {
			console.log(this.props.patientId);
			$.post("/API/report/new", {
				patientId: this.props.patientId,
				rapportHash: this.props.rapportId
			}, (data) => {
				console.log(data, "Rapport Started")
			});
			return;
		}
		this.props.updateInformation(this.state.infos);
	}
	
	componentDidMount() {
		this.props.updateInformation(this.state.infos);
	}
	
	render() {
		let thisYear = (new Date()).getFullYear();
		let availableYears = [""];
		for (let i = thisYear; i < thisYear + 12; i++) {
			availableYears.push(i)
		}
		return (
			<Wrapper className="information-section w3-animate-right">
				<AcuityImport/>
				<PatientImport
					addId={id => {
						this.props.addPatientId(id)
					}}
				/>
				<Half>
					<Row center>
						<Title text="Informations"/>
					</Row>
					<Row>
						<Button text="Mes Patients" handleClick={this.props.showPatient}/>
						<Button secondary text="Acuity Scheduling" handleClick={this.props.showAcuity}/>
					</Row>
					<Row>
						<Half>
							<Select
								initValue={this.state.infos.genre}
								label="Genre"
								options={["", "M.", "Mme"]}
								onChange={e => {
									this.setState({
										...this.state,
										infos: {
											...this.state.infos,
											genre: e
										}
									});
								}}
							/>
						</Half>
						<div className={"mobile-layout"}>
							<InputText
								mobileWd={"mobile-Width-50"}
								defaultValue={this.state.infos.prenom}
								label="Prénom"
								onChange={e => {
									this.setState({
										...this.state,
										infos: {
											...this.state.infos,
											prenom: e
										}
									});
								}}
							/>
						</div>
						<InputText
							defaultValue={this.state.infos.nom}
							label="Nom"
							onChange={e => {
								this.setState({
									...this.state,
									infos: {
										...this.state.infos,
										nom: e
									}
								});
							}}
						/>
					</Row>
					<Row>
						<InputText
							defaultValue={this.state.infos.courriel}
							label="Courriel"
							onChange={e => {
								this.setState({
									...this.state,
									infos: {
										...this.state.infos,
										courriel: e
									}
								});
							}}
						/>
						<InputText
							className={"input-label"}
							defaultValue={this.state.infos.telephone}
							label="Numéro de téléphone"
							onChange={e => {
								this.setState({
									...this.state,
									infos: {
										...this.state.infos,
										telephone: e
									}
								});
							}}
						/>
					</Row>
					<Subtitle text="Date de Naissance"/>
					<Row>
						<div className={"mobile-layout"}>
							<InputText
								className={"input-label"}
								defaultValue={this.state.infos.ddn.jour}
								label="Jour"
								onChange={e => {
									this.setState({
										...this.state,
										infos: {
											...this.state.infos,
											ddn: {
												...this.state.infos.ddn,
												jour: e
											}
										}
									});
								}}
							/>
						</div>
						<div className={"mobile-layout"}>
							<Select
								className={"input-label"}
								initValue={this.state.infos.ddn.mois}
								label="Mois"
								options={["", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]}
								onChange={e => {
									this.setState({
										...this.state,
										infos: {
											...this.state.infos,
											ddn: {
												...this.state.infos.ddn,
												mois: e
											}
										}
									});
								}}
							/>
						</div>
						<InputText
							className={"input-label"}
							defaultValue={this.state.infos.ddn.annee}
							label="Année"
							onChange={e => {
								this.setState({
									...this.state,
									infos: {
										...this.state.infos,
										ddn: {
											...this.state.infos.ddn,
											annee: e
										}
									}
								});
							}}
						/>
					
					</Row>
					<Subtitle text="Adresse"/>
					
						<InputText
							className={"input-label"}
							defaultValue={this.state.infos.adresse.rue}
							label="Adresse de rue"
							onChange={e => {
								this.setState({
									...this.state,
									infos: {
										...this.state.infos,
										adresse: {
											...this.state.infos.adresse,
											rue: e
										}
									}
								});
							}}
						/>
						<Row>
							<div className={"desktop-layout"}>
								<InputText
									className={"input-label"}
									defaultValue={this.state.infos.adresse.ville}
									label="Ville"
									onChange={e => {
										this.setState({
											...this.state,
											infos: {
												...this.state.infos,
												adresse: {
													...this.state.infos.adresse,
													ville: e
												}
											}
										});
									}}
								/>
							</div>
							<div className={"desktop-layout"}>
								<InputText
									className={"input-label"}
									defaultValue={this.state.infos.adresse.codePostal}
									label="Code Postal"
									onChange={e => {
										this.setState({
											...this.state,
											infos: {
												...this.state.infos,
												adresse: {
													...this.state.infos.adresse,
													codePostal: e
												}
											}
										});
									}}
								/>
							</div>
						</Row>
						<Row>
							<div className={"desktop-layout"}>
								<Select
									className={"input-label"}
									initValue={this.state.infos.adresse.province}
									options={["QC", "AB", "BC", "MB", "NB", "NL", "NS", "NU", "ON", "PE", "SK", "YT"]}
									label="Province"
									onChange={e => {
										this.setState({
											...this.state,
											infos: {
												...this.state.infos,
												adresse: {
													...this.state.infos.adresse,
													province: e
												}
											}
										});
									}}
								/>
							</div>
							<div className={"desktop-layout"}>
								<Select
									className={"input-label"}
									initValue={this.state.infos.adresse.pays}
									options={["Canada"]}
									label="Pays"
									onChange={e => {
										this.setState({
											...this.state,
											infos: {
												...this.state.infos,
												adresse: {
													...this.state.infos.adresse,
													pays: e
												}
											}
										});
									}}
								/>
							</div>
						</Row>
					
					
				</Half>
				<Half>
					<Row center className={"information-armq"}>
						<Title text="&nbsp;"/>
					</Row>
					<Subtitle text="RAMQ"/>
					<InputText
						className={"input-label"}
						defaultValue={this.state.infos.ramq.no}
						label=""
						onChange={e => {
							this.setState({
								...this.state,
								infos: {
									...this.state.infos,
									ramq: {
										...this.state.infos.ramq,
										no: e
									}
								}
							});
						}}
					/>
					
					<Row>
						<Select
							initValue={this.state.infos.ramq.exp.annee}
							label="Anne d’expiration"
							options={availableYears}
							onChange={e => {
								this.setState({
									...this.state,
									infos: {
										...this.state.infos,
										ramq: {
											...this.state.infos.ramq,
											exp: {
												...this.state.infos.ramq.exp,
												annee: e
											}
										}
									}
								});
							}}
						/>
						<Select
							initValue={this.state.infos.ramq.exp.mois}
							label="Mois d’expiration"
							options={["", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]}
							onChange={e => {
								this.setState({
									...this.state,
									infos: {
										...this.state.infos,
										ramq: {
											...this.state.infos.ramq,
											exp: {
												...this.state.infos.ramq.exp,
												mois: e
											}
										}
									}
								});
							}}
						/>
					</Row>
					<Subtitle text="ODYO Clinique"/>
					<Row>
						<Half>
							<Select
								label="label"
								options={this.state.cliniques}
								initValue={this.props.clinique}
								onChange={e => {
									this.props.updateRapport("divers>clinique", e);
									this.forceUpdate();
								}}
							/>
						</Half>
						<Half>
							<InputText
								label="Référé par"
								defaultValue={this.props.reference}
								onChange={e => {
									this.props.updateRapport("divers>reference", e);
								}}
							/>
						</Half>
					</Row>
					<Row style={{marginBottom: 6, marginTop: 20}} center>
						<Switch
							color1="#76D36D"
							color2="#7d7d7d"
							onChange={e => {
								this.setState({
									...this.state,
									infos: {
										...this.state.infos,
										prothese: e
									}
								});
							}}
						/> Le patient possède une prothèse auditive
					</Row>
					<Row right>
						<Button text="Suivant" handleClick={() => {
							if (this.props.patientId === null) {
								$.post('/API/patient/new', null, patientId => {
									this.props.addPatientId(patientId);
									$.post('/API/patient/update', {
										patientId: patientId,
										patientMetas: JSON.stringify(this.state.infos)
									}, success => {
										console.log(success);
										nextStep(this);
									});
								});
							} else {
								$.post('/API/patient/update', {
									patientId: this.props.patientId,
									patientMetas: JSON.stringify(this.state.infos)
								}, success => {
									console.log(success);
									nextStep(this)
								});
							}
							nextStep(this);
						}}/>
					</Row>
				</Half>
			</Wrapper>
		);
	}
	
}

const nextStep = (e) => {
	// if(e.props.patientId === null)
	//     return;
	if (e.props.rapportId === null) {
		e.props.startRapport();
	}
	
	e.props.switchState();
	document.getElementById("root").scrollTo(0, 0)
	window.scrollTo(0, 0)
};

const mapDispatchToProps = (dispatch) => {
	return ({
		showPatient: () => {
			dispatch(showPatients())
		},
		showAcuity: () => {
			dispatch(showAcuity())
		},
		updateInformation: infos => {
			dispatch(updateInfos(infos))
		},
		updateRapport: (element, value) => {
			dispatch(updateRapport("string", element, value))
		},
		switchState: () => {
			dispatch(switchState(1))
		},
		addPatientId: (id) => {
			dispatch(addPatientId(id))
		},
		startRapport: () => {
			dispatch(startRapport())
		}
	})
};


const mapStateToProps = (state) => {
	return {
		patientId: state.informations.patientId,
		rapportId: state.informations.rapportId,
		patientImport: state.importer.patient,
		clinique: (state.rapport.fields[6] !== undefined) ? state.rapport.fields[6].data.clinique : "",
		reference: (state.rapport.fields[6] !== undefined) ? state.rapport.fields[6].data.reference : "",
	}
};
export default connect(mapStateToProps, mapDispatchToProps)(Informations);
