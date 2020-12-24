import React, { Component, useState } from "react";
import styled from 'styled-components';
import { Input, Button, Title, Subtitle } from '../../components';
import { connect } from 'react-redux'
import MiseEnPage from './MiseEnPage'
import canvg from 'canvg'
import * as jsPDF from 'jspdf'
import logo from '../../images/logo.png'
import cercle from '../../images/cercle.png';
import cercleNr from '../../images/cercle_nr.png';
import x from '../../images/x.png';
import xNr from '../../images/x_nr.png';
import triangle from '../../images/triangle.png';
import triangleNr from '../../images/triangle_nr.png';
import carre from '../../images/carre.png';
import carreNr from '../../images/carre_nr.png';
import iRouge from '../../images/i_rouge.png';
import iBleu from '../../images/i_bleu.png';
import flecheRouge from '../../images/fleche_rouge.png';
import flecheRougeNr from '../../images/fleche_rouge_nr.png';
import flecheBleu from '../../images/fleche_bleu.png';
import flecheBleuNr from '../../images/fleche_bleu_nr.png';
import bracketRouge from '../../images/bracket_rouge.png';
import bracketRougeNr from '../../images/bracket_rouge_nr.png';
import bracketBleu from '../../images/bracket_bleu.png';
import bracketBleuNr from '../../images/bracket_bleu_nr.png';
import etoileRouge from '../../images/etoile_rouge.png';
import etoileBleu from '../../images/etoile_bleu.png';
import nrRouge from '../../images/nr_rouge.png';
import nrBleu from '../../images/nr_bleu.png';
import anterieur from '../../images/anterieur.png';
import check from '../../images/checkmark.png';
import champLibre from '../../images/champ_libre.png';
import $ from "jquery";

const Row = styled.div`
    display: flex;
    justify-content: ${props => props.right ? "flex-end" : "flex-start"}
    align-items: ${props => props.center ? "center" : "unset"}
    margin-bottom: 48px;
`;

function getDataUri(url, cb){
    let image = new Image();

    image.onload = function () {
        let canvas = document.createElement('canvas');
        canvas.width = this.naturalWidth;
        canvas.height = this.naturalHeight;

        //next three lines for white background in case png has a transparent background
        let ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';  /// set white fill style
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        canvas.getContext('2d').drawImage(this, 0, 0);

        cb(canvas.toDataURL('image/png'));
    };
    image.src = url;
}


const getSignatureFirst = (state, comp, print) => {
    let signature = {
        fullName: "",
        titre: "",
        signature: "",
        license: ""
    }
    let date = new Date();
    let month = ((date.getMonth()+1) < 10) ? "0" + (date.getMonth()+1) : (date.getMonth()+1);
    let day = (date.getDate() < 10) ? "0" + date.getDate() : date.getDate();
    let fileName = 'rapport-'+
                    state.informations.fields[1].value+"-"+
                    state.informations.fields[2].value+"-"+
                    date.getFullYear()+""+
                    month+""+
                    day+'.pdf'
    $.get("/modules/rapport-auditif/api/getSignature.php", (data) => {
        try {
          data = JSON.parse(data);
          if(data[0] !== undefined){
              data = data[0]
              let imgData = "/modules/rapport-auditif/api/images/" + data.signature + ".png";

              getDataUri(imgData, function(dataUri) {
                  signature = {
                      fullName: data.fullName,
                      titre: data.titre,
                      signature: dataUri,
                      license: data.license
                  }
                  let pdf = generatePDF(state, signature);
                  if(print){
                      pdf.autoPrint();
                        window.open(pdf.output('bloburl'), '_blank');
                  }else{
                      pdf.save(fileName)
                  }
              })
          }
        }
        catch(error) {
            let pdf = generatePDF(state, signature)
            if(print){
                pdf.autoPrint();
                  window.open(pdf.output('bloburl'), '_blank');
            }else{
                pdf.save(fileName);
            }
        }
        if(print){
            buttonPrint = false;
        }else{
            buttonLoading = false;
        }
        comp.forceUpdate()
    })
}

const generatePDF = (state, signature) => {

    let pos = MiseEnPage();

    var doc = new jsPDF("p", "pt", "letter");
    doc.setLineWidth(0.5);
    //Logo
    doc.addImage(logo, "png", pos.margin.left, pos.margin.top, pos.logo.width, pos.logo.height);
    //Adresse
    doc.setFontSize(8);
    let adresse = "";
    let phone = "";
    for(i in window.clinique){
        if(window.clinique[i].clinique === state.rapport.fields[6].data.clinique){
            adresse = window.clinique[i].adresse+"\n"+window.clinique[i].ville+" (Qc) "+window.clinique[i].zip;
            phone = "Tél. : " + window.clinique[i].phone;
            break;
        }
    }
    doc.text(adresse, pos.adresse.left, pos.adresse.top);
    doc.setFontSize(9);
    doc.text(phone, pos.adresse.left, pos.adresse.top + 19);
    //infos
    doc.setFontSize(12);
    doc.setTextColor("#7D7D7D");
    let split = {
        x : 220,
        y : 20
    }

    let mois = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"]
    let date = new Date();
    doc.setTextColor("#000000");
    doc.text(   state.informations.fields[0].value + " " +
                state.informations.fields[1].value + " " +
                state.informations.fields[2].value + "(" +
                state.informations.fields[4].value + " " +
                state.informations.fields[5].value + " " +
                state.informations.fields[6].value + ")",
        pos.infos.left,
        pos.infos.top);
    doc.text("Date: "+date.getDate() + " " + mois[date.getMonth()] + " " + date.getFullYear(),
        pos.width - pos.margin.right,
        pos.infos.top, "right");
    doc.text("Référé par: " + state.rapport.fields[6].data.referance,
        pos.width - pos.margin.right,
        pos.infos.top + split.y, "right")
    doc.text(   state.informations.fields[13].value + " exp: "+
                state.informations.fields[14].value + " " +
                state.informations.fields[15].value,
        pos.infos.left,
        pos.infos.top + split.y);
    //rapport
    doc.setFont('Helvetica', 'Bold');
    doc.text("RAPPORT AUDIOLOGIQUE", pos.width / 2, pos.rapport.top, 'center');
    doc.setFont('Helvetica', '');
    //audiogramme
    let freq = [250, 500, 1000, 2000, 4000, 8000];
    let allFreq = [125, 250, 375, 500, 750, 1000, 1500, 2000, 3000, 4000, 6000, 8000, 16000 ];
    if(state.rapport.fields[0].data.type === "16 000hz"){
        freq = [250, 500, 1000, 2000, 4000, 8000, 10000, 12500, 16000];
        allFreq = [125, 250, 375, 500, 750, 1000, 1500, 2000, 3000, 4000, 6000, 8000, 9000, 10000, 11250, 12500, 14250, 16000];
        pos.audiogramme.width = 228;
        pos.audiogramme.cell.width = pos.audiogramme.width/10;
        pos.audiogramme.gap = 28;
    }
    //droite
    doc.setFontSize(10);
    doc.setFillColor("#cccccc");
    doc.rect(pos.audiogramme.left,
        pos.audiogramme.top + pos.audiogramme.cell.height,
        pos.audiogramme.width,
        pos.audiogramme.cell.height, 'F');
    doc.roundedRect(
        pos.audiogramme.left,
        pos.audiogramme.top,
        pos.audiogramme.width,
        pos.audiogramme.height,
        pos.audiogramme.borderRadius,
        pos.audiogramme.borderRadius
    );
    if(state.rapport.fields[0].data.type !== "Champ Libre"){
        doc.text("AUDIOGRAMME OREILLE DROITE",
            pos.audiogramme.left + pos.audiogramme.width/2,
            pos.audiogramme.top + pos.audiogramme.cell.height - 4, 'center')
    }else{
        doc.text("AUDIOGRAMME",
            pos.audiogramme.left + pos.audiogramme.width/2,
            pos.audiogramme.top + pos.audiogramme.cell.height - 4, 'center')
    }
    doc.line(pos.audiogramme.left,
        pos.audiogramme.top + pos.audiogramme.cell.height,
        pos.audiogramme.left + pos.audiogramme.width,
        pos.audiogramme.top + pos.audiogramme.cell.height);
    doc.line(pos.audiogramme.left,
        pos.audiogramme.top + pos.audiogramme.cell.height * 2,
        pos.audiogramme.left + pos.audiogramme.width,
        pos.audiogramme.top + pos.audiogramme.cell.height * 2);

    doc.setFontSize(8);
    doc.text("Hertz",
        pos.audiogramme.left - 3,
        pos.audiogramme.top + pos.audiogramme.cell.height * 2 - 8, 'right');
    doc.text("dBHL", pos.audiogramme.left - 3,
        pos.audiogramme.top + pos.audiogramme.cell.height * 2 + 6, 'right');
    for(var i in freq){
        doc.text((freq[i] >= 10000)?freq[i].toString()[0]+""+freq[i].toString()[1]+"k":freq[i].toString(),
        pos.audiogramme.left + i * pos.audiogramme.cell.width + pos.audiogramme.cell.width,
        pos.audiogramme.top + pos.audiogramme.cell.height * 2 - 5, 'center')
    }
    doc.line(pos.audiogramme.left,
        pos.audiogramme.top + pos.audiogramme.cell.height * 3 - 1,
        pos.audiogramme.left + pos.audiogramme.width,
        pos.audiogramme.top + pos.audiogramme.cell.height * 3 - 1);
    doc.line(pos.audiogramme.left,
        pos.audiogramme.top + pos.audiogramme.cell.height * 3 + 1,
        pos.audiogramme.left + pos.audiogramme.width,
        pos.audiogramme.top + pos.audiogramme.cell.height * 3 + 1);
    for(i = 0; i <= 120; i = i + 10){
        doc.text(i.toString(), pos.audiogramme.left - 3,
        pos.audiogramme.top + pos.audiogramme.cell.height * ((i/10) + 3) + 2, 'right')
    }
    for(i = 0; i <= 120; i = i + 10){
        if(i === 0 || i === 120){
            continue;
        }
        doc.line(
            pos.audiogramme.left,
            pos.audiogramme.top + pos.audiogramme.cell.height * ((i/10) + 3),
            pos.audiogramme.left + pos.audiogramme.width,
            pos.audiogramme.top + pos.audiogramme.cell.height * ((i/10) + 3))
        if(i === 20){
            doc.setLineDash([2]);
            doc.line(
                pos.audiogramme.left,
                pos.audiogramme.top + pos.audiogramme.cell.height * ((i/10) + 3) + pos.audiogramme.cell.height/2,
                pos.audiogramme.left + pos.audiogramme.width,
                pos.audiogramme.top + pos.audiogramme.cell.height * ((i/10) + 3) + pos.audiogramme.cell.height/2)
            doc.setLineDash()

        }
    }
    for(i in freq){
        if(i === 0){
            doc.setDrawColor("#666666");
            doc.setLineDash([2]);
            doc.line(
                pos.audiogramme.left + i * pos.audiogramme.cell.width + pos.audiogramme.cell.width - pos.audiogramme.cell.width/2,
                pos.audiogramme.top + pos.audiogramme.cell.height*2,
                pos.audiogramme.left + i * pos.audiogramme.cell.width + pos.audiogramme.cell.width - pos.audiogramme.cell.width/2,
                pos.audiogramme.top + pos.audiogramme.height
            );
            doc.setLineDash();
            doc.setDrawColor("#000000")
        }
        doc.line(
            pos.audiogramme.left + i * pos.audiogramme.cell.width + pos.audiogramme.cell.width,
            pos.audiogramme.top + pos.audiogramme.cell.height*2,
            pos.audiogramme.left + i * pos.audiogramme.cell.width + pos.audiogramme.cell.width,
            pos.audiogramme.top + pos.audiogramme.height
        )
        doc.setDrawColor("#666666")
        doc.setLineDash([2])
        doc.line(
            pos.audiogramme.left + i * pos.audiogramme.cell.width + pos.audiogramme.cell.width + pos.audiogramme.cell.width/2,
            pos.audiogramme.top + pos.audiogramme.cell.height*2,
            pos.audiogramme.left + i * pos.audiogramme.cell.width + pos.audiogramme.cell.width + pos.audiogramme.cell.width/2,
            pos.audiogramme.top + pos.audiogramme.height
        )
        doc.setLineDash()
        doc.setDrawColor("#000000")
    }


    let coord;
    let coords = [[],[],[],[],[],[],[]]
    for(i in state.rapport.fields[0].data.droite.data[6]){
        coords[0].push({
            ...state.rapport.fields[0].data.droite.data[6][i],
            tool: 6
        })
    }
    for(i in state.rapport.fields[0].data.droite.data[0]){
        coords[1].push({
            ...state.rapport.fields[0].data.droite.data[0][i],
            tool: 0
        })
    }
    for(i in state.rapport.fields[0].data.droite.data[1]){
        coords[1].push({
            ...state.rapport.fields[0].data.droite.data[1][i],
            tool: 1
        })
    }
    coords[1].sort(function(a, b) {
        return a.freq - b.freq;
    })

    for(i in state.rapport.fields[0].data.droite.data[2]){
        coords[2].push({
            ...state.rapport.fields[0].data.droite.data[2][i],
            tool: 2
        })
    }


    for(i in state.rapport.fields[0].data.droite.data[3]){
        coords[3].push({
            ...state.rapport.fields[0].data.droite.data[3][i],
            tool: 3
        })
    }
    for(i in state.rapport.fields[0].data.droite.data[4]){
        coords[3].push({
            ...state.rapport.fields[0].data.droite.data[4][i],
            tool: 4
        })
    }
    coords[3].sort(function(a, b) {
        return a.freq - b.freq;
    })

    for(i in state.rapport.fields[0].data.droite.data[5]){
        coords[4].push({
            ...state.rapport.fields[0].data.droite.data[5][i],
            tool: 5
        })
    }

    for(i in state.rapport.fields[0].data.droite.data[7]){
        coords[5].push({
            ...state.rapport.fields[0].data.droite.data[7][i],
            tool: 7
        })
    }

    for(i in state.rapport.fields[0].data.droite.data[8]){
        coords[6].push({
            ...state.rapport.fields[0].data.droite.data[8][i],
            tool: 8
        })
    }



    for(i in coords){
        let dataset = coords[i];
        let prevCoord = null;
        for(j in dataset){
            for(let h in allFreq){
                for(let g = -10; g <= 120; g = g + 5){
                    if(dataset[j].freq === allFreq[h] && dataset[j].db === g){
                        coord = {
                            x:pos.audiogramme.left + pos.audiogramme.cell.width/2 + h * (pos.audiogramme.cell.width/2) - 7,
                            y:pos.audiogramme.top + (pos.audiogramme.cell.height*3) + (g/5) * (pos.audiogramme.cell.height/2) - 7,
                            nr: dataset[j].nr,
                            tool : dataset[j].tool
                        };
                        switch (dataset[j].tool){
                            case 0 :{
                                if(coord.nr){
                                    doc.addImage(cercleNr, coord.x, coord.y, 14, 14);
                                }else{
                                    doc.addImage(cercle, coord.x, coord.y, 14, 14);
                                }
                                break;
                            }
                            case 1 :{
                                if(coord.nr){
                                    doc.addImage(triangleNr, coord.x, coord.y, 14, 14);
                                }else{
                                    doc.addImage(triangle, coord.x, coord.y, 14, 14);
                                }
                                break;
                            }
                            case 2 :{
                                doc.addImage(iRouge, coord.x, coord.y, 14, 14);
                                break;
                            }
                            case 3 :{
                                if(coord.nr){
                                    doc.addImage(flecheRougeNr, coord.x, coord.y, 14, 14);
                                }else{
                                    doc.addImage(flecheRouge, coord.x, coord.y, 14, 14);
                                }
                                break;
                            }
                            case 4 :{
                                if(coord.nr){
                                    doc.addImage(bracketRougeNr, coord.x, coord.y, 14, 14);
                                }else{
                                    doc.addImage(bracketRouge, coord.x, coord.y, 14, 14);
                                }
                                break;
                            }
                            case 5 :{
                                doc.addImage(etoileRouge, coord.x, coord.y, 14, 14);
                                break;
                            }
                            case 6 :{
                                doc.addImage(anterieur, coord.x, coord.y, 14, 14);
                                break;
                            }
                            case 8 :{
                                doc.addImage(champLibre, coord.x, coord.y, 14, 14);
                                break;
                            }
                        }

                        if(j!=0){
                            if(i == 1 && coord != null && prevCoord != null && !coord.nr && !prevCoord.nr){
                                doc.setDrawColor("#f15c5d")
                                doc.setLineWidth(1)
                                doc.line(prevCoord.x +7, prevCoord.y +7, coord.x +7, coord.y +7)
                            }else if(i == 5 && coord != null && prevCoord != null){
                                doc.setDrawColor("#f15c5d")
                                doc.setLineWidth(1)
                                doc.setLineDash([2])
                                doc.line(prevCoord.x +7, prevCoord.y +7, coord.x +7, coord.y +7)
                                doc.setLineDash()
                            }
                        }

                        prevCoord = coord;
                    }
                }
            }
        }
    }
    doc.setDrawColor("#000000");
    doc.setLineWidth(0.5);

    if(state.rapport.fields[0].data.type === "8000hz"){
        doc.text("Mode :\n" + state.rapport.fields[0].data.mode,
                    pos.audiogramme.left + pos.audiogramme.width + pos.audiogramme.gap/2,
                    pos.audiogramme.top + 3,
                    'center')
    }

    if(state.rapport.fields[0].data.type !== "Champ Libre"){
        doc.text("dBHL",
            pos.audiogramme.left + pos.audiogramme.width + pos.audiogramme.gap/2,
            pos.audiogramme.top + pos.audiogramme.cell.height * 2 + 6, 'center');
        for(i = 0; i <= 120; i = i + 10){
            if(state.rapport.fields[0].data.type === "16 000hz"){
                doc.text(i.toString(),
                    pos.audiogramme.left + pos.audiogramme.width + pos.audiogramme.gap - 2,
                    pos.audiogramme.top + pos.audiogramme.cell.height * ((i/10) + 3) + 2, 'right')
            }else{
                doc.text(i.toString(),
                    pos.audiogramme.left + pos.audiogramme.width + pos.audiogramme.gap/2,
                    pos.audiogramme.top + pos.audiogramme.cell.height * ((i/10) + 3) + 2, 'center')
            }
        }

    //gauche
        pos.audiogramme.left = pos.audiogramme.left + pos.audiogramme.width + pos.audiogramme.gap
        doc.setFontSize(10);
        doc.setFillColor("#cccccc");
        doc.rect(
            pos.audiogramme.left,
            pos.audiogramme.top + pos.audiogramme.cell.height,
            pos.audiogramme.width,
            pos.audiogramme.cell.height, 'F')
        doc.roundedRect(
            pos.audiogramme.left,
            pos.audiogramme.top,
            pos.audiogramme.width,
            pos.audiogramme.height,
            pos.audiogramme.borderRadius,
            pos.audiogramme.borderRadius)
        doc.text("AUDIOGRAMME OREILLE GAUCHE",
            pos.audiogramme.left + pos.audiogramme.width/2,
            pos.audiogramme.top + pos.audiogramme.cell.height - 4, 'center')
            doc.line(pos.audiogramme.left,
                pos.audiogramme.top + pos.audiogramme.cell.height,
                pos.audiogramme.left + pos.audiogramme.width,
                pos.audiogramme.top + pos.audiogramme.cell.height)
            doc.line(pos.audiogramme.left,
                pos.audiogramme.top + pos.audiogramme.cell.height * 2,
                pos.audiogramme.left + pos.audiogramme.width,
                pos.audiogramme.top + pos.audiogramme.cell.height * 2)

            doc.setFontSize(8);
            if(state.rapport.fields[0].data.type !== "16 000hz"){
                doc.text("Hertz",
                    pos.audiogramme.left + pos.audiogramme.width + 3,
                    pos.audiogramme.top + pos.audiogramme.cell.height * 2 - 8, 'left')
                doc.text("dBHL", pos.audiogramme.left + pos.audiogramme.width + 3,
                    pos.audiogramme.top + pos.audiogramme.cell.height * 2 + 6, 'left')
            }
            for(var i in freq){
                doc.text((freq[i] >= 10000)?freq[i].toString()[0]+""+freq[i].toString()[1]+"k":freq[i].toString(),
                pos.audiogramme.left + i * pos.audiogramme.cell.width + pos.audiogramme.cell.width,
                pos.audiogramme.top + pos.audiogramme.cell.height * 2 - 5, 'center')
            }
            doc.line(pos.audiogramme.left,
                pos.audiogramme.top + pos.audiogramme.cell.height * 3 - 1,
                pos.audiogramme.left + pos.audiogramme.width,
                pos.audiogramme.top + pos.audiogramme.cell.height * 3 - 1);
            doc.line(pos.audiogramme.left,
                pos.audiogramme.top + pos.audiogramme.cell.height * 3 + 1,
                pos.audiogramme.left + pos.audiogramme.width,
                pos.audiogramme.top + pos.audiogramme.cell.height * 3 + 1);
            if(state.rapport.fields[0].data.type !== "16 000hz"){
                for(i = 0; i <= 120; i = i + 10){
                    doc.text(i.toString(), pos.audiogramme.left + pos.audiogramme.width + 3,
                    pos.audiogramme.top + pos.audiogramme.cell.height * ((i/10) + 3) + 2, 'left')
                }
            }
            for(i = 0; i <= 120; i = i + 10){
                if(i === 0 || i === 120){
                    continue;
                }
                doc.line(
                    pos.audiogramme.left,
                    pos.audiogramme.top + pos.audiogramme.cell.height * ((i/10) + 3),
                    pos.audiogramme.left + pos.audiogramme.width,
                    pos.audiogramme.top + pos.audiogramme.cell.height * ((i/10) + 3))
                if(i === 20){
                    doc.setLineDash([2])
                    doc.line(
                        pos.audiogramme.left,
                        pos.audiogramme.top + pos.audiogramme.cell.height * ((i/10) + 3) + pos.audiogramme.cell.height/2,
                        pos.audiogramme.left + pos.audiogramme.width,
                        pos.audiogramme.top + pos.audiogramme.cell.height * ((i/10) + 3) + pos.audiogramme.cell.height/2)
                    doc.setLineDash()

                }
            }
            for(i in freq){
                if(i === 0){
                    doc.setDrawColor("#666666");
                    doc.setLineDash([2]);
                    doc.line(
                        pos.audiogramme.left + i * pos.audiogramme.cell.width + pos.audiogramme.cell.width - pos.audiogramme.cell.width/2,
                        pos.audiogramme.top + pos.audiogramme.cell.height*2,
                        pos.audiogramme.left + i * pos.audiogramme.cell.width + pos.audiogramme.cell.width - pos.audiogramme.cell.width/2,
                        pos.audiogramme.top + pos.audiogramme.height
                    );
                    doc.setLineDash();
                    doc.setDrawColor("#000000")
                }
                doc.line(
                    pos.audiogramme.left + i * pos.audiogramme.cell.width + pos.audiogramme.cell.width,
                    pos.audiogramme.top + pos.audiogramme.cell.height*2,
                    pos.audiogramme.left + i * pos.audiogramme.cell.width + pos.audiogramme.cell.width,
                    pos.audiogramme.top + pos.audiogramme.height
                )
                doc.setDrawColor("#666666")
                doc.setLineDash([2])
                doc.line(
                    pos.audiogramme.left + i * pos.audiogramme.cell.width + pos.audiogramme.cell.width + pos.audiogramme.cell.width/2,
                    pos.audiogramme.top + pos.audiogramme.cell.height*2,
                    pos.audiogramme.left + i * pos.audiogramme.cell.width + pos.audiogramme.cell.width + pos.audiogramme.cell.width/2,
                    pos.audiogramme.top + pos.audiogramme.height
                )
                doc.setLineDash()
                doc.setDrawColor("#000000")
            }
        }
        coord = null;
        coords = [[],[],[],[],[],[]]
        for(i in state.rapport.fields[0].data.gauche.data[6]){
            coords[0].push({
                ...state.rapport.fields[0].data.gauche.data[6][i],
                tool: 6
            })
        }
        for(i in state.rapport.fields[0].data.gauche.data[0]){
            coords[1].push({
                ...state.rapport.fields[0].data.gauche.data[0][i],
                tool: 0
            })
        }
        for(i in state.rapport.fields[0].data.gauche.data[1]){
            coords[1].push({
                ...state.rapport.fields[0].data.gauche.data[1][i],
                tool: 1
            })
        }
        coords[1].sort(function(a, b) {
            return a.freq - b.freq;
        })

        for(i in state.rapport.fields[0].data.gauche.data[2]){
            coords[2].push({
                ...state.rapport.fields[0].data.gauche.data[2][i],
                tool: 2
            })
        }


        for(i in state.rapport.fields[0].data.gauche.data[3]){
            coords[3].push({
                ...state.rapport.fields[0].data.gauche.data[3][i],
                tool: 3
            })
        }
        for(i in state.rapport.fields[0].data.gauche.data[4]){
            coords[3].push({
                ...state.rapport.fields[0].data.gauche.data[4][i],
                tool: 4
            })
        }
        coords[3].sort(function(a, b) {
            return a.freq - b.freq;
        })

        for(i in state.rapport.fields[0].data.gauche.data[5]){
            coords[4].push({
                ...state.rapport.fields[0].data.gauche.data[5][i],
                tool: 5
            })
        }
        for(i in state.rapport.fields[0].data.gauche.data[7]){
            coords[5].push({
                ...state.rapport.fields[0].data.gauche.data[7][i],
                tool: 7
            })
        }
        for(i in coords){
            let dataset = coords[i];
            let prevCoord = null;
            for(j in dataset){
                for(let h in allFreq){
                    for(let g = -10; g <= 120; g = g + 5){
                        if(dataset[j].freq == allFreq[h] && dataset[j].db == g){
                            coord = {
                                x:pos.audiogramme.left + pos.audiogramme.cell.width/2 + h * (pos.audiogramme.cell.width/2) - 7,
                                y:pos.audiogramme.top + (pos.audiogramme.cell.height*3) + (g/5) * (pos.audiogramme.cell.height/2) - 7,
                                nr: dataset[j].nr,
                                tool : dataset[j].tool
                            }
                            switch (dataset[j].tool){
                                case 0 :{
                                    if(coord.nr){
                                        doc.addImage(xNr, coord.x, coord.y, 14, 14);
                                    }else{
                                        doc.addImage(x, coord.x, coord.y, 14, 14);
                                    }
                                    break;
                                }
                                case 1 :{
                                    if(coord.nr){
                                        doc.addImage(carreNr, coord.x, coord.y, 14, 14);
                                    }else{
                                        doc.addImage(carre, coord.x, coord.y, 14, 14);
                                    }
                                    break;
                                }
                                case 2 :{
                                    doc.addImage(iBleu, coord.x, coord.y, 14, 14);
                                    break;
                                }
                                case 3 :{
                                    if(coord.nr){
                                        doc.addImage(flecheBleuNr, coord.x, coord.y, 14, 14);
                                    }else{
                                        doc.addImage(flecheBleu, coord.x, coord.y, 14, 14);
                                    }
                                    break;
                                }
                                case 4 :{
                                    if(coord.nr){
                                        doc.addImage(bracketBleuNr, coord.x, coord.y, 14, 14);
                                    }else{
                                        doc.addImage(bracketBleu, coord.x, coord.y, 14, 14);
                                    }
                                    break;
                                }
                                case 5 :{
                                    doc.addImage(etoileBleu, coord.x, coord.y, 14, 14);
                                    break;
                                }
                                case 6 :{
                                    doc.addImage(anterieur, coord.x, coord.y, 14, 14);
                                    break;
                                }
                            }

                            if(j!=0){
                                if(i == 1 && coord != null && prevCoord != null && !coord.nr && !prevCoord.nr){
                                    doc.setDrawColor("#5d6bb2")
                                    doc.setLineWidth(1)
                                    doc.line(prevCoord.x +7, prevCoord.y +7, coord.x +7, coord.y +7)
                                }else if(i == 5 && coord != null && prevCoord != null){
                                    doc.setDrawColor("#5d6bb2")
                                    doc.setLineWidth(1)
                                    doc.setLineDash([2])
                                    doc.line(prevCoord.x +7, prevCoord.y +7, coord.x +7, coord.y +7)
                                    doc.setLineDash()
                                }
                            }

                            prevCoord = coord;
                        }
                    }
                }
            }
        }
        doc.setDrawColor("#000000")
        doc.setLineWidth(0.5)



    //masking
    if(state.rapport.fields[0].data.type != "Champ Libre"){
        //droite
        freq = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8];
        if(state.rapport.fields[0].data.type == "16 000hz"){
            freq = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8, 9, 10, 11.25, 12.5, 14.25, 16];
            pos.masking.width = pos.audiogramme.width;
            pos.masking.gap = pos.audiogramme.gap;
            pos.masking.cell.width = pos.masking.width/16;
        }
        doc.text("MKG",
            pos.masking.left + pos.masking.width + pos.masking.gap/2,
            pos.masking.top + pos.masking.height/2 + 3, "center")
        doc.roundedRect(
            pos.masking.left,
            pos.masking.top,
            pos.masking.width,
            pos.masking.height,
            pos.masking.borderRadius,
            pos.masking.borderRadius
        )
        doc.line(
            pos.masking.left,
            pos.masking.top + pos.masking.cell.height,
            pos.masking.left + pos.masking.width,
            pos.masking.top + pos.masking.cell.height);
        doc.line(
            pos.masking.left,
            pos.masking.top + pos.masking.cell.height*2,
            pos.masking.left + pos.masking.width,
            pos.masking.top + pos.masking.cell.height*2);
        doc.text("C.A.",
            pos.masking.left - 3,
            pos.masking.top + pos.masking.cell.height - 4, "right")
        doc.text("C.O.",
            pos.masking.left - 3,
            pos.masking.top + pos.masking.cell.height*2 - 4, "right")
        for(i in freq){
            if(i%2 != 0){
                doc.text(freq[i].toString(),
                    pos.masking.left + pos.masking.cell.width * i + pos.masking.cell.width/2,
                    pos.masking.top + pos.masking.cell.height*3 - 3, "center" )
            }
            if(i == 0){
                continue
            }
            doc.line(
                pos.masking.left + pos.masking.cell.width * i,
                pos.masking.top,
                pos.masking.left + pos.masking.cell.width * i,
                pos.masking.top + pos.masking.height
            )
        }
        let value;
        for(i in freq){
            for(var j in state.rapport.fields[1].data.droite.aerienne){
                value = state.rapport.fields[1].data.droite.aerienne[j];
                if(value.freq == freq[i]){
                    doc.text(value.value,
                        pos.masking.left + pos.masking.cell.width * i + pos.masking.cell.width/2,
                        pos.masking.top + pos.masking.cell.height - 3, "center")
                    break;
                }
            }
            for(j in state.rapport.fields[1].data.droite.osseuse){
                value = state.rapport.fields[1].data.droite.osseuse[j];
                if(value.freq == freq[i]){
                    doc.text(value.value,
                        pos.masking.left + pos.masking.cell.width * i + pos.masking.cell.width/2,
                        pos.masking.top + pos.masking.cell.height*2 - 3, "center")
                    break;
                }
            }
        }

        //gauche
        pos.masking.left = pos.masking.left + pos.masking.width + pos.masking.gap
        doc.roundedRect(
            pos.masking.left,
            pos.masking.top,
            pos.masking.width,
            pos.masking.height,
            pos.masking.borderRadius,
            pos.masking.borderRadius
        )
        doc.line(
            pos.masking.left,
            pos.masking.top + pos.masking.cell.height,
            pos.masking.left + pos.masking.width,
            pos.masking.top + pos.masking.cell.height);
        doc.line(
            pos.masking.left,
            pos.masking.top + pos.masking.cell.height*2,
            pos.masking.left + pos.masking.width,
            pos.masking.top + pos.masking.cell.height*2);
        if(!state.rapport.fields[0].data.type == "16 000hz"){
            doc.text("C.A.",
                pos.masking.left + pos.masking.width + 3,
                pos.masking.top + pos.masking.cell.height - 4, "left")
            doc.text("C.O.",
                pos.masking.left + pos.masking.width + 3,
                pos.masking.top + pos.masking.cell.height*2 - 4, "left")
        }
        for(i in freq){
            if(i%2 != 0){
                doc.text(freq[i].toString(),
                    pos.masking.left + pos.masking.cell.width * i + pos.masking.cell.width/2,
                    pos.masking.top + pos.masking.cell.height*3 - 3, "center" )
            }
            if(i == 0){
                continue
            }
            doc.line(
                pos.masking.left + pos.masking.cell.width * i,
                pos.masking.top,
                pos.masking.left + pos.masking.cell.width * i,
                pos.masking.top + pos.masking.height
            )
        }

        value = null;
        for(i in freq){
            for(var j in state.rapport.fields[1].data.gauche.aerienne){
                value = state.rapport.fields[1].data.gauche.aerienne[j];
                if(value.freq == freq[i]){
                    doc.text(value.value,
                        pos.masking.left + pos.masking.cell.width * i + pos.masking.cell.width/2,
                        pos.masking.top + pos.masking.cell.height - 3, "center")
                    break;
                }
            }
            for(j in state.rapport.fields[1].data.gauche.osseuse){
                value = state.rapport.fields[1].data.gauche.osseuse[j];
                if(value.freq == freq[i]){
                    doc.text(value.value,
                        pos.masking.left + pos.masking.cell.width * i + pos.masking.cell.width/2,
                        pos.masking.top + pos.masking.cell.height*2 - 3, "center")
                    break;
                }
            }
        }
    }

    //Champ Libre Emission oto-acoustique
    if(state.rapport.fields[0].data.type == "Champ Libre"){
        var eoa = {
            height: pos.audiogramme.height,
            width: 120,
            center: pos.audiogramme.left + pos.audiogramme.width + pos.audiogramme.gap + 50,
            top: pos.audiogramme.top
        }
        eoa = {
            ...eoa,
            cell: {
                height: eoa.height/15,
                width: 60
            }
        }
        doc.setFillColor("#cccccc")
        doc.rect(
            eoa.center - eoa.width/2,
            eoa.top + eoa.cell.height,
            eoa.width,
            eoa.cell.height,
            "F"
        )
        doc.rect(
            eoa.center - eoa.width/2,
            eoa.top,
            eoa.width,
            eoa.height
        )
        doc.text("ÉMISSION OTO-ACOUSTIQUE",
            eoa.center,
            eoa.top + eoa.cell.height - 3, "center")
        doc.line(
            eoa.center,
            eoa.top + eoa.cell.height,
            eoa.center,
            eoa.top + eoa.height
        )
        doc.text("DROITE",
            eoa.center - eoa.cell.width/2,
            eoa.top + eoa.cell.height*2 - 3, "center")
        doc.text("GAUCHE",
            eoa.center + eoa.cell.width/2,
            eoa.top + eoa.cell.height*2 - 3,"center")
        doc.line(
            eoa.center - eoa.cell.width,
            eoa.top + eoa.cell.height,
            eoa.center + eoa.cell.width,
            eoa.top + eoa.cell.height
        )
        var i = 0;
        for(let key in state.rapport.fields[5].data.freq.droite){
            doc.text(key.toString() + "hz",
                eoa.center - eoa.cell.width - 2,
                eoa.top + eoa.cell.height*3 + eoa.cell.height*i - 3, "right"
            )
            doc.line(
                eoa.center - eoa.cell.width,
                eoa.top + eoa.cell.height*2 + eoa.cell.height*i,
                eoa.center + eoa.cell.width,
                eoa.top + eoa.cell.height*2 + eoa.cell.height*i
            )
            doc.text(state.rapport.fields[5].data.freq.droite[key],
                eoa.center - eoa.cell.width/2,
                eoa.top + eoa.cell.height*3 + eoa.cell.height*i - 3, "center"
            )
            doc.text(state.rapport.fields[5].data.freq.gauche[key],
                eoa.center + eoa.cell.width/2,
                eoa.top + eoa.cell.height*3 + eoa.cell.height*i - 3, "center"
            )
            i++
        }

        pos.audiometrie.top -= 20;
        pos.tympanometrie.top += 30;

        pos.audiometrie.width -= pos.audiometrie.cell.width;
        pos.audiometrie.gap = pos.audiogramme.width*2 + pos.audiogramme.gap - pos.audiometrie.width*2 + 38;
        pos.audiometrie.cell = {
            height: pos.audiometrie.height/5,
            width: pos.audiometrie.width/5
        }

        pos.tympanometrie.width -= pos.tympanometrie.cell.width;
        pos.tympanometrie.gap = pos.audiogramme.width*2 + pos.audiogramme.gap - pos.tympanometrie.width*2 + 38;
        pos.tympanometrie.cell = {
            height: pos.tympanometrie.height,
            width: pos.tympanometrie.width/3
        }

        // Extra checkbox fields ////////////////////////////////////////////////////////
        pos.champLibre = {
            top : pos.audiogramme.top - 10,
            left : eoa.center + eoa.width/2 + 15,
            conditionnement: 70,
            transducteur: 130,
            collaboration: 190
        }
        doc.setFontSize(9);
        doc.text("Stimuli",
            pos.champLibre.left,
            pos.champLibre.top
        )
        doc.text("Conditionnement",
            pos.champLibre.left,
            pos.champLibre.top + pos.champLibre.conditionnement
        )
        doc.text("Transducteur",
            pos.champLibre.left,
            pos.champLibre.top + pos.champLibre.transducteur
        )
        doc.text("Collaboration",
            pos.champLibre.left,
            pos.champLibre.top + pos.champLibre.collaboration
        )

        doc.setFontSize(8)
        let keys = ["Sons purs", "Sons hululés", "Sons pulsés", "Bruit de bande étroite"];
        let values = [
            state.rapport.fields[1].data.champLibre.stimuli.sonsPurs,
            state.rapport.fields[1].data.champLibre.stimuli.sonsHulliles,
            state.rapport.fields[1].data.champLibre.stimuli.sonsPulses,
            state.rapport.fields[1].data.champLibre.stimuli.brf
        ]
        for(i in keys){
            doc.rect(
                pos.champLibre.left,
                pos.champLibre.top + 10 +12*i,
                pos.checkbox.width,
                pos.checkbox.height
            )
            doc.text(keys[i],
                pos.champLibre.left + pos.checkbox.width + pos.checkbox.gap,
                pos.champLibre.top + 10 +7 + 12*i
            )
            if(values[i]){
                doc.addImage(check, "png",
                    pos.champLibre.left +2,
                    pos.champLibre.top + 10 -2 + 12*i,
                    pos.checkbox.width +1,
                    pos.checkbox.height +1
                )
            }
        }


        keys = ["Visuel", "Jeu", "Réponse motrices"];
        values = [
            state.rapport.fields[1].data.champLibre.conditionnement.visuel,
            state.rapport.fields[1].data.champLibre.conditionnement.jeu,
            state.rapport.fields[1].data.champLibre.conditionnement.reponsesMotrices
        ]
        for(i in keys){
            doc.rect(
                pos.champLibre.left,
                pos.champLibre.top + pos.champLibre.conditionnement + 10 +12*i,
                pos.checkbox.width,
                pos.checkbox.height
            )
            doc.text(keys[i],
                pos.champLibre.left + pos.checkbox.width + pos.checkbox.gap,
                pos.champLibre.top + pos.champLibre.conditionnement + 10 +7 + 12*i
            )
            if(values[i]){
                doc.addImage(check, "png",
                    pos.champLibre.left +2,
                    pos.champLibre.top + pos.champLibre.conditionnement + 10 -2 + 12*i,
                    pos.checkbox.width +1,
                    pos.checkbox.height +1
                )
            }
        }


        keys = ["Intra-auriculaire","Supra-auriculaire","Champ Libre"];
        values = [
            state.rapport.fields[6].data.transducteur.intra,
            state.rapport.fields[6].data.transducteur.supra,
            state.rapport.fields[6].data.transducteur.champLibre,
        ]
        for(i in keys){
            doc.rect(
                pos.champLibre.left,
                pos.champLibre.top + pos.champLibre.transducteur + 10 +12*i,
                pos.checkbox.width,
                pos.checkbox.height
            )
            doc.text(keys[i],
                pos.champLibre.left + pos.checkbox.width + pos.checkbox.gap,
                pos.champLibre.top + pos.champLibre.transducteur + 10 +7 + 12*i
            )
            if(values[i]){
                doc.addImage(check, "png",
                    pos.champLibre.left +2,
                    pos.champLibre.top + pos.champLibre.transducteur + 10 -2 + 12*i,
                    pos.checkbox.width +1,
                    pos.checkbox.height +1
                )
            }
        }


        keys = ["Bonne", "Autre"];
        values = state.rapport.fields[1].data.champLibre.collaboration
        for(i in keys){
            doc.rect(
                pos.champLibre.left,
                pos.champLibre.top + pos.champLibre.collaboration + 10 +12*i,
                pos.checkbox.width,
                pos.checkbox.height
            )
            if(values == "Autre" && keys[i] == "Autre"){
                doc.fromHTML("<div style='font-size:8pt;margin: 0;font-family:sans-serif'>"+state.rapport.fields[1].data.champLibre.collaborationAutre+"</div>",
                pos.champLibre.left + pos.checkbox.width + pos.checkbox.gap,
                pos.champLibre.top + pos.champLibre.collaboration + 5 + 12*i,
                    {
                        'width': 80
                     }
                )
            }else{
                doc.text(keys[i],
                    pos.champLibre.left + pos.checkbox.width + pos.checkbox.gap,
                    pos.champLibre.top + pos.champLibre.collaboration + 10 +7 + 12*i
                )
            }
            if(values == keys[i]){
                doc.addImage(check, "png",
                    pos.champLibre.left +2,
                    pos.champLibre.top + pos.champLibre.collaboration + 10 -2 + 12*i,
                    pos.checkbox.width +1,
                    pos.checkbox.height +1
                )
            }
        }





    }


    //audiometrie
    doc.text("OREILLE DROITE",
        pos.audiometrie.left + pos.audiometrie.width/2,
        pos.audiometrie.top - 5, "center")
    doc.setFillColor("#cccccc")
    if(state.rapport.fields[0].data.type != "Champ Libre"){
        doc.rect(
            pos.audiometrie.left + pos.audiometrie.cell.width*4,
            pos.audiometrie.top + pos.audiometrie.cell.height,
            pos.audiometrie.cell.width * 2,
            pos.audiometrie.cell.height, "F")
        doc.rect(
            pos.audiometrie.left + pos.audiometrie.cell.width*4,
            pos.audiometrie.top + pos.audiometrie.cell.height*3,
            pos.audiometrie.cell.width * 2,
            pos.audiometrie.cell.height, "F")
        doc.rect(
            pos.audiometrie.left,
            pos.audiometrie.top,
            pos.audiometrie.cell.width * 4,
            pos.audiometrie.cell.height, "F")
        doc.rect(
            pos.audiometrie.left + pos.audiometrie.cell.width*4,
            pos.audiometrie.top + pos.audiometrie.cell.height,
            pos.audiometrie.cell.width * 2,
            pos.audiometrie.cell.height * 4
        )
        doc.rect(
            pos.audiometrie.left,
            pos.audiometrie.top,
            pos.audiometrie.cell.width * 4,
            pos.audiometrie.height
        )
    }else{
        doc.rect(
            pos.audiometrie.left + pos.audiometrie.cell.width*3,
            pos.audiometrie.top + pos.audiometrie.cell.height,
            pos.audiometrie.cell.width * 2,
            pos.audiometrie.cell.height, "F")
        doc.rect(
            pos.audiometrie.left + pos.audiometrie.cell.width*3,
            pos.audiometrie.top + pos.audiometrie.cell.height*3,
            pos.audiometrie.cell.width * 2,
            pos.audiometrie.cell.height, "F")
        doc.rect(
            pos.audiometrie.left,
            pos.audiometrie.top,
            pos.audiometrie.cell.width * 3,
            pos.audiometrie.cell.height, "F")
        doc.rect(
            pos.audiometrie.left + pos.audiometrie.cell.width*3,
            pos.audiometrie.top + pos.audiometrie.cell.height,
            pos.audiometrie.cell.width * 2,
            pos.audiometrie.cell.height * 4
        )
        doc.rect(
            pos.audiometrie.left,
            pos.audiometrie.top,
            pos.audiometrie.cell.width * 3,
            pos.audiometrie.height
        )
    }
    doc.line(
        pos.audiometrie.left + pos.audiometrie.cell.width,
        pos.audiometrie.top + pos.audiometrie.cell.height,
        pos.audiometrie.left + pos.audiometrie.cell.width,
        pos.audiometrie.top + pos.audiometrie.height
    )
    doc.line(
        pos.audiometrie.left + pos.audiometrie.cell.width*2,
        pos.audiometrie.top + pos.audiometrie.cell.height,
        pos.audiometrie.left + pos.audiometrie.cell.width*2,
        pos.audiometrie.top + pos.audiometrie.height
    )
    if(state.rapport.fields[0].data.type != "Champ Libre"){
        doc.line(
            pos.audiometrie.left + pos.audiometrie.cell.width*3,
            pos.audiometrie.top + pos.audiometrie.cell.height,
            pos.audiometrie.left + pos.audiometrie.cell.width*3,
            pos.audiometrie.top + pos.audiometrie.height
        )
        doc.line(
            pos.audiometrie.left + pos.audiometrie.cell.width*5,
            pos.audiometrie.top + pos.audiometrie.cell.height,
            pos.audiometrie.left + pos.audiometrie.cell.width*5,
            pos.audiometrie.top + pos.audiometrie.height
        )
        doc.line(
            pos.audiometrie.left,
            pos.audiometrie.top + pos.audiometrie.cell.height,
            pos.audiometrie.left + pos.audiometrie.cell.width*4,
            pos.audiometrie.top + pos.audiometrie.cell.height
        )
    }else{
        doc.line(
            pos.audiometrie.left + pos.audiometrie.cell.width*4,
            pos.audiometrie.top + pos.audiometrie.cell.height,
            pos.audiometrie.left + pos.audiometrie.cell.width*4,
            pos.audiometrie.top + pos.audiometrie.height
        )
        doc.line(
            pos.audiometrie.left,
            pos.audiometrie.top + pos.audiometrie.cell.height,
            pos.audiometrie.left + pos.audiometrie.cell.width*3,
            pos.audiometrie.top + pos.audiometrie.cell.height
        )
    }
    doc.line(
        pos.audiometrie.left,
        pos.audiometrie.top + pos.audiometrie.cell.height*2,
        pos.audiometrie.left + pos.audiometrie.width,
        pos.audiometrie.top + pos.audiometrie.cell.height*2
    )
    doc.line(
        pos.audiometrie.left,
        pos.audiometrie.top + pos.audiometrie.cell.height*3,
        pos.audiometrie.left + pos.audiometrie.width,
        pos.audiometrie.top + pos.audiometrie.cell.height*3
    )
    doc.line(
        pos.audiometrie.left,
        pos.audiometrie.top + pos.audiometrie.cell.height*4,
        pos.audiometrie.left + pos.audiometrie.width,
        pos.audiometrie.top + pos.audiometrie.cell.height*4
    )
    doc.setFontSize(8)
    if(state.rapport.fields[0].data.type != "Champ Libre"){
        doc.text("MSP 3",
            pos.audiometrie.left + pos.audiometrie.cell.width*4.5,
            pos.audiometrie.top + pos.audiometrie.cell.height * 2 - 3, "center")
        doc.text("MSP 4",
            pos.audiometrie.left + pos.audiometrie.cell.width*4.5,
            pos.audiometrie.top + pos.audiometrie.cell.height * 4 - 2, "center")
        doc.text("SRP",
            pos.audiometrie.left + pos.audiometrie.cell.width*5.5,
            pos.audiometrie.top + pos.audiometrie.cell.height * 2 - 3, "center")
        if(!state.rapport.fields[4].data.ndc){
            doc.text("SDP",
                pos.audiometrie.left + pos.audiometrie.cell.width*5.5,
                pos.audiometrie.top + pos.audiometrie.cell.height * 4 - 2, "center")
        }else{
            doc.text("NDC",
                pos.audiometrie.left + pos.audiometrie.cell.width*5.5,
                pos.audiometrie.top + pos.audiometrie.cell.height * 4 - 2, "center")
        }
        doc.setTextColor('#f15c5d');
        doc.setFontStyle('bold');
        doc.text(state.rapport.fields[4].data.droite.msp.freq3,
            pos.audiometrie.left + pos.audiometrie.cell.width*5 - 14,
            pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, 'right')
        doc.text(state.rapport.fields[4].data.droite.msp.freq4,
            pos.audiometrie.left + pos.audiometrie.cell.width*5 - 14,
            pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, 'right')
        doc.text(state.rapport.fields[4].data.droite.srp,
            pos.audiometrie.left + pos.audiometrie.cell.width*6 - 14,
            pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, 'right')
        if(!state.rapport.fields[4].data.ndc){
            doc.text(state.rapport.fields[4].data.droite.sdp,
                pos.audiometrie.left + pos.audiometrie.cell.width*6 - 14,
                pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, 'right')
        }else{
            doc.text(state.rapport.fields[4].data.droite.ndc,
                pos.audiometrie.left + pos.audiometrie.cell.width*6 - 14,
                pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, 'right')
        }
    }else{
        doc.text("MSP 3",
            pos.audiometrie.left + pos.audiometrie.cell.width*3.5,
            pos.audiometrie.top + pos.audiometrie.cell.height * 2 - 3, "center")
        doc.text("MSP 4",
            pos.audiometrie.left + pos.audiometrie.cell.width*3.5,
            pos.audiometrie.top + pos.audiometrie.cell.height * 4 - 2, "center")
        doc.text("SRP",
            pos.audiometrie.left + pos.audiometrie.cell.width*4.5,
            pos.audiometrie.top + pos.audiometrie.cell.height * 2 - 3, "center")
        if(!state.rapport.fields[4].data.ndc){
            doc.text("SDP",
                pos.audiometrie.left + pos.audiometrie.cell.width*4.5,
                pos.audiometrie.top + pos.audiometrie.cell.height * 4 - 2, "center")
        }else{
            doc.text("NDC",
                pos.audiometrie.left + pos.audiometrie.cell.width*4.5,
                pos.audiometrie.top + pos.audiometrie.cell.height * 4 - 2, "center")
        }
        doc.setTextColor('#f15c5d');
        doc.setFontStyle('bold');
        doc.text(state.rapport.fields[4].data.droite.msp.freq3,
            pos.audiometrie.left + pos.audiometrie.cell.width*4 - 14,
            pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, 'right')
        doc.text(state.rapport.fields[4].data.droite.msp.freq4,
            pos.audiometrie.left + pos.audiometrie.cell.width*4 - 14,
            pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, 'right')
        doc.text(state.rapport.fields[4].data.droite.srp,
            pos.audiometrie.left + pos.audiometrie.cell.width*5 - 14,
            pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, 'right')
        if(!state.rapport.fields[4].data.ndc){
            doc.text(state.rapport.fields[4].data.droite.sdp,
                pos.audiometrie.left + pos.audiometrie.cell.width*5 - 14,
                pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, 'right')
        }else{
            doc.text(state.rapport.fields[4].data.droite.ndc,
                pos.audiometrie.left + pos.audiometrie.cell.width*5 - 14,
                pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, 'right')
        }
    }
    doc.setTextColor('#000000');
    doc.setFontStyle('normal');
    doc.text("Identification",
        pos.audiometrie.left + pos.audiometrie.cell.width*2,
        pos.audiometrie.top + pos.audiometrie.cell.height - 2, "center")
    doc.text("Résultat",
        pos.audiometrie.left + pos.audiometrie.cell.width*0.5,
        pos.audiometrie.top + pos.audiometrie.cell.height*3 - 3, "center")
    doc.text("Niveau",
        pos.audiometrie.left + pos.audiometrie.cell.width*0.5,
        pos.audiometrie.top + pos.audiometrie.cell.height*4 - 3, "center")
    doc.text("Masking",
        pos.audiometrie.left + pos.audiometrie.cell.width*0.5,
        pos.audiometrie.top + pos.audiometrie.cell.height*5 - 3, "center")
    doc.text("Mono",
        pos.audiometrie.left + pos.audiometrie.cell.width*1.5,
        pos.audiometrie.top + pos.audiometrie.cell.height*2 - 3, "center")
    if(state.rapport.fields[0].data.type != "Champ Libre"){
        doc.text("Mono",
            pos.audiometrie.left + pos.audiometrie.cell.width*2.5,
            pos.audiometrie.top + pos.audiometrie.cell.height*2 - 3, "center")
        doc.text("Binaural",
            pos.audiometrie.left + pos.audiometrie.cell.width*3.5,
            pos.audiometrie.top + pos.audiometrie.cell.height*2 - 3, "center")
    }else{
        doc.text("Binaural",
            pos.audiometrie.left + pos.audiometrie.cell.width*2.5,
            pos.audiometrie.top + pos.audiometrie.cell.height*2 - 3, "center")
    }
    doc.setTextColor('#f15c5d');
    doc.setFontStyle('bold');
    doc.text(state.rapport.fields[4].data.droite.identification.premier.resultat,
        pos.audiometrie.left + pos.audiometrie.cell.width*2 - 14,
        pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, 'right')
    doc.text(state.rapport.fields[4].data.droite.identification.premier.niveau,
        pos.audiometrie.left + pos.audiometrie.cell.width*2 - 14,
        pos.audiometrie.top + pos.audiometrie.cell.height*4 - 2, 'right')
    doc.text(state.rapport.fields[4].data.droite.identification.premier.masking,
        pos.audiometrie.left + pos.audiometrie.cell.width*2 - 14,
        pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, 'right')
    if(state.rapport.fields[0].data.type != "Champ Libre"){
        doc.text(state.rapport.fields[4].data.droite.identification.deuxieme.resultat,
            pos.audiometrie.left + pos.audiometrie.cell.width*3 - 14,
            pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, 'right')
        doc.text(state.rapport.fields[4].data.droite.identification.deuxieme.niveau,
            pos.audiometrie.left + pos.audiometrie.cell.width*3 - 14,
            pos.audiometrie.top + pos.audiometrie.cell.height*4 - 2, 'right')
        doc.text(state.rapport.fields[4].data.droite.identification.deuxieme.masking,
            pos.audiometrie.left + pos.audiometrie.cell.width*3 - 14,
            pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, 'right')
    }
    if(state.rapport.fields[4].data.binaural){
        if(state.rapport.fields[0].data.type != "Champ Libre"){
            doc.text(state.rapport.fields[4].data.both.resultat,
                pos.audiometrie.left + pos.audiometrie.cell.width*4 - 14,
                pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, 'right')
            doc.text(state.rapport.fields[4].data.both.niveau,
                pos.audiometrie.left + pos.audiometrie.cell.width*4 - 14,
                pos.audiometrie.top + pos.audiometrie.cell.height*4 - 2, 'right')
            doc.text(state.rapport.fields[4].data.both.masking,
                pos.audiometrie.left + pos.audiometrie.cell.width*4 - 14,
                pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, 'right')
        }else{
            doc.text(state.rapport.fields[4].data.both.resultat,
                pos.audiometrie.left + pos.audiometrie.cell.width*3 - 14,
                pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, 'right')
            doc.text(state.rapport.fields[4].data.both.niveau,
                pos.audiometrie.left + pos.audiometrie.cell.width*3 - 14,
                pos.audiometrie.top + pos.audiometrie.cell.height*4 - 2, 'right')
            doc.text(state.rapport.fields[4].data.both.masking,
                pos.audiometrie.left + pos.audiometrie.cell.width*3 - 14,
                pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, 'right')
        }
    }
    doc.setTextColor('#000000');
    doc.setFontStyle('normal');
    doc.setFontSize(5)
    doc.text("dBHL",
        pos.audiometrie.left + pos.audiometrie.cell.width*5 - 1,
        pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, "right")
    doc.text("dBHL",
        pos.audiometrie.left + pos.audiometrie.cell.width*5 - 1,
        pos.audiometrie.top + pos.audiometrie.height - 2, "right")
    if(state.rapport.fields[0].data.type != "Champ Libre"){
        doc.text("dBHL",
            pos.audiometrie.left + pos.audiometrie.cell.width*6 - 1,
            pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, "right")
        doc.text("dBHL",
            pos.audiometrie.left + pos.audiometrie.cell.width*6 - 1,
            pos.audiometrie.top + pos.audiometrie.height - 2, "right")
    }else{
        doc.text("dBHL",
            pos.audiometrie.left + pos.audiometrie.cell.width*4 - 1,
            pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, "right")
        doc.text("dBHL",
            pos.audiometrie.left + pos.audiometrie.cell.width*4 - 1,
            pos.audiometrie.top + pos.audiometrie.height - 2, "right")
    }
    doc.text("%",
        pos.audiometrie.left + pos.audiometrie.cell.width*2 - 1,
        pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, "right")
    doc.text("%",
        pos.audiometrie.left + pos.audiometrie.cell.width*3 - 1,
        pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, "right")
    if(state.rapport.fields[0].data.type != "Champ Libre"){
        doc.text("%",
            pos.audiometrie.left + pos.audiometrie.cell.width*4 - 1,
            pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, "right")
    }
    doc.text("dBHL",
        pos.audiometrie.left + pos.audiometrie.cell.width*2 - 1,
        pos.audiometrie.top + pos.audiometrie.cell.height*4 - 2, "right")
    doc.text("dBHL",
        pos.audiometrie.left + pos.audiometrie.cell.width*3 - 1,
        pos.audiometrie.top + pos.audiometrie.cell.height*4 - 2, "right")
    if(state.rapport.fields[0].data.type != "Champ Libre"){
        doc.text("dBHL",
            pos.audiometrie.left + pos.audiometrie.cell.width*4 - 1,
            pos.audiometrie.top + pos.audiometrie.cell.height*4 - 2, "right")
    }
    doc.text("dBHL",
        pos.audiometrie.left + pos.audiometrie.cell.width*2 - 1,
        pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, "right")
    doc.text("dBHL",
        pos.audiometrie.left + pos.audiometrie.cell.width*3 - 1,
        pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, "right")
    if(state.rapport.fields[0].data.type != "Champ Libre"){
        doc.text("dBHL",
            pos.audiometrie.left + pos.audiometrie.cell.width*4 - 1,
            pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, "right")
    }
    doc.setFontSize(8)




    doc.setFontStyle("bold")
    doc.text("AUDIOMÉTRIE VOCALE",
        pos.audiometrie.left + pos.audiometrie.width + pos.audiometrie.gap/2,
        pos.audiometrie.top -1, "center")
    doc.setFontStyle("normal")


    if(state.rapport.fields[0].data.type == "Champ Libre"){
        doc.rect(
            pos.audiometrie.left + pos.audiometrie.width + 3,
            pos.audiometrie.top + 5,
            pos.checkbox.width,
            pos.checkbox.height
        )
        doc.text("Matériel\nEnregistré",
            pos.audiometrie.left + pos.audiometrie.width + 2 + pos.checkbox.width + pos.checkbox.gap,
            pos.audiometrie.top + 11
        )
        if(state.rapport.fields[4].data.materielEnregistre){
            doc.addImage(check, "png",
                pos.audiometrie.left + pos.audiometrie.width + 3 +2,
                pos.audiometrie.top + 20 -17,
                pos.checkbox.width +1,
                pos.checkbox.height +1
            )
        }
        doc.setFontStyle('bold');
        doc.text("Langue : ",
            pos.audiometrie.left + pos.audiometrie.width + 4 + pos.checkbox.width + pos.checkbox.gap + 75,
            pos.audiometrie.top + 7,
            "center"
        )
        doc.setFontStyle('normal');
        doc.text(state.rapport.fields[4].data.langue,
            pos.audiometrie.left + pos.audiometrie.width + 4 + pos.checkbox.width + pos.checkbox.gap + 75,
            pos.audiometrie.top + 17,
            "center"
        )
        doc.setFontStyle('bold');
        doc.text("Liste utilisée :",
            pos.audiometrie.left + pos.audiometrie.width + pos.audiometrie.gap/2,
            pos.audiometrie.top + 32,
            "right"
        )
        doc.setFontStyle('normal');
        doc.text(state.rapport.fields[4].data.liste,
            pos.audiometrie.left + pos.audiometrie.width + pos.audiometrie.gap/2 +2,
            pos.audiometrie.top + 32,
            "left"
        )
    }else{
        doc.rect(
            pos.audiometrie.left + pos.audiometrie.width + 3,
            pos.audiometrie.top + 15,
            pos.checkbox.width,
            pos.checkbox.height
        )
        doc.text("Matériel\nEnregistré",
            pos.audiometrie.left + pos.audiometrie.width + 2 + pos.checkbox.width + pos.checkbox.gap,
            pos.audiometrie.top + 21
        )
        if(state.rapport.fields[4].data.materielEnregistre){
            doc.addImage(check, "png",
                pos.audiometrie.left + pos.audiometrie.width + 3 +2,
                pos.audiometrie.top + 20 -7,
                pos.checkbox.width +1,
                pos.checkbox.height +1
            )
        }
        doc.setFontStyle('bold');
        doc.text("Langue : ",
            pos.audiometrie.left + pos.audiometrie.width + pos.audiometrie.gap/2,
            pos.audiometrie.top + 8,
            "right"
        )
        doc.setFontStyle('normal');
        doc.text(state.rapport.fields[4].data.langue,
            pos.audiometrie.left + pos.audiometrie.width + pos.audiometrie.gap/2,
            pos.audiometrie.top + 8,
            "left"
        )
    }

    doc.rect(
        pos.audiometrie.left + pos.audiometrie.width + 3,
        pos.audiometrie.top + 40,
        pos.checkbox.width,
        pos.checkbox.height
    )
    doc.text("Identification\nd'images",
        pos.audiometrie.left + pos.audiometrie.width + 2 + pos.checkbox.width + pos.checkbox.gap,
        pos.audiometrie.top + 46
    )
    if(state.rapport.fields[4].data.identificationImages){
        doc.addImage(check, "png",
            pos.audiometrie.left + pos.audiometrie.width + 3 +2,
            pos.audiometrie.top + 45 -7,
            pos.checkbox.width +1,
            pos.checkbox.height +1
        )
    }


    pos.audiometrie.left = pos.audiometrie.left + pos.audiometrie.width + pos.audiometrie.gap
    doc.text("OREILLE GAUCHE",
        pos.audiometrie.left + pos.audiometrie.width/2,
        pos.audiometrie.top - 5, "center")
    doc.setFillColor("#cccccc")
    doc.rect(
        pos.audiometrie.left,
        pos.audiometrie.top + pos.audiometrie.cell.height,
        pos.audiometrie.cell.width * 2,
        pos.audiometrie.cell.height, "F")
    doc.rect(
        pos.audiometrie.left,
        pos.audiometrie.top + pos.audiometrie.cell.height*3,
        pos.audiometrie.cell.width * 2,
        pos.audiometrie.cell.height, "F")
    if(state.rapport.fields[0].data.type != "Champ Libre"){
        doc.rect(
            pos.audiometrie.left + pos.audiometrie.cell.width * 2,
            pos.audiometrie.top,
            pos.audiometrie.cell.width * 4,
            pos.audiometrie.cell.height, "F")
        doc.rect(
            pos.audiometrie.left + pos.audiometrie.cell.width * 2,
            pos.audiometrie.top,
            pos.audiometrie.cell.width * 4,
            pos.audiometrie.height
        )
    }else{
        doc.rect(
            pos.audiometrie.left + pos.audiometrie.cell.width * 2,
            pos.audiometrie.top,
            pos.audiometrie.cell.width * 3,
            pos.audiometrie.cell.height, "F")
        doc.rect(
            pos.audiometrie.left + pos.audiometrie.cell.width * 2,
            pos.audiometrie.top,
            pos.audiometrie.cell.width * 3,
            pos.audiometrie.height
        )
    }
    doc.rect(
        pos.audiometrie.left,
        pos.audiometrie.top + pos.audiometrie.cell.height,
        pos.audiometrie.cell.width * 2,
        pos.audiometrie.cell.height * 4
    )
    doc.line(
        pos.audiometrie.left + pos.audiometrie.cell.width,
        pos.audiometrie.top + pos.audiometrie.cell.height,
        pos.audiometrie.left + pos.audiometrie.cell.width,
        pos.audiometrie.top + pos.audiometrie.height
    )
    doc.line(
        pos.audiometrie.left + pos.audiometrie.cell.width*3,
        pos.audiometrie.top + pos.audiometrie.cell.height,
        pos.audiometrie.left + pos.audiometrie.cell.width*3,
        pos.audiometrie.top + pos.audiometrie.height
    )
    doc.line(
        pos.audiometrie.left + pos.audiometrie.cell.width*4,
        pos.audiometrie.top + pos.audiometrie.cell.height,
        pos.audiometrie.left + pos.audiometrie.cell.width*4,
        pos.audiometrie.top + pos.audiometrie.height
    )
    if(state.rapport.fields[0].data.type != "Champ Libre"){
        doc.line(
            pos.audiometrie.left + pos.audiometrie.cell.width*5,
            pos.audiometrie.top + pos.audiometrie.cell.height,
            pos.audiometrie.left + pos.audiometrie.cell.width*5,
            pos.audiometrie.top + pos.audiometrie.height
        )
    }
    doc.line(
        pos.audiometrie.left + pos.audiometrie.cell.width * 2 ,
        pos.audiometrie.top + pos.audiometrie.cell.height,
        pos.audiometrie.left + pos.audiometrie.width,
        pos.audiometrie.top + pos.audiometrie.cell.height
    )
    doc.line(
        pos.audiometrie.left,
        pos.audiometrie.top + pos.audiometrie.cell.height*2,
        pos.audiometrie.left + pos.audiometrie.width,
        pos.audiometrie.top + pos.audiometrie.cell.height*2
    )
    doc.line(
        pos.audiometrie.left,
        pos.audiometrie.top + pos.audiometrie.cell.height*3,
        pos.audiometrie.left + pos.audiometrie.width,
        pos.audiometrie.top + pos.audiometrie.cell.height*3
    )
    doc.line(
        pos.audiometrie.left,
        pos.audiometrie.top + pos.audiometrie.cell.height*4,
        pos.audiometrie.left + pos.audiometrie.width,
        pos.audiometrie.top + pos.audiometrie.cell.height*4
    )
    doc.setFontSize(8)
    doc.text("MSP 3",
        pos.audiometrie.left + pos.audiometrie.cell.width/2,
        pos.audiometrie.top + pos.audiometrie.cell.height * 2 - 3, "center")
    doc.text("MSP 4",
        pos.audiometrie.left + pos.audiometrie.cell.width/2,
        pos.audiometrie.top + pos.audiometrie.cell.height * 4 - 2, "center")
    doc.text("SRP",
        pos.audiometrie.left + pos.audiometrie.cell.width*1.5,
        pos.audiometrie.top + pos.audiometrie.cell.height * 2 - 3, "center")
    if(!state.rapport.fields[4].data.ndc){
        doc.text("SDP",
            pos.audiometrie.left + pos.audiometrie.cell.width*1.5,
            pos.audiometrie.top + pos.audiometrie.cell.height * 4 - 2, "center")
    }else{
        doc.text("NDC",
            pos.audiometrie.left + pos.audiometrie.cell.width*1.5,
            pos.audiometrie.top + pos.audiometrie.cell.height * 4 - 2, "center")
    }
    doc.setTextColor('#5d6bb2');
    doc.setFontStyle('bold');
    doc.text(state.rapport.fields[4].data.gauche.msp.freq3,
        pos.audiometrie.left + pos.audiometrie.cell.width - 14,
        pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, 'right')
    doc.text(state.rapport.fields[4].data.gauche.msp.freq4,
        pos.audiometrie.left + pos.audiometrie.cell.width - 14,
        pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, 'right')
    doc.text(state.rapport.fields[4].data.gauche.srp,
        pos.audiometrie.left + pos.audiometrie.cell.width*2 - 14,
        pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, 'right')
    if(!state.rapport.fields[4].data.ndc){
        doc.text(state.rapport.fields[4].data.gauche.sdp,
            pos.audiometrie.left + pos.audiometrie.cell.width*2 - 14,
            pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, 'right')
    }else{
        doc.text(state.rapport.fields[4].data.gauche.ndc,
            pos.audiometrie.left + pos.audiometrie.cell.width*2 - 14,
            pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, 'right')
    }

    doc.setTextColor('#000000');
    doc.setFontStyle('normal');
    doc.text("Identification",
        pos.audiometrie.left + pos.audiometrie.cell.width*4,
        pos.audiometrie.top + pos.audiometrie.cell.height - 2, "center")
    doc.text("Résultat",
        pos.audiometrie.left + pos.audiometrie.cell.width*2.5,
        pos.audiometrie.top + pos.audiometrie.cell.height*3 - 3, "center")
    doc.text("Niveau",
        pos.audiometrie.left + pos.audiometrie.cell.width*2.5,
        pos.audiometrie.top + pos.audiometrie.cell.height*4 - 3, "center")
    doc.text("Masking",
        pos.audiometrie.left + pos.audiometrie.cell.width*2.5,
        pos.audiometrie.top + pos.audiometrie.cell.height*5 - 3, "center")
    doc.text("Mono",
        pos.audiometrie.left + pos.audiometrie.cell.width*3.5,
        pos.audiometrie.top + pos.audiometrie.cell.height*2 - 3, "center")
    if(state.rapport.fields[0].data.type != "Champ Libre"){
        doc.text("Mono",
            pos.audiometrie.left + pos.audiometrie.cell.width*4.5,
            pos.audiometrie.top + pos.audiometrie.cell.height*2 - 3, "center")
        doc.text("Binaural",
            pos.audiometrie.left + pos.audiometrie.cell.width*5.5,
            pos.audiometrie.top + pos.audiometrie.cell.height*2 - 3, "center")
    }else{
        doc.text("Binaural",
            pos.audiometrie.left + pos.audiometrie.cell.width*4.5,
            pos.audiometrie.top + pos.audiometrie.cell.height*2 - 3, "center")
    }
    doc.setTextColor('#5d6bb2');
    doc.setFontStyle('bold');
    doc.text(state.rapport.fields[4].data.gauche.identification.premier.resultat,
        pos.audiometrie.left + pos.audiometrie.cell.width*4 - 14,
        pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, 'right')
    doc.text(state.rapport.fields[4].data.gauche.identification.premier.niveau,
        pos.audiometrie.left + pos.audiometrie.cell.width*4 - 14,
        pos.audiometrie.top + pos.audiometrie.cell.height*4 - 2, 'right')
    doc.text(state.rapport.fields[4].data.gauche.identification.premier.masking,
        pos.audiometrie.left + pos.audiometrie.cell.width*4 - 14,
        pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, 'right')
    if(state.rapport.fields[0].data.type != "Champ Libre"){
        doc.text(state.rapport.fields[4].data.gauche.identification.deuxieme.resultat,
            pos.audiometrie.left + pos.audiometrie.cell.width*5 - 14,
            pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, 'right')
        doc.text(state.rapport.fields[4].data.gauche.identification.deuxieme.niveau,
            pos.audiometrie.left + pos.audiometrie.cell.width*5 - 14,
            pos.audiometrie.top + pos.audiometrie.cell.height*4 - 2, 'right')
        doc.text(state.rapport.fields[4].data.gauche.identification.deuxieme.masking,
            pos.audiometrie.left + pos.audiometrie.cell.width*5 - 14,
            pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, 'right')
        if(state.rapport.fields[4].data.binaural){
            doc.text(state.rapport.fields[4].data.both.resultat,
                pos.audiometrie.left + pos.audiometrie.cell.width*6 - 14,
                pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, 'right')
            doc.text(state.rapport.fields[4].data.both.niveau,
                pos.audiometrie.left + pos.audiometrie.cell.width*6 - 14,
                pos.audiometrie.top + pos.audiometrie.cell.height*4 - 2, 'right')
            doc.text(state.rapport.fields[4].data.both.masking,
                pos.audiometrie.left + pos.audiometrie.cell.width*6 - 14,
                pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, 'right')
        }
    }else{
        if(state.rapport.fields[4].data.binaural){
            doc.text(state.rapport.fields[4].data.both.resultat,
                pos.audiometrie.left + pos.audiometrie.cell.width*5 - 14,
                pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, 'right')
            doc.text(state.rapport.fields[4].data.both.niveau,
                pos.audiometrie.left + pos.audiometrie.cell.width*5 - 14,
                pos.audiometrie.top + pos.audiometrie.cell.height*4 - 2, 'right')
            doc.text(state.rapport.fields[4].data.both.masking,
                pos.audiometrie.left + pos.audiometrie.cell.width*5 - 14,
                pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, 'right')
        }
    }
    doc.setTextColor('#000000');
    doc.setFontStyle('normal');
    doc.setFontSize(5)
    doc.text("dBHL",
        pos.audiometrie.left + pos.audiometrie.cell.width - 1,
        pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, "right")
    doc.text("dBHL",
        pos.audiometrie.left + pos.audiometrie.cell.width - 1,
        pos.audiometrie.top + pos.audiometrie.height - 2, "right")
    doc.text("dBHL",
        pos.audiometrie.left + pos.audiometrie.cell.width*2 - 1,
        pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, "right")
    doc.text("dBHL",
        pos.audiometrie.left + pos.audiometrie.cell.width*2 - 1,
        pos.audiometrie.top + pos.audiometrie.height - 2, "right")
    doc.text("%",
        pos.audiometrie.left + pos.audiometrie.cell.width*4 - 1,
        pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, "right")
    doc.text("%",
        pos.audiometrie.left + pos.audiometrie.cell.width*5 - 1,
        pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, "right")
    if(state.rapport.fields[0].data.type != "Champ Libre"){
        doc.text("%",
            pos.audiometrie.left + pos.audiometrie.cell.width*6 - 1,
            pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, "right")
    }
    doc.text("dBHL",
        pos.audiometrie.left + pos.audiometrie.cell.width*4 - 1,
        pos.audiometrie.top + pos.audiometrie.cell.height*4 - 2, "right")
    doc.text("dBHL",
        pos.audiometrie.left + pos.audiometrie.cell.width*5 - 1,
        pos.audiometrie.top + pos.audiometrie.cell.height*4 - 2, "right")
    if(state.rapport.fields[0].data.type != "Champ Libre"){
        doc.text("dBHL",
            pos.audiometrie.left + pos.audiometrie.cell.width*6 - 1,
            pos.audiometrie.top + pos.audiometrie.cell.height*4 - 2, "right")
    }
    doc.text("dBHL",
        pos.audiometrie.left + pos.audiometrie.cell.width*4 - 1,
        pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, "right")
    doc.text("dBHL",
        pos.audiometrie.left + pos.audiometrie.cell.width*5 - 1,
        pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, "right")
    if(state.rapport.fields[0].data.type != "Champ Libre"){
        doc.text("dBHL",
            pos.audiometrie.left + pos.audiometrie.cell.width*6 - 1,
            pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, "right")
    }
    doc.setFontSize(8)

    ////////// Champ Libre extra audiometrie values //////////////////////
    if(state.rapport.fields[0].data.type == "Champ Libre"){
        let extra = {
            height: 35,
            width: 160,
            top: pos.audiometrie.top + pos.audiometrie.height + 14,
            left: (pos.tympanometrie.left + pos.audiometrie.width + pos.audiometrie.gap/2) - 80
        }
        extra = {
            ...extra,
            cell:{
                width: extra.width/4
            }
        }

        doc.text(
            "CHAMP LIBRE",
            pos.tympanometrie.left + pos.audiometrie.width + pos.audiometrie.gap/2,
            extra.top - 2,
            "center"
        )
        doc.rect(
            extra.left,
            extra.top,
            extra.width,
            extra.height
        )
        let values = {
            "MSP 3" : state.rapport.fields[4].data.champLibre.msp.freq3,
            "MSP 4" : state.rapport.fields[4].data.champLibre.msp.freq4,
            "SRP" : state.rapport.fields[4].data.champLibre.srp,
            "SDP" : state.rapport.fields[4].data.champLibre.sdp
        }
        let n = 0;
        for(let keys in values){
            doc.setFontSize(8)
            if(keys == "SDP" && state.rapport.fields[4].data.ndc){
                doc.text(
                    "NDC",
                    extra.left + extra.cell.width/2 + extra.cell.width*n,
                    extra.top + 8,
                    "center"
                )
                doc.setFontSize(10)
                doc.text(
                    state.rapport.fields[4].data.champLibre.ndc,
                    extra.left + extra.cell.width/2 + extra.cell.width*n,
                    extra.top + extra.height - 10,
                    "center"
                )
            }else{
                doc.text(
                    keys,
                    extra.left + extra.cell.width/2 + extra.cell.width*n,
                    extra.top + 8,
                    "center"
                )
                doc.setFontSize(10)
                doc.text(
                    values[keys],
                    extra.left + extra.cell.width/2 + extra.cell.width*n,
                    extra.top + extra.height - 10,
                    "center"
                )
            }
            doc.setFontSize(5)
            doc.text("dBHL",
                extra.left + extra.cell.width*(n+1) - 1,
                extra.top + extra.height - 3, "right")
            if(n < 4){
                doc.line(
                    extra.left + extra.cell.width*n,
                    extra.top,
                    extra.left + extra.cell.width*n,
                    extra.top + extra.height
                )
            }
            n++;
        }


    }


    //Tympanométrie
    doc.rect(
        pos.tympanometrie.left,
        pos.tympanometrie.top,
        pos.tympanometrie.width,
        pos.tympanometrie.height
    )
    doc.line(
        pos.tympanometrie.left + pos.tympanometrie.cell.width,
        pos.tympanometrie.top,
        pos.tympanometrie.left + pos.tympanometrie.cell.width,
        pos.tympanometrie.top + pos.tympanometrie.height
    )
    doc.line(
        pos.tympanometrie.left + pos.tympanometrie.cell.width*2,
        pos.tympanometrie.top,
        pos.tympanometrie.left + pos.tympanometrie.cell.width*2,
        pos.tympanometrie.top + pos.tympanometrie.height
    )
    doc.line(
        pos.tympanometrie.left + pos.tympanometrie.cell.width*3,
        pos.tympanometrie.top,
        pos.tympanometrie.left + pos.tympanometrie.cell.width*3,
        pos.tympanometrie.top + pos.tympanometrie.height
    )
    doc.rect(
        pos.tympanometrie.left + pos.tympanometrie.width,
        pos.tympanometrie.top + 10,
        pos.tympanometrie.extraCell.width,
        pos.tympanometrie.extraCell.height
    )
    doc.text("Pression",
        pos.tympanometrie.left + pos.tympanometrie.cell.width/2,
        pos.tympanometrie.top + 7, "center")
    doc.text("Compliance",
        pos.tympanometrie.left + pos.tympanometrie.cell.width*1.5,
        pos.tympanometrie.top + 7, "center")
    doc.text("Volume",
        pos.tympanometrie.left + pos.tympanometrie.cell.width*2.5,
        pos.tympanometrie.top + 7, "center")
    if(state.rapport.fields[0].data.type != "Champ Libre"){
        doc.text("Gradient",
            pos.tympanometrie.left + pos.tympanometrie.cell.width*3.5,
            pos.tympanometrie.top + 7, "center")
    }
    doc.text("Type",
        pos.tympanometrie.left + pos.tympanometrie.width + pos.tympanometrie.extraCell.width/2,
        pos.tympanometrie.top + 10 + 7, "center")
    doc.setFontSize(10)
    doc.text(state.rapport.fields[2].data.droite.pression,
        pos.tympanometrie.left + pos.tympanometrie.cell.width/2,
        pos.tympanometrie.top + pos.tympanometrie.cell.height - 9, "center")
    doc.text(state.rapport.fields[2].data.droite.compliance,
        pos.tympanometrie.left + pos.tympanometrie.cell.width*1.5,
        pos.tympanometrie.top + pos.tympanometrie.cell.height - 9, "center")
    doc.text(state.rapport.fields[2].data.droite.volume,
        pos.tympanometrie.left + pos.tympanometrie.cell.width*2.5,
        pos.tympanometrie.top + pos.tympanometrie.cell.height - 9, "center")
    if(state.rapport.fields[0].data.type != "Champ Libre"){
        doc.text(state.rapport.fields[2].data.droite.gradient,
            pos.tympanometrie.left + pos.tympanometrie.cell.width*3.5,
            pos.tympanometrie.top + pos.tympanometrie.cell.height - 9, "center")
    }
    doc.text(state.rapport.fields[2].data.droite.type,
        pos.tympanometrie.left + pos.tympanometrie.width + pos.tympanometrie.extraCell.width/2,
        pos.tympanometrie.top + 10 + pos.tympanometrie.extraCell.height - 3, "center")
    doc.setFontSize(6)
    doc.text("daPa",
        pos.tympanometrie.left + pos.tympanometrie.cell.width - 1.5,
        pos.tympanometrie.top + pos.tympanometrie.cell.height - 2, "right")
    doc.text("mL",
        pos.tympanometrie.left + pos.tympanometrie.cell.width*2 - 1.5,
        pos.tympanometrie.top + pos.tympanometrie.cell.height - 2, "right")
    doc.text("mL",
        pos.tympanometrie.left + pos.tympanometrie.cell.width*3 - 1.5,
        pos.tympanometrie.top + pos.tympanometrie.cell.height - 2,"right")
    if(state.rapport.fields[0].data.type != "Champ Libre"){
        doc.text("daPa",
            pos.tympanometrie.left + pos.tympanometrie.cell.width*4 - 1.5,
            pos.tympanometrie.top + pos.tympanometrie.cell.height - 2,"right")
    }
    doc.setFontSize(8)

    doc.setFontStyle("bold")
    doc.text("TYMPANOMÉTRIE",
        pos.tympanometrie.left + pos.tympanometrie.width + pos.tympanometrie.gap/2,
        pos.tympanometrie.top + 4, "center")
    doc.setFontStyle("normal")
    if(state.rapport.fields[0].data.type == "Champ Libre"){
        doc.text("226hz",
            pos.tympanometrie.left + pos.tympanometrie.width + pos.tympanometrie.gap/2 -5,
            pos.tympanometrie.top + 16,
            "left"
        )
        doc.text("1000hz",
            pos.tympanometrie.left + pos.tympanometrie.width + pos.tympanometrie.gap/2 -5,
            pos.tympanometrie.top + 26,
            "left"
        )
        doc.rect(
            pos.tympanometrie.left + pos.tympanometrie.width + pos.tympanometrie.gap/2 -5 - pos.checkbox.width - pos.checkbox.gap,
            pos.tympanometrie.top + 16 - 7,
            pos.checkbox.width,
            pos.checkbox.height
        )
        if(state.rapport.fields[2].data.freq == "226hz"){
            doc.addImage(check, "png",
                pos.tympanometrie.left + pos.tympanometrie.width + pos.tympanometrie.gap/2 -5 - pos.checkbox.width - pos.checkbox.gap +2,
                pos.tympanometrie.top + 16 -2 -7,
                pos.checkbox.width +1,
                pos.checkbox.height +1
            )
        }
        doc.rect(
            pos.tympanometrie.left + pos.tympanometrie.width + pos.tympanometrie.gap/2 -5 - pos.checkbox.width - pos.checkbox.gap,
            pos.tympanometrie.top + 26 - 7,
            pos.checkbox.width,
            pos.checkbox.height
        )
        if(state.rapport.fields[2].data.freq == "1000hz"){
            doc.addImage(check, "png",
                pos.tympanometrie.left + pos.tympanometrie.width + pos.tympanometrie.gap/2 -5 - pos.checkbox.width - pos.checkbox.gap +2,
                pos.tympanometrie.top + 26 -2 -7,
                pos.checkbox.width +1,
                pos.checkbox.height +1
            )
        }
    }


    pos.tympanometrie.left = pos.tympanometrie.left + pos.tympanometrie.width + pos.tympanometrie.gap
    doc.rect(
        pos.tympanometrie.left,
        pos.tympanometrie.top,
        pos.tympanometrie.width,
        pos.tympanometrie.height
    )
    doc.line(
        pos.tympanometrie.left + pos.tympanometrie.cell.width,
        pos.tympanometrie.top,
        pos.tympanometrie.left + pos.tympanometrie.cell.width,
        pos.tympanometrie.top + pos.tympanometrie.height
    )
    doc.line(
        pos.tympanometrie.left + pos.tympanometrie.cell.width*2,
        pos.tympanometrie.top,
        pos.tympanometrie.left + pos.tympanometrie.cell.width*2,
        pos.tympanometrie.top + pos.tympanometrie.height
    )
    doc.line(
        pos.tympanometrie.left + pos.tympanometrie.cell.width*3,
        pos.tympanometrie.top,
        pos.tympanometrie.left + pos.tympanometrie.cell.width*3,
        pos.tympanometrie.top + pos.tympanometrie.height
    )
    doc.rect(
        pos.tympanometrie.left - pos.tympanometrie.extraCell.width,
        pos.tympanometrie.top + 10,
        pos.tympanometrie.extraCell.width,
        pos.tympanometrie.extraCell.height
    )
    doc.text("Pression",
        pos.tympanometrie.left + pos.tympanometrie.cell.width/2,
        pos.tympanometrie.top + 7, "center")
    doc.text("Compliance",
        pos.tympanometrie.left + pos.tympanometrie.cell.width*1.5,
        pos.tympanometrie.top + 7, "center")
    doc.text("Volume",
        pos.tympanometrie.left + pos.tympanometrie.cell.width*2.5,
        pos.tympanometrie.top + 7, "center")
    if(state.rapport.fields[0].data.type != "Champ Libre"){
        doc.text("Gradient",
            pos.tympanometrie.left + pos.tympanometrie.cell.width*3.5,
            pos.tympanometrie.top + 7, "center")
    }
    doc.text("Type",
        pos.tympanometrie.left - pos.tympanometrie.extraCell.width/2,
        pos.tympanometrie.top + 10 + 7, "center")
    doc.setFontSize(10)
    doc.text(state.rapport.fields[2].data.gauche.pression,
        pos.tympanometrie.left + pos.tympanometrie.cell.width/2,
        pos.tympanometrie.top + pos.tympanometrie.cell.height - 9, "center")
    doc.text(state.rapport.fields[2].data.gauche.compliance,
        pos.tympanometrie.left + pos.tympanometrie.cell.width*1.5,
        pos.tympanometrie.top + pos.tympanometrie.cell.height - 9, "center")
    doc.text(state.rapport.fields[2].data.gauche.volume,
        pos.tympanometrie.left + pos.tympanometrie.cell.width*2.5,
        pos.tympanometrie.top + pos.tympanometrie.cell.height - 9, "center")
    if(state.rapport.fields[0].data.type != "Champ Libre"){
        doc.text(state.rapport.fields[2].data.gauche.gradient,
            pos.tympanometrie.left + pos.tympanometrie.cell.width*3.5,
            pos.tympanometrie.top + pos.tympanometrie.cell.height - 9, "center")
    }
    doc.text(state.rapport.fields[2].data.gauche.type,
        pos.tympanometrie.left - pos.tympanometrie.extraCell.width/2,
        pos.tympanometrie.top + 10 + pos.tympanometrie.extraCell.height - 3, "center")
    doc.setFontSize(6)
    doc.text("daPa",
        pos.tympanometrie.left + pos.tympanometrie.cell.width - 1.5,
        pos.tympanometrie.top + pos.tympanometrie.cell.height - 2, "right")
    doc.text("mL",
        pos.tympanometrie.left + pos.tympanometrie.cell.width*2 - 1.5,
        pos.tympanometrie.top + pos.tympanometrie.cell.height - 2, "right")
    doc.text("mL",
        pos.tympanometrie.left + pos.tympanometrie.cell.width*3 - 1.5,
        pos.tympanometrie.top + pos.tympanometrie.cell.height - 2,"right")
    if(state.rapport.fields[0].data.type != "Champ Libre"){
        doc.text("daPa",
            pos.tympanometrie.left + pos.tympanometrie.cell.width*4 - 1.5,
            pos.tympanometrie.top + pos.tympanometrie.cell.height - 2,"right")
    }
    doc.setFontSize(8)


    doc.rect(
        pos.tympanometrie.graph.left,
        pos.tympanometrie.graph.top,
        pos.tympanometrie.graph.width,
        pos.tympanometrie.graph.height
    )
    for(i = 1; i < 8; i++){
        doc.line(
            pos.tympanometrie.graph.left,
            pos.tympanometrie.graph.top + pos.tympanometrie.graph.cell.height * i,
            pos.tympanometrie.graph.left + pos.tympanometrie.graph.width,
            pos.tympanometrie.graph.top + pos.tympanometrie.graph.cell.height * i
        )
    }
    for(i = 1; i < 6; i++){
        doc.line(
            pos.tympanometrie.graph.left + pos.tympanometrie.graph.cell.width * i,
            pos.tympanometrie.graph.top,
            pos.tympanometrie.graph.left + pos.tympanometrie.graph.cell.width * i,
            pos.tympanometrie.graph.top + pos.tympanometrie.graph.height
        )
    }
    let v = ["2.0", "1.0", '0']
    let h = [-400, -200, 0, +200]
    for(i in v){
        doc.text(v[i],
            pos.tympanometrie.graph.left - 2,
            pos.tympanometrie.graph.top + pos.tympanometrie.graph.cell.height*4 * i + 3, "right")
    }
    for(i in h){
        doc.text(h[i].toString(),
            pos.tympanometrie.graph.left + pos.tympanometrie.graph.cell.width*2 * i,
            pos.tympanometrie.graph.top + pos.tympanometrie.graph.height + 10, "center")
    }
    for(i in state.rapport.fields[2].data.droite.graph.data){
        let path = state.rapport.fields[2].data.droite.graph.data[i];
        let svg = `<svg height="400" width="400">
                        <path d="${path}" stroke-width="5" fill="none" stroke="#f15c5d" />
                    </svg>`;
        let canvas = document.createElement('canvas');
        canvg(canvas, svg);
        let imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'png',
            pos.tympanometrie.graph.left,
            pos.tympanometrie.graph.top,
            pos.tympanometrie.graph.width,
            pos.tympanometrie.graph.height
        )

    }
    for(i in state.rapport.fields[2].data.gauche.graph.data){
        let path = state.rapport.fields[2].data.gauche.graph.data[i];
        let svg = `<svg height="400" width="400">
                        <path d="${path}" stroke-width="5" fill="none" stroke="#5d6bb2" />
                    </svg>`;
        let canvas = document.createElement('canvas');
        canvg(canvas, svg);
        let imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'png',
            pos.tympanometrie.graph.left,
            pos.tympanometrie.graph.top,
            pos.tympanometrie.graph.width,
            pos.tympanometrie.graph.height
        )

    }





    // Seuils /////////////////////////////////////////////////////////////////////
    if(state.rapport.fields[0].data.type != "Champ Libre"){
        doc.setFillColor("#cccccc")
        doc.rect(
            pos.seuils.left,
            pos.seuils.top,
            pos.seuils.width,
            pos.seuils.cell.height, "F")
        doc.rect(pos.seuils.left, pos.seuils.top, pos.seuils.width, pos.seuils.height)
        doc.line(
            pos.seuils.left + pos.seuils.cell.width*2,
            pos.seuils.top,
            pos.seuils.left + pos.seuils.cell.width*2,
            pos.seuils.top + pos.seuils.height
        )
        doc.line(
            pos.seuils.left + pos.seuils.cell.width*3,
            pos.seuils.top,
            pos.seuils.left + pos.seuils.cell.width*3,
            pos.seuils.top + pos.seuils.height
        )
        doc.line(
            pos.seuils.left + pos.seuils.cell.width*4,
            pos.seuils.top,
            pos.seuils.left + pos.seuils.cell.width*4,
            pos.seuils.top + pos.seuils.height
        )
        doc.line(
            pos.seuils.left + pos.seuils.cell.width*5,
            pos.seuils.top,
            pos.seuils.left + pos.seuils.cell.width*5,
            pos.seuils.top + pos.seuils.height
        )
        doc.line(
            pos.seuils.left,
            pos.seuils.top + pos.seuils.cell.height,
            pos.seuils.left + pos.seuils.width,
            pos.seuils.top + pos.seuils.cell.height
        )
        doc.line(
            pos.seuils.left,
            pos.seuils.top + pos.seuils.cell.height*2,
            pos.seuils.left + pos.seuils.width,
            pos.seuils.top + pos.seuils.cell.height*2
        )
        doc.line(
            pos.seuils.left,
            pos.seuils.top + pos.seuils.cell.height*3,
            pos.seuils.left + pos.seuils.width,
            pos.seuils.top + pos.seuils.cell.height*3
        )
        doc.text("Stimulation droite",
            pos.seuils.left + 1,
            pos.seuils.top + pos.seuils.cell.height - 2)
        doc.text("Ipsilatérale",
            pos.seuils.left + 1,
            pos.seuils.top + pos.seuils.cell.height*2 - 2)
        doc.text("Controlatérale",
            pos.seuils.left + 1,
            pos.seuils.top + pos.seuils.cell.height*3 - 2)
        doc.text("Metz",
            pos.seuils.left + 1,
            pos.seuils.top + pos.seuils.cell.height*4 - 2)
        doc.text("500",
            pos.seuils.left + pos.seuils.cell.width*2.5,
            pos.seuils.top + pos.seuils.cell.height - 2, "center")
        doc.text("1000",
            pos.seuils.left + pos.seuils.cell.width*3.5,
            pos.seuils.top + pos.seuils.cell.height - 2, "center")
        doc.text("2000",
            pos.seuils.left + pos.seuils.cell.width*4.5,
            pos.seuils.top + pos.seuils.cell.height - 2, "center")
        doc.text("4000",
            pos.seuils.left + pos.seuils.cell.width*5.5,
            pos.seuils.top + pos.seuils.cell.height - 2, "center")

        freq = [500, 1000, 2000, 4000];
        var simulation = ["ipsilaterale", "controlaterale", "metz"]
        for(i in simulation){
            for(j in freq){
                for(var k in state.rapport.fields[3].data.droite[simulation[i]]){
                    let value = state.rapport.fields[3].data.droite[simulation[i]][k]
                    if(value.freq == freq[j]){
                        doc.text(value.value,
                            pos.seuils.left + pos.seuils.cell.width*2 + pos.seuils.cell.width * j + pos.seuils.cell.width/2,
                            pos.seuils.top + pos.seuils.cell.height*2 + pos.seuils.cell.height * i - 2,
                            "center"
                        )
                    }
                }
            }
        }

        doc.setFontStyle("bold")
        doc.text("SEUILS DE\nRÉFLEXE\nSTAPÉDIEN",
            pos.seuils.left + pos.seuils.width + pos.seuils.gap/2,
            pos.seuils.top + pos.seuils.height/2 - 8, "center")
        doc.setFontStyle("normal")


        pos.seuils.left = pos.seuils.left + pos.seuils.width + pos.seuils.gap
        doc.setFillColor("#cccccc")
        doc.rect(
            pos.seuils.left,
            pos.seuils.top,
            pos.seuils.width,
            pos.seuils.cell.height, "F")
        doc.rect(pos.seuils.left, pos.seuils.top, pos.seuils.width, pos.seuils.height)
        doc.line(
            pos.seuils.left + pos.seuils.cell.width*2,
            pos.seuils.top,
            pos.seuils.left + pos.seuils.cell.width*2,
            pos.seuils.top + pos.seuils.height
        )
        doc.line(
            pos.seuils.left + pos.seuils.cell.width*3,
            pos.seuils.top,
            pos.seuils.left + pos.seuils.cell.width*3,
            pos.seuils.top + pos.seuils.height
        )
        doc.line(
            pos.seuils.left + pos.seuils.cell.width*4,
            pos.seuils.top,
            pos.seuils.left + pos.seuils.cell.width*4,
            pos.seuils.top + pos.seuils.height
        )
        doc.line(
            pos.seuils.left + pos.seuils.cell.width*5,
            pos.seuils.top,
            pos.seuils.left + pos.seuils.cell.width*5,
            pos.seuils.top + pos.seuils.height
        )
        doc.line(
            pos.seuils.left,
            pos.seuils.top + pos.seuils.cell.height,
            pos.seuils.left + pos.seuils.width,
            pos.seuils.top + pos.seuils.cell.height
        )
        doc.line(
            pos.seuils.left,
            pos.seuils.top + pos.seuils.cell.height*2,
            pos.seuils.left + pos.seuils.width,
            pos.seuils.top + pos.seuils.cell.height*2
        )
        doc.line(
            pos.seuils.left,
            pos.seuils.top + pos.seuils.cell.height*3,
            pos.seuils.left + pos.seuils.width,
            pos.seuils.top + pos.seuils.cell.height*3
        )
        doc.text("Stimulation gauche",
            pos.seuils.left + 1,
            pos.seuils.top + pos.seuils.cell.height - 2)
        doc.text("Ipsilatérale",
            pos.seuils.left + 1,
            pos.seuils.top + pos.seuils.cell.height*2 - 2)
        doc.text("Controlatérale",
            pos.seuils.left + 1,
            pos.seuils.top + pos.seuils.cell.height*3 - 2)
        doc.text("Metz",
            pos.seuils.left + 1,
            pos.seuils.top + pos.seuils.cell.height*4 - 2)
        doc.text("500",
            pos.seuils.left + pos.seuils.cell.width*2.5,
            pos.seuils.top + pos.seuils.cell.height - 2, "center")
        doc.text("1000",
            pos.seuils.left + pos.seuils.cell.width*3.5,
            pos.seuils.top + pos.seuils.cell.height - 2, "center")
        doc.text("2000",
            pos.seuils.left + pos.seuils.cell.width*4.5,
            pos.seuils.top + pos.seuils.cell.height - 2, "center")
        doc.text("4000",
            pos.seuils.left + pos.seuils.cell.width*5.5,
            pos.seuils.top + pos.seuils.cell.height - 2, "center")


        for(i in simulation){
            for(j in freq){
                for(var k in state.rapport.fields[3].data.gauche[simulation[i]]){
                    let value = state.rapport.fields[3].data.gauche[simulation[i]][k]
                    if(value.freq == freq[j]){
                        doc.text(value.value,
                            pos.seuils.left + pos.seuils.cell.width*2 + pos.seuils.cell.width * j + pos.seuils.cell.width/2,
                            pos.seuils.top + pos.seuils.cell.height*2 + pos.seuils.cell.height * i - 2,
                            "center"
                        )
                    }
                }
            }
        }
    }

    //Divers
    doc.setFontStyle("bold")
    doc.text("VALIDITÉ :", pos.divers.left, pos.divers.top)
    doc.setFontStyle("normal")
    doc.rect(
        pos.divers.left,
        pos.divers.top + pos.divers.lineHeight -4,
        pos.checkbox.width, pos.checkbox.height)
    doc.text("Bonne",
        pos.divers.left + pos.checkbox.width + pos.checkbox.gap,
        pos.divers.top + pos.divers.lineHeight + 3)
    doc.rect(
        pos.divers.left,
        pos.divers.top + pos.divers.lineHeight*2 -4,
        pos.checkbox.width, pos.checkbox.height)
    doc.text("Moyenne",
        pos.divers.left + pos.checkbox.width + pos.checkbox.gap,
        pos.divers.top + pos.divers.lineHeight*2 + 3)
    doc.rect(
        pos.divers.left,
        pos.divers.top + pos.divers.lineHeight*3 -4,
        pos.checkbox.width, pos.checkbox.height)
    doc.text("Nulle",
        pos.divers.left + pos.checkbox.width + pos.checkbox.gap,
        pos.divers.top + pos.divers.lineHeight*3 + 3)
    doc.rect(
        pos.divers.left,
        pos.divers.top + pos.divers.lineHeight*4 -4,
        pos.checkbox.width, pos.checkbox.height)
    doc.text("Repos sonore\ninadéquat",
        pos.divers.left + pos.checkbox.width + pos.checkbox.gap,
        pos.divers.top + pos.divers.lineHeight*4 + 3)
    switch(state.rapport.fields[6].data.validite){
        case "Bonne" :{
            doc.addImage(check, "png",
                pos.divers.left + 2,
                pos.divers.top + pos.divers.lineHeight -4 -2,
                pos.checkbox.width +1,
                pos.checkbox.height +1);
            break;
        }
        case "Moyenne" :{
            doc.addImage(check, "png",
                pos.divers.left + 2,
                pos.divers.top + pos.divers.lineHeight*2 -4 -2,
                pos.checkbox.width +1,
                pos.checkbox.height +1);
            break;
        }
        case "Nulle" :{
            doc.addImage(check, "png",
                pos.divers.left + 2,
                pos.divers.top + pos.divers.lineHeight*3 -4 -2,
                pos.checkbox.width +1,
                pos.checkbox.height +1);
            break;
        }
        case "Repos sonore inadéquat" :{
            doc.addImage(check, "png",
                pos.divers.left + 2,
                pos.divers.top + pos.divers.lineHeight*4 -4 -2,
                pos.checkbox.width +1,
                pos.checkbox.height +1);
            break;
        }
    }

    doc.setFontStyle("bold")
    doc.text("AUDIOMÈTRE :",
        pos.divers.left,
        pos.divers.top + pos.divers.lineHeight*7)
    doc.setFontStyle("normal")
    doc.text(state.rapport.fields[6].data.audiometre,
        pos.divers.left,
        pos.divers.top + pos.divers.lineHeight*8)
    doc.text("Calibration :",
        pos.divers.left,
        pos.divers.top + pos.divers.lineHeight*9)
    let calibrationArr = state.rapport.fields[6].data.calibration.split("-");
    doc.text(calibrationArr[2] + " " + mois[calibrationArr[1] - 1] + " " + calibrationArr[0],
        pos.divers.left,
        pos.divers.top + pos.divers.lineHeight*10)

    doc.setFontStyle("bold")
    if(state.rapport.fields[6].data.methode == "Oui"){
        doc.text("NORME ANSI\nSÉRIE S3\nEN VIGUEUR",
            pos.divers.left,
            pos.divers.top + pos.divers.lineHeight*11.5)
    }else{
        doc.text("NORME ANSI\nSÉRIE S3 PAS\nEN VIGUEUR",
            pos.divers.left,
            pos.divers.top + pos.divers.lineHeight*11.5)
    }
    if(state.rapport.fields[0].data.type != "Champ Libre"){
        doc.text("TRANSDUCTEUR :",
            pos.divers.left,
            pos.divers.top + pos.divers.lineHeight*15)
        doc.setFontStyle("normal")
        doc.rect(
            pos.divers.left,
            pos.divers.top + pos.divers.lineHeight*16 -4,
            pos.checkbox.width, pos.checkbox.height)
        doc.text("Intra-auriculaire",
            pos.divers.left + pos.checkbox.width + pos.checkbox.gap,
            pos.divers.top + pos.divers.lineHeight*16 + 3)
        doc.rect(
            pos.divers.left,
            pos.divers.top + pos.divers.lineHeight*17 -4,
            pos.checkbox.width, pos.checkbox.height)
        doc.text("Supra-auriculaire",
            pos.divers.left + pos.checkbox.width + pos.checkbox.gap,
            pos.divers.top + pos.divers.lineHeight*17 + 3)
        doc.rect(
            pos.divers.left,
            pos.divers.top + pos.divers.lineHeight*18 -4,
            pos.checkbox.width, pos.checkbox.height)
        doc.text("Champ libre",
            pos.divers.left + pos.checkbox.width + pos.checkbox.gap,
            pos.divers.top + pos.divers.lineHeight*18 + 3)
        if(state.rapport.fields[6].data.transducteur.intra){
                doc.addImage(check, "png",
                    pos.divers.left + 2,
                    pos.divers.top + pos.divers.lineHeight*16 -4 -2,
                    pos.checkbox.width +1,
                    pos.checkbox.height +1);
            }
        if(state.rapport.fields[6].data.transducteur.supra){
                doc.addImage(check, "png",
                    pos.divers.left + 2,
                    pos.divers.top + pos.divers.lineHeight*17 -4 -2,
                    pos.checkbox.width +1,
                    pos.checkbox.height +1);
                }
        if(state.rapport.fields[6].data.transducteur.champLibre){
                doc.addImage(check, "png",
                    pos.divers.left + 2,
                    pos.divers.top + pos.divers.lineHeight*18 -4 -2,
                    pos.checkbox.width +1,
                    pos.checkbox.height +1);
                }
    }
    doc.setFontStyle("normal")

    doc.setFillColor("#cccccc")
    doc.rect(
        pos.divers.legend.left,
        pos.divers.legend.top,
        pos.divers.legend.width,
        pos.divers.legend.cell.height,"F")
    doc.rect(
        pos.divers.legend.left,
        pos.divers.legend.top + pos.divers.legend.cell.height*4,
        pos.divers.legend.width,
        pos.divers.legend.cell.height,"F")
    let height = pos.divers.legend.height + 22;
    if(state.rapport.fields[0].data.type == "Champ Libre"){
        height = pos.divers.legend.height + 22 + pos.divers.legend.cell.height;
    }
    doc.rect(
        pos.divers.legend.left,
        pos.divers.legend.top,
        pos.divers.legend.width,
        height
    )
    doc.setFontSize(7);
    doc.text("Conduction aérienne",
        pos.divers.legend.center,
        pos.divers.legend.top + pos.divers.legend.cell.height - 3, "center")
    doc.text("Conduction osseuse",
    pos.divers.legend.center,
    pos.divers.legend.top + pos.divers.legend.cell.height*5 - 3, "center")
    doc.setFontSize(8);
    doc.line(
        pos.divers.legend.left,
        pos.divers.legend.top + pos.divers.legend.cell.height,
        pos.divers.legend.left + pos.divers.legend.width,
        pos.divers.legend.top + pos.divers.legend.cell.height
    )
    doc.line(
        pos.divers.legend.left,
        pos.divers.legend.top + pos.divers.legend.cell.height*2,
        pos.divers.legend.left + pos.divers.legend.width,
        pos.divers.legend.top + pos.divers.legend.cell.height*2
    )
    doc.line(
        pos.divers.legend.left,
        pos.divers.legend.top + pos.divers.legend.cell.height*3,
        pos.divers.legend.left + pos.divers.legend.width,
        pos.divers.legend.top + pos.divers.legend.cell.height*3
    )
    doc.line(
        pos.divers.legend.left,
        pos.divers.legend.top + pos.divers.legend.cell.height*4,
        pos.divers.legend.left + pos.divers.legend.width,
        pos.divers.legend.top + pos.divers.legend.cell.height*4
    )
    doc.line(
        pos.divers.legend.left,
        pos.divers.legend.top + pos.divers.legend.cell.height*5,
        pos.divers.legend.left + pos.divers.legend.width,
        pos.divers.legend.top + pos.divers.legend.cell.height*5
    )
    doc.line(
        pos.divers.legend.left,
        pos.divers.legend.top + pos.divers.legend.cell.height*6,
        pos.divers.legend.left + pos.divers.legend.width,
        pos.divers.legend.top + pos.divers.legend.cell.height*6
    )
    doc.line(
        pos.divers.legend.left,
        pos.divers.legend.top + pos.divers.legend.cell.height*7-1,
        pos.divers.legend.left + pos.divers.legend.width,
        pos.divers.legend.top + pos.divers.legend.cell.height*7-1
    )
    doc.line(
        pos.divers.legend.left,
        pos.divers.legend.top + pos.divers.legend.cell.height*7+1,
        pos.divers.legend.left + pos.divers.legend.width,
        pos.divers.legend.top + pos.divers.legend.cell.height*7+1
    )
    doc.line(
        pos.divers.legend.left,
        pos.divers.legend.top + pos.divers.legend.height,
        pos.divers.legend.left + pos.divers.legend.width,
        pos.divers.legend.top + pos.divers.legend.height
    )
    if(state.rapport.fields[0].data.type == "Champ Libre"){
        doc.line(
            pos.divers.legend.left,
            pos.divers.legend.top + pos.divers.legend.height + 22,
            pos.divers.legend.left + pos.divers.legend.width,
            pos.divers.legend.top + pos.divers.legend.height + 22
        )
    }
    doc.text("Non masqué",
        pos.divers.legend.center,
        pos.divers.legend.top + pos.divers.legend.cell.height*2 -3, "center")
    doc.addImage(cercle, "png",
        pos.divers.legend.left + 1,
        pos.divers.legend.top + pos.divers.legend.cell.height*1 + 1,
        pos.divers.legend.icon.width,
        pos.divers.legend.icon.height
    )
    doc.addImage(x, "png",
        pos.divers.legend.left + pos.divers.legend.width - pos.divers.legend.icon.width - 1,
        pos.divers.legend.top + pos.divers.legend.cell.height*1 + 1,
        pos.divers.legend.icon.width,
        pos.divers.legend.icon.height
    )
    doc.text("Masqué",
        pos.divers.legend.center,
        pos.divers.legend.top + pos.divers.legend.cell.height*3 -3, "center")
    doc.addImage(triangle, "png",
        pos.divers.legend.left + 1,
        pos.divers.legend.top + pos.divers.legend.cell.height*2 + 1,
        pos.divers.legend.icon.width,
        pos.divers.legend.icon.height)
    doc.addImage(carre, "png",
        pos.divers.legend.left + pos.divers.legend.width - pos.divers.legend.icon.width - 1,
        pos.divers.legend.top + pos.divers.legend.cell.height*2 + 1,
        pos.divers.legend.icon.width,
        pos.divers.legend.icon.height)
    doc.text("Inconfort",
        pos.divers.legend.center,
        pos.divers.legend.top + pos.divers.legend.cell.height*4 -3, "center")
    doc.addImage(iRouge, "png",
        pos.divers.legend.left + 1,
        pos.divers.legend.top + pos.divers.legend.cell.height*3 + 1,
        pos.divers.legend.icon.width,
        pos.divers.legend.icon.height)
    doc.addImage(iBleu, "png",
        pos.divers.legend.left + pos.divers.legend.width - pos.divers.legend.icon.width - 1,
        pos.divers.legend.top + pos.divers.legend.cell.height*3 + 1,
        pos.divers.legend.icon.width,
        pos.divers.legend.icon.height)
    doc.text("Non Masqué",
        pos.divers.legend.center,
        pos.divers.legend.top + pos.divers.legend.cell.height*6 -3, "center")
    doc.addImage(flecheRouge, "png",
        pos.divers.legend.left + 1,
        pos.divers.legend.top + pos.divers.legend.cell.height*5 + 1,
        pos.divers.legend.icon.width,
        pos.divers.legend.icon.height)
    doc.addImage(flecheBleu, "png",
        pos.divers.legend.left + pos.divers.legend.width - pos.divers.legend.icon.width - 1,
        pos.divers.legend.top + pos.divers.legend.cell.height*5 + 1,
        pos.divers.legend.icon.width,
        pos.divers.legend.icon.height)
    doc.text("Masqué",
        pos.divers.legend.center,
        pos.divers.legend.top + pos.divers.legend.cell.height*7 -3, "center")
    doc.addImage(bracketRouge, "png",
        pos.divers.legend.left + 1,
        pos.divers.legend.top + pos.divers.legend.cell.height*6 + 1,
        pos.divers.legend.icon.width,
        pos.divers.legend.icon.height)
    doc.addImage(bracketBleu, "png",
        pos.divers.legend.left + pos.divers.legend.width - pos.divers.legend.icon.width - 1,
        pos.divers.legend.top + pos.divers.legend.cell.height*6 + 1,
        pos.divers.legend.icon.width,
        pos.divers.legend.icon.height)
    doc.text("Non Réponse",
        pos.divers.legend.center,
        pos.divers.legend.top + pos.divers.legend.cell.height*8 -3, "center")
    doc.addImage(nrRouge, "png",
        pos.divers.legend.left + 1,
        pos.divers.legend.top + pos.divers.legend.cell.height*7 + 1.5,
        pos.divers.legend.icon.width,
        pos.divers.legend.icon.height)
    doc.addImage(nrBleu, "png",
        pos.divers.legend.left + pos.divers.legend.width - pos.divers.legend.icon.width - 1,
        pos.divers.legend.top + pos.divers.legend.cell.height*7 + 1.5,
        pos.divers.legend.icon.width,
        pos.divers.legend.icon.height)


    doc.setFontSize(12)
    doc.setTextColor('#f15c5d');
    doc.text("*",
        pos.divers.legend.left + 2,
        pos.divers.legend.top + pos.divers.legend.cell.height*9 + 4.5)
    doc.setTextColor('#5d6bb2');
    doc.text("*",
        pos.divers.legend.left + pos.divers.legend.width - pos.divers.legend.icon.width + 4,
        pos.divers.legend.top + pos.divers.legend.cell.height*9 + 4.5)
    doc.setTextColor('#000000');
    doc.setFontSize(6)
    doc.text("Surassourdissement,\nmasque insuffisant,\nplateau impossible",
        pos.divers.legend.left + pos.divers.legend.width/2,
        pos.divers.legend.top + pos.divers.legend.cell.height*8.5,
        "center")

    doc.setFontSize(7)
    if(state.rapport.fields[0].data.type == "Champ Libre"){
        doc.text("Champ Libre",
            pos.divers.legend.center,
            pos.divers.legend.top + pos.divers.legend.cell.height*9 + 22 -3, "center")
        doc.addImage(champLibre, "png",
            pos.divers.legend.left + 1,
            pos.divers.legend.top + pos.divers.legend.cell.height*8 + 22 + 1.5,
            pos.divers.legend.icon.width,
            pos.divers.legend.icon.height)
    }

    if(state.rapport.fields[0].data.dateAnterieur != ""){
        doc.circle(
            pos.divers.left + 2,
            pos.divers.legend.top + pos.divers.legend.height + pos.divers.lineHeight*3 + 9, 2, "F")
        date = new Date(state.rapport.fields[0].data.dateAnterieur);
        doc.text(date.getDate() + " " + mois[date.getMonth()] + " " + date.getFullYear(),
            pos.divers.left + 7,
            pos.divers.legend.top + pos.divers.legend.height + pos.divers.lineHeight*3 + 12)
    }

    //signature
    doc.setFontSize(10);
    doc.text('Audiologiste : ', pos.signature.left, pos.signature.top)
    if(state.rapport.fields[6].data.cc != ""){
        doc.text("CC : "+state.rapport.fields[6].data.cc, pos.width - pos.margin.right, pos.signature.top, "right")
    }
    if(signature.signature != ""){
        doc.addImage(signature.signature, "png", pos.signature.left + 60, pos.signature.top - 20, 130, 28);
        doc.setFontSize(8);
        doc.text(signature.fullName + ", " + signature.titre + ", OOAQ# "+signature.license, pos.signature.left + 60, pos.signature.top + 15)
    }




    //Notes
    doc.setFontSize(8)
    let fullText = "";
    for(i in state.rapport.fields[7].data.tabs){
        fullText += state.rapport.fields[7].data.tabs[i].text + "<div style='color:white;font-size:3px;line-height:3px'>-</div>";
    }
    if(state.rapport.fields[0].data.type != "16 000hz"){
        doc.rect(pos.notes.left, pos.notes.top, pos.notes.width, pos.notes.height)
        doc.fromHTML("<div style='margin:0;font-size:9pt'>"+fullText+"</div>", pos.notes.left + 2, pos.notes.top - 2, {
                'width': pos.notes.width - 6,
             })
    }else{
        //Emission oto-acoustique
        doc.setFontSize(8)

        doc.setFontStyle("bold")
        doc.text("ÉMISSION OTO-ACOUSTIQUE",
            pos.eoa.left,
            pos.eoa.top)
        doc.setFontStyle("normal")

        doc.text(state.rapport.fields[5].data.type,
            pos.eoa.left + 120,
            pos.eoa.top
        )

        doc.text("OREILLE DROITE",
            pos.eoa.left,
            pos.eoa.top + 15
        )
        doc.rect(
            pos.eoa.left,
            pos.eoa.top + 20,
            pos.eoa.width,
            pos.eoa.height
        )
        doc.line(
            pos.eoa.left,
            pos.eoa.top + 20 + pos.eoa.cell.height,
            pos.eoa.left + pos.eoa.width,
            pos.eoa.top + 20 + pos.eoa.cell.height
        )

        doc.text("OREILLE GAUCHE",
            pos.eoa.left,
            pos.eoa.top + 20 + pos.eoa.height + 15
        )
        doc.rect(
            pos.eoa.left,
            pos.eoa.top + 20 + pos.eoa.height + 20,
            pos.eoa.width,
            pos.eoa.height
        )
        doc.line(
            pos.eoa.left,
            pos.eoa.top + 20 + pos.eoa.height + 20 + pos.eoa.cell.height,
            pos.eoa.left + pos.eoa.width,
            pos.eoa.top + 20 + pos.eoa.height + 20 + pos.eoa.cell.height
        )


        let droite, gauche, key;
        let i = 0;
        for(key in state.rapport.fields[5].data.freq.droite){
            droite = state.rapport.fields[5].data.freq.droite[key];
            gauche = state.rapport.fields[5].data.freq.gauche[key];
            doc.text(key.toString(),
                pos.eoa.left + pos.eoa.cell.width/2 + pos.eoa.cell.width*i,
                pos.eoa.top + pos.eoa.cell.height + 15,
                "center"
            )
            doc.text(droite,
                pos.eoa.left + pos.eoa.cell.width/2 +pos.eoa.cell.width*i,
                pos.eoa.top + 15 + pos.eoa.cell.height*2,
                "center"
            )
            doc.text(key.toString(),
                pos.eoa.left + pos.eoa.cell.width/2 + pos.eoa.cell.width*i,
                pos.eoa.top + pos.eoa.height + 20 + pos.eoa.cell.height + 15,
                "center"
            )
            doc.text(gauche,
                pos.eoa.left + pos.eoa.cell.width/2 +pos.eoa.cell.width*i,
                pos.eoa.top + pos.eoa.height + 20 + 15 + pos.eoa.cell.height*2,
                "center"
            )
            if(i != 0){
                doc.line(
                    pos.eoa.left + pos.eoa.cell.width*i,
                    pos.eoa.top + 20,
                    pos.eoa.left + pos.eoa.cell.width*i,
                    pos.eoa.top + 20 + pos.eoa.height
                )
                doc.line(
                    pos.eoa.left + pos.eoa.cell.width*i,
                    pos.eoa.top + 20 + pos.eoa.height + 20,
                    pos.eoa.left + pos.eoa.cell.width*i,
                    pos.eoa.top + 20 + pos.eoa.height + pos.eoa.height + 20
                )
            }
            i++;
        }

        doc.text(
            "Page 1",
            pos.width - pos.margin.right,
            pos.height - pos.margin.bottom,
            "right"
        )
         doc.addPage();
         doc.text(
             "Page 2",
             pos.width - pos.margin.right,
             pos.height - pos.margin.bottom,
             "right"
         )
         doc.text("Date: "+date.getDate() + " " + mois[date.getMonth()] + " " + date.getFullYear(),
             pos.width - pos.margin.right,
             pos.infos.top, "right")
         doc.rect(pos.margin.left, pos.margin.top + 20, pos.width - pos.margin.left - pos.margin.right, pos.height - 100)
         doc.fromHTML("<div style='margin:0;font-size:9pt'>"+fullText+"</div>", pos.margin.left + 2, pos.margin.top - 2, {
                 'width': pos.width - pos.margin.left - pos.margin.right - 6,
              })
          //signature
          doc.setFontSize(10);
          doc.text('Audiologiste : ', pos.signature.left, pos.signature.top)
          if(signature.signature != ""){
              doc.addImage(signature.signature, "png", pos.signature.left + 60, pos.signature.top - 20, 130, 28);
              doc.setFontSize(8);
              doc.text(signature.fullName + ", " + signature.titre + ", OOAQ# "+signature.license, pos.signature.left + 60, pos.signature.top + 15)
          }
    }



    return doc;
}

const mapStateToProps = (state) => {
    return {
        state: state
    }
};


var buttonLoading = false;
var buttonPrint = false;
var buttonFinish = false;
class Old_Pdf extends Component{
    render(){
        return (
            <div>
                <Row>
                    <Title text="Rapport PDF" />
                </Row>
                <Row>
                    <Button loading={buttonLoading} text="Télécharger" handleClick={() => {
                        buttonLoading = true;
                        this.forceUpdate();
                        getSignatureFirst(this.props.state, this, false);
                    }} />
                    <Subtitle text="Télécharger le fichier en format PDF"  />
                </Row>
                <Row>
                    <Button text="Envoyer" />
                    <Subtitle text="Envoyer le fichier par courriel au patient" />
                </Row>
                <Row>
                    <Button loading={buttonPrint} text="Imprimer" handleClick={e => {
                        buttonPrint = true;
                        this.forceUpdate();
                        getSignatureFirst(this.props.state, this, true);
                    }} />
                    <Subtitle text="Imprimer le rapport" />
                </Row>
                <Row right>
                    <Button text="Sauvegarder et terminer" loading={buttonFinish} handleClick={e => {
                        buttonFinish = true;
                        this.forceUpdate();
                        let comp = this;
                        $.post("/modules/rapport-auditif/api/saveRapport.php", {
                            patientid: this.props.state.informations.patientId ,
                            rapportid : this.props.state.informations.rapportId,
                            rapport: this.props.state.rapport.fields,
                            suivi: this.props.state.suivi
                        }, function(success){
                            if(!comp.props.state.suivi.email){
                                window.location.href = "/mes-patients/";
                                return;
                            }
                            let recommandations = comp.props.state.suivi.listes;
                            let email = comp.props.state.informations.fields[3].value;
                            let fullName = comp.props.state.informations.fields[1].value + " " + comp.props.state.informations.fields[2].value

                            let request = Object.keys(recommandations).length;
                            let completed = 0;
                            Object.keys(recommandations).map(x => {
                                if(recommandations[x].recommandation.liste !== null){
                                    $.post("/modules/rapport-auditif/api/getResponse.php", {
                                        liste: recommandations[x].recommandation.liste,
                                        email: email,
                                        name: fullName
                                    }, success => {
                                        console.log(success);
                                        completed++;
                                        if(request === completed){
                                            window.location.href = "/mes-patients/";
                                        }
                                    });
                                }
                                if(recommandations[x].precision !== undefined &&
                                    recommandations[x].precision.liste !== null){
                                    request++;
                                    $.post("/modules/rapport-auditif/api/getResponse.php", {
                                        liste: recommandations[x].precision.liste,
                                        email: email,
                                        name: fullName
                                    }, success => {
                                        console.log(success);
                                        completed++;
                                        if(request === completed){
                                            window.location.href = "/mes-patients/";
                                        }
                                    });
                                }
                            })
                        }).done(function(){

                        }).fail(function() {
                            console.log("can't connect to backend");
                            buttonFinish = false
                            comp.forceUpdate()
                        })
                    }}/>
                </Row>
            </div>
            );
    }

  }

export default connect( mapStateToProps )(Old_Pdf);
