import canvg from 'canvg'
import * as JsPDF from 'jspdf'
import $ from 'jquery';

import { MiseEnPage } from './miseEnPage';
import logo from "./images/logo.png";
import check from "./images/checkmark.png";
import * as symbols from "./images/symbols";

let pos;

let mois = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"]
let date = new Date();

const getClinique = cliniqueTitle => {
    return new Promise((res, err) => {
        $.get('/API/clinique/get/' + cliniqueTitle, data => {
            let cleanData;
            try{
                cleanData = JSON.parse(data);
            }catch(e){
                console.log(e);
                res([{
                    adresse : "123, rue demo",
                    ville : "Testville",
                    zip: "H1H 1H1",
                    phone: "(514)-123-4567"
                }])
            }
            res(cleanData)
        })
    })
};

const getAudiologisteInfos = audiologisteId => {
    let url = (audiologisteId === null)?"/API/audiologist/get/current":"/API/audiologist/get/"+Number(audiologisteId)
    return new Promise((res, err) => {
        $.get(url, data => {
            try{
                data = JSON.parse(data);
            }catch(e){
                console.log(e);
                res( {
                    signature: "",
                    fullName: "",
                    titre: "",
                    license: ""
                });
            }


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

                data[0].signature = canvas.toDataURL('image/png');

                res(data[0])
            };
            image.src = data[0].signature;
        });
    });
};

const pdfGenerator = async (report, audiologisteId) => {
    console.log(report);

    pos = MiseEnPage();

    let doc = new JsPDF("p", "pt", "letter");

    let type = report.rapport.fields[0].data.type;

    let clinique = await getClinique(report.rapport.fields[6].data.clinique);

    doc = header(doc, {
        adresse: clinique[0].adresse,
        ville: clinique[0].ville,
        zip: clinique[0].zip,
        phone: clinique[0].phone
    });


    doc = informations(
        doc,
        report.informations.fields,
        report.rapport.fields[6].data.date,
        report.rapport.fields[6].data.reference
    );


    //rapport
    doc.setFont('Helvetica', 'Bold');
    doc.text("RAPPORT AUDIOLOGIQUE", pos.width / 2, pos.rapport.top, 'center');
    doc.setFont('Helvetica', '');

    //audiogramme droit
    doc = audiogrammes(
        doc,
        (type !== "Champ Libre")?"AUDIOGRAMME OREILLE DROITE":"AUDIOGRAMME",
        report.rapport.fields[0].data.graph.right,
        report.rapport.fields[0].data.type,
        pos.audiogramme.left,
        "#f15c5d"
    );


    //audiogramme gauche
    if(type !== "Champ Libre"){
        doc = audiogrammes(
            doc,
            "AUDIOGRAMME OREILLE GAUCHE",
            report.rapport.fields[0].data.graph.left,
            report.rapport.fields[0].data.type,
            pos.audiogramme.left + pos.audiogramme.width + pos.audiogramme.gap,
            "#5d6bb2"
        );
    }else{
        doc = audiogrammes(
            doc,
            "",
            report.rapport.fields[0].data.graph.left,
            report.rapport.fields[0].data.type,
            pos.audiogramme.left,
            "#5d6bb2",
            false
        );
    }


    doc.setDrawColor("#000000");
    doc.setLineWidth(0.5);

    //masking
    if(type !== "Champ Libre")
        doc = masking(doc, type, report.rapport.fields[1].data.gauche, report.rapport.fields[1].data.droite);
    else//Champ Libre Emission oto-acoustique
        doc = EOAChampLibre(
            doc,
            report.rapport.fields[5].data.freq.droite,
            report.rapport.fields[5].data.freq.gauche,
            report.rapport.fields[1].data.champLibre,
            report.rapport.fields[6].data.transducteur
        );


    //audiometrie
    doc.text("OREILLE DROITE",
        pos.audiometrie.left + pos.audiometrie.width/2,
        pos.audiometrie.top - 5, "center");
    doc.setFillColor("#cccccc");
    if(report.rapport.fields[0].data.type !== "Champ Libre"){
        doc.rect(
            pos.audiometrie.left + pos.audiometrie.cell.width*4,
            pos.audiometrie.top + pos.audiometrie.cell.height,
            pos.audiometrie.cell.width * 2,
            pos.audiometrie.cell.height, "F");
        doc.rect(
            pos.audiometrie.left + pos.audiometrie.cell.width*4,
            pos.audiometrie.top + pos.audiometrie.cell.height*3,
            pos.audiometrie.cell.width * 2,
            pos.audiometrie.cell.height, "F");
        doc.rect(
            pos.audiometrie.left,
            pos.audiometrie.top,
            pos.audiometrie.cell.width * 4,
            pos.audiometrie.cell.height, "F");
        doc.rect(
            pos.audiometrie.left + pos.audiometrie.cell.width*4,
            pos.audiometrie.top + pos.audiometrie.cell.height,
            pos.audiometrie.cell.width * 2,
            pos.audiometrie.cell.height * 4
        );
        doc.rect(
            pos.audiometrie.left,
            pos.audiometrie.top,
            pos.audiometrie.cell.width * 4,
            pos.audiometrie.height
        );
    }else{
        doc.rect(
            pos.audiometrie.left + pos.audiometrie.cell.width*3,
            pos.audiometrie.top + pos.audiometrie.cell.height,
            pos.audiometrie.cell.width * 2,
            pos.audiometrie.cell.height, "F");
        doc.rect(
            pos.audiometrie.left + pos.audiometrie.cell.width*3,
            pos.audiometrie.top + pos.audiometrie.cell.height*3,
            pos.audiometrie.cell.width * 2,
            pos.audiometrie.cell.height, "F");
        doc.rect(
            pos.audiometrie.left,
            pos.audiometrie.top,
            pos.audiometrie.cell.width * 3,
            pos.audiometrie.cell.height, "F");
        doc.rect(
            pos.audiometrie.left + pos.audiometrie.cell.width*3,
            pos.audiometrie.top + pos.audiometrie.cell.height,
            pos.audiometrie.cell.width * 2,
            pos.audiometrie.cell.height * 4
        );
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
    );
    doc.line(
        pos.audiometrie.left + pos.audiometrie.cell.width*2,
        pos.audiometrie.top + pos.audiometrie.cell.height,
        pos.audiometrie.left + pos.audiometrie.cell.width*2,
        pos.audiometrie.top + pos.audiometrie.height
    );
    if(report.rapport.fields[0].data.type !== "Champ Libre"){
        doc.line(
            pos.audiometrie.left + pos.audiometrie.cell.width*3,
            pos.audiometrie.top + pos.audiometrie.cell.height,
            pos.audiometrie.left + pos.audiometrie.cell.width*3,
            pos.audiometrie.top + pos.audiometrie.height
        );
        doc.line(
            pos.audiometrie.left + pos.audiometrie.cell.width*5,
            pos.audiometrie.top + pos.audiometrie.cell.height,
            pos.audiometrie.left + pos.audiometrie.cell.width*5,
            pos.audiometrie.top + pos.audiometrie.height
        );
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
        );
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
    );
    doc.line(
        pos.audiometrie.left,
        pos.audiometrie.top + pos.audiometrie.cell.height*3,
        pos.audiometrie.left + pos.audiometrie.width,
        pos.audiometrie.top + pos.audiometrie.cell.height*3
    );
    doc.line(
        pos.audiometrie.left,
        pos.audiometrie.top + pos.audiometrie.cell.height*4,
        pos.audiometrie.left + pos.audiometrie.width,
        pos.audiometrie.top + pos.audiometrie.cell.height*4
    );
    doc.setFontSize(8);
    if(report.rapport.fields[0].data.type !== "Champ Libre"){
        doc.text("MSP 3",
            pos.audiometrie.left + pos.audiometrie.cell.width*4.5,
            pos.audiometrie.top + pos.audiometrie.cell.height * 2 - 3, "center");
        doc.text("MSP 4",
            pos.audiometrie.left + pos.audiometrie.cell.width*4.5,
            pos.audiometrie.top + pos.audiometrie.cell.height * 4 - 2, "center");
        doc.text("SRP",
            pos.audiometrie.left + pos.audiometrie.cell.width*5.5,
            pos.audiometrie.top + pos.audiometrie.cell.height * 2 - 3, "center");
        if(!report.rapport.fields[4].data.ndc){
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
        doc.text(report.rapport.fields[4].data.droite.msp.freq3,
            pos.audiometrie.left + pos.audiometrie.cell.width*5 - 14,
            pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, 'right');
        doc.text(report.rapport.fields[4].data.droite.msp.freq4,
            pos.audiometrie.left + pos.audiometrie.cell.width*5 - 14,
            pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, 'right');
        doc.text(report.rapport.fields[4].data.droite.srp,
            pos.audiometrie.left + pos.audiometrie.cell.width*6 - 14,
            pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, 'right');
        if(!report.rapport.fields[4].data.ndc){
            doc.text(report.rapport.fields[4].data.droite.sdp,
                pos.audiometrie.left + pos.audiometrie.cell.width*6 - 14,
                pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, 'right')
        }else{
            doc.text(report.rapport.fields[4].data.droite.ndc,
                pos.audiometrie.left + pos.audiometrie.cell.width*6 - 14,
                pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, 'right')
        }
    }else{
        doc.text("MSP 3",
            pos.audiometrie.left + pos.audiometrie.cell.width*3.5,
            pos.audiometrie.top + pos.audiometrie.cell.height * 2 - 3, "center");
        doc.text("MSP 4",
            pos.audiometrie.left + pos.audiometrie.cell.width*3.5,
            pos.audiometrie.top + pos.audiometrie.cell.height * 4 - 2, "center");
        doc.text("SRP",
            pos.audiometrie.left + pos.audiometrie.cell.width*4.5,
            pos.audiometrie.top + pos.audiometrie.cell.height * 2 - 3, "center");
        if(!report.rapport.fields[4].data.ndc){
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
        doc.text(report.rapport.fields[4].data.droite.msp.freq3,
            pos.audiometrie.left + pos.audiometrie.cell.width*4 - 14,
            pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, 'right');
        doc.text(report.rapport.fields[4].data.droite.msp.freq4,
            pos.audiometrie.left + pos.audiometrie.cell.width*4 - 14,
            pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, 'right');
        doc.text(report.rapport.fields[4].data.droite.srp,
            pos.audiometrie.left + pos.audiometrie.cell.width*5 - 14,
            pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, 'right');
        if(!report.rapport.fields[4].data.ndc){
            doc.text(report.rapport.fields[4].data.droite.sdp,
                pos.audiometrie.left + pos.audiometrie.cell.width*5 - 14,
                pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, 'right')
        }else{
            doc.text(report.rapport.fields[4].data.droite.ndc,
                pos.audiometrie.left + pos.audiometrie.cell.width*5 - 14,
                pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, 'right')
        }
    }
    doc.setTextColor('#000000');
    doc.setFontStyle('normal');
    doc.text("Identification",
        pos.audiometrie.left + pos.audiometrie.cell.width*2,
        pos.audiometrie.top + pos.audiometrie.cell.height - 2, "center");
    doc.text("Résultat",
        pos.audiometrie.left + pos.audiometrie.cell.width*0.5,
        pos.audiometrie.top + pos.audiometrie.cell.height*3 - 3, "center");
    doc.text("Niveau",
        pos.audiometrie.left + pos.audiometrie.cell.width*0.5,
        pos.audiometrie.top + pos.audiometrie.cell.height*4 - 3, "center");
    doc.text("Masking",
        pos.audiometrie.left + pos.audiometrie.cell.width*0.5,
        pos.audiometrie.top + pos.audiometrie.cell.height*5 - 3, "center");
    doc.text("Mono",
        pos.audiometrie.left + pos.audiometrie.cell.width*1.5,
        pos.audiometrie.top + pos.audiometrie.cell.height*2 - 3, "center");
    if(report.rapport.fields[0].data.type !== "Champ Libre"){
        doc.text("Mono",
            pos.audiometrie.left + pos.audiometrie.cell.width*2.5,
            pos.audiometrie.top + pos.audiometrie.cell.height*2 - 3, "center");
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
    doc.text(report.rapport.fields[4].data.droite.identification.premier.resultat,
        pos.audiometrie.left + pos.audiometrie.cell.width*2 - 14,
        pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, 'right');
    doc.text(report.rapport.fields[4].data.droite.identification.premier.niveau,
        pos.audiometrie.left + pos.audiometrie.cell.width*2 - 14,
        pos.audiometrie.top + pos.audiometrie.cell.height*4 - 2, 'right');
    doc.text(report.rapport.fields[4].data.droite.identification.premier.masking,
        pos.audiometrie.left + pos.audiometrie.cell.width*2 - 14,
        pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, 'right');
    if(report.rapport.fields[0].data.type !== "Champ Libre"){
        doc.text(report.rapport.fields[4].data.droite.identification.deuxieme.resultat,
            pos.audiometrie.left + pos.audiometrie.cell.width*3 - 14,
            pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, 'right');
        doc.text(report.rapport.fields[4].data.droite.identification.deuxieme.niveau,
            pos.audiometrie.left + pos.audiometrie.cell.width*3 - 14,
            pos.audiometrie.top + pos.audiometrie.cell.height*4 - 2, 'right');
        doc.text(report.rapport.fields[4].data.droite.identification.deuxieme.masking,
            pos.audiometrie.left + pos.audiometrie.cell.width*3 - 14,
            pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, 'right')
    }
    if(report.rapport.fields[4].data.binaural){
        if(report.rapport.fields[0].data.type !== "Champ Libre"){
            doc.text(report.rapport.fields[4].data.both.resultat,
                pos.audiometrie.left + pos.audiometrie.cell.width*4 - 14,
                pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, 'right');
            doc.text(report.rapport.fields[4].data.both.niveau,
                pos.audiometrie.left + pos.audiometrie.cell.width*4 - 14,
                pos.audiometrie.top + pos.audiometrie.cell.height*4 - 2, 'right');
            doc.text(report.rapport.fields[4].data.both.masking,
                pos.audiometrie.left + pos.audiometrie.cell.width*4 - 14,
                pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, 'right');
        }else{
            doc.text(report.rapport.fields[4].data.both.resultat,
                pos.audiometrie.left + pos.audiometrie.cell.width*3 - 14,
                pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, 'right');
            doc.text(report.rapport.fields[4].data.both.niveau,
                pos.audiometrie.left + pos.audiometrie.cell.width*3 - 14,
                pos.audiometrie.top + pos.audiometrie.cell.height*4 - 2, 'right');
            doc.text(report.rapport.fields[4].data.both.masking,
                pos.audiometrie.left + pos.audiometrie.cell.width*3 - 14,
                pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, 'right');
        }
    }
    doc.setTextColor('#000000');
    doc.setFontStyle('normal');
    doc.setFontSize(5);
    doc.text("dBHL",
        pos.audiometrie.left + pos.audiometrie.cell.width*5 - 1,
        pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, "right");
    doc.text("dBHL",
        pos.audiometrie.left + pos.audiometrie.cell.width*5 - 1,
        pos.audiometrie.top + pos.audiometrie.height - 2, "right");
    if(report.rapport.fields[0].data.type !== "Champ Libre"){
        doc.text("dBHL",
            pos.audiometrie.left + pos.audiometrie.cell.width*6 - 1,
            pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, "right");
        doc.text("dBHL",
            pos.audiometrie.left + pos.audiometrie.cell.width*6 - 1,
            pos.audiometrie.top + pos.audiometrie.height - 2, "right")
    }else{
        doc.text("dBHL",
            pos.audiometrie.left + pos.audiometrie.cell.width*4 - 1,
            pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, "right");
        doc.text("dBHL",
            pos.audiometrie.left + pos.audiometrie.cell.width*4 - 1,
            pos.audiometrie.top + pos.audiometrie.height - 2, "right")
    }
    doc.text("%",
        pos.audiometrie.left + pos.audiometrie.cell.width*2 - 1,
        pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, "right");
    doc.text("%",
        pos.audiometrie.left + pos.audiometrie.cell.width*3 - 1,
        pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, "right");
    if(report.rapport.fields[0].data.type !== "Champ Libre"){
        doc.text("%",
            pos.audiometrie.left + pos.audiometrie.cell.width*4 - 1,
            pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, "right")
    }
    doc.text("dBHL",
        pos.audiometrie.left + pos.audiometrie.cell.width*2 - 1,
        pos.audiometrie.top + pos.audiometrie.cell.height*4 - 2, "right");
    doc.text("dBHL",
        pos.audiometrie.left + pos.audiometrie.cell.width*3 - 1,
        pos.audiometrie.top + pos.audiometrie.cell.height*4 - 2, "right");
    if(report.rapport.fields[0].data.type !== "Champ Libre"){
        doc.text("dBHL",
            pos.audiometrie.left + pos.audiometrie.cell.width*4 - 1,
            pos.audiometrie.top + pos.audiometrie.cell.height*4 - 2, "right")
    }
    doc.text("dBHL",
        pos.audiometrie.left + pos.audiometrie.cell.width*2 - 1,
        pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, "right");
    doc.text("dBHL",
        pos.audiometrie.left + pos.audiometrie.cell.width*3 - 1,
        pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, "right");
    if(report.rapport.fields[0].data.type !== "Champ Libre"){
        doc.text("dBHL",
            pos.audiometrie.left + pos.audiometrie.cell.width*4 - 1,
            pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, "right")
    }
    doc.setFontSize(8)




    doc.setFontStyle("bold");
    doc.text("AUDIOMÉTRIE VOCALE",
        pos.audiometrie.left + pos.audiometrie.width + pos.audiometrie.gap/2,
        pos.audiometrie.top -1, "center");
    doc.setFontStyle("normal");


    if(report.rapport.fields[0].data.type === "Champ Libre"){
        doc.rect(
            pos.audiometrie.left + pos.audiometrie.width + 3,
            pos.audiometrie.top + 5,
            pos.checkbox.width,
            pos.checkbox.height
        );
        doc.text("Matériel\nEnregistré",
            pos.audiometrie.left + pos.audiometrie.width + 2 + pos.checkbox.width + pos.checkbox.gap,
            pos.audiometrie.top + 11
        );
        if(report.rapport.fields[4].data.materielEnregistre){
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
        );
        doc.setFontStyle('normal');
        doc.text(report.rapport.fields[4].data.langue,
            pos.audiometrie.left + pos.audiometrie.width + 4 + pos.checkbox.width + pos.checkbox.gap + 75,
            pos.audiometrie.top + 17,
            "center"
        );
        doc.setFontStyle('bold');
        doc.text("Liste utilisée :",
            pos.audiometrie.left + pos.audiometrie.width + pos.audiometrie.gap/2,
            pos.audiometrie.top + 32,
            "right"
        );
        doc.setFontStyle('normal');
        doc.text(report.rapport.fields[4].data.liste,
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
        );
        doc.text("Matériel\nEnregistré",
            pos.audiometrie.left + pos.audiometrie.width + 2 + pos.checkbox.width + pos.checkbox.gap,
            pos.audiometrie.top + 21
        );
        if(report.rapport.fields[4].data.materielEnregistre){
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
        );
        doc.setFontStyle('normal');
        doc.text(report.rapport.fields[4].data.langue,
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
    );
    doc.text("Identification\nd'images",
        pos.audiometrie.left + pos.audiometrie.width + 2 + pos.checkbox.width + pos.checkbox.gap,
        pos.audiometrie.top + 46
    );
    if(report.rapport.fields[4].data.identificationImages){
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
        pos.audiometrie.top - 5, "center");
    doc.setFillColor("#cccccc");
    doc.rect(
        pos.audiometrie.left,
        pos.audiometrie.top + pos.audiometrie.cell.height,
        pos.audiometrie.cell.width * 2,
        pos.audiometrie.cell.height, "F");
    doc.rect(
        pos.audiometrie.left,
        pos.audiometrie.top + pos.audiometrie.cell.height*3,
        pos.audiometrie.cell.width * 2,
        pos.audiometrie.cell.height, "F");
    if(report.rapport.fields[0].data.type !== "Champ Libre"){
        doc.rect(
            pos.audiometrie.left + pos.audiometrie.cell.width * 2,
            pos.audiometrie.top,
            pos.audiometrie.cell.width * 4,
            pos.audiometrie.cell.height, "F");
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
            pos.audiometrie.cell.height, "F");
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
    );
    doc.line(
        pos.audiometrie.left + pos.audiometrie.cell.width,
        pos.audiometrie.top + pos.audiometrie.cell.height,
        pos.audiometrie.left + pos.audiometrie.cell.width,
        pos.audiometrie.top + pos.audiometrie.height
    );
    doc.line(
        pos.audiometrie.left + pos.audiometrie.cell.width*3,
        pos.audiometrie.top + pos.audiometrie.cell.height,
        pos.audiometrie.left + pos.audiometrie.cell.width*3,
        pos.audiometrie.top + pos.audiometrie.height
    );
    doc.line(
        pos.audiometrie.left + pos.audiometrie.cell.width*4,
        pos.audiometrie.top + pos.audiometrie.cell.height,
        pos.audiometrie.left + pos.audiometrie.cell.width*4,
        pos.audiometrie.top + pos.audiometrie.height
    );
    if(report.rapport.fields[0].data.type !== "Champ Libre"){
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
    );
    doc.line(
        pos.audiometrie.left,
        pos.audiometrie.top + pos.audiometrie.cell.height*2,
        pos.audiometrie.left + pos.audiometrie.width,
        pos.audiometrie.top + pos.audiometrie.cell.height*2
    );
    doc.line(
        pos.audiometrie.left,
        pos.audiometrie.top + pos.audiometrie.cell.height*3,
        pos.audiometrie.left + pos.audiometrie.width,
        pos.audiometrie.top + pos.audiometrie.cell.height*3
    );
    doc.line(
        pos.audiometrie.left,
        pos.audiometrie.top + pos.audiometrie.cell.height*4,
        pos.audiometrie.left + pos.audiometrie.width,
        pos.audiometrie.top + pos.audiometrie.cell.height*4
    );
    doc.setFontSize(8);
    doc.text("MSP 3",
        pos.audiometrie.left + pos.audiometrie.cell.width/2,
        pos.audiometrie.top + pos.audiometrie.cell.height * 2 - 3, "center");
    doc.text("MSP 4",
        pos.audiometrie.left + pos.audiometrie.cell.width/2,
        pos.audiometrie.top + pos.audiometrie.cell.height * 4 - 2, "center");
    doc.text("SRP",
        pos.audiometrie.left + pos.audiometrie.cell.width*1.5,
        pos.audiometrie.top + pos.audiometrie.cell.height * 2 - 3, "center");
    if(!report.rapport.fields[4].data.ndc){
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
    doc.text(report.rapport.fields[4].data.gauche.msp.freq3,
        pos.audiometrie.left + pos.audiometrie.cell.width - 14,
        pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, 'right');
    doc.text(report.rapport.fields[4].data.gauche.msp.freq4,
        pos.audiometrie.left + pos.audiometrie.cell.width - 14,
        pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, 'right');
    doc.text(report.rapport.fields[4].data.gauche.srp,
        pos.audiometrie.left + pos.audiometrie.cell.width*2 - 14,
        pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, 'right');
    if(!report.rapport.fields[4].data.ndc){
        doc.text(report.rapport.fields[4].data.gauche.sdp,
            pos.audiometrie.left + pos.audiometrie.cell.width*2 - 14,
            pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, 'right')
    }else{
        doc.text(report.rapport.fields[4].data.gauche.ndc,
            pos.audiometrie.left + pos.audiometrie.cell.width*2 - 14,
            pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, 'right')
    }

    doc.setTextColor('#000000');
    doc.setFontStyle('normal');
    doc.text("Identification",
        pos.audiometrie.left + pos.audiometrie.cell.width*4,
        pos.audiometrie.top + pos.audiometrie.cell.height - 2, "center");
    doc.text("Résultat",
        pos.audiometrie.left + pos.audiometrie.cell.width*2.5,
        pos.audiometrie.top + pos.audiometrie.cell.height*3 - 3, "center");
    doc.text("Niveau",
        pos.audiometrie.left + pos.audiometrie.cell.width*2.5,
        pos.audiometrie.top + pos.audiometrie.cell.height*4 - 3, "center");
    doc.text("Masking",
        pos.audiometrie.left + pos.audiometrie.cell.width*2.5,
        pos.audiometrie.top + pos.audiometrie.cell.height*5 - 3, "center");
    doc.text("Mono",
        pos.audiometrie.left + pos.audiometrie.cell.width*3.5,
        pos.audiometrie.top + pos.audiometrie.cell.height*2 - 3, "center");
    if(report.rapport.fields[0].data.type !== "Champ Libre"){
        doc.text("Mono",
            pos.audiometrie.left + pos.audiometrie.cell.width*4.5,
            pos.audiometrie.top + pos.audiometrie.cell.height*2 - 3, "center");
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
    doc.text(report.rapport.fields[4].data.gauche.identification.premier.resultat,
        pos.audiometrie.left + pos.audiometrie.cell.width*4 - 14,
        pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, 'right');
    doc.text(report.rapport.fields[4].data.gauche.identification.premier.niveau,
        pos.audiometrie.left + pos.audiometrie.cell.width*4 - 14,
        pos.audiometrie.top + pos.audiometrie.cell.height*4 - 2, 'right');
    doc.text(report.rapport.fields[4].data.gauche.identification.premier.masking,
        pos.audiometrie.left + pos.audiometrie.cell.width*4 - 14,
        pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, 'right');
    if(report.rapport.fields[0].data.type !== "Champ Libre"){
        doc.text(report.rapport.fields[4].data.gauche.identification.deuxieme.resultat,
            pos.audiometrie.left + pos.audiometrie.cell.width*5 - 14,
            pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, 'right');
        doc.text(report.rapport.fields[4].data.gauche.identification.deuxieme.niveau,
            pos.audiometrie.left + pos.audiometrie.cell.width*5 - 14,
            pos.audiometrie.top + pos.audiometrie.cell.height*4 - 2, 'right');
        doc.text(report.rapport.fields[4].data.gauche.identification.deuxieme.masking,
            pos.audiometrie.left + pos.audiometrie.cell.width*5 - 14,
            pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, 'right');
        if(report.rapport.fields[4].data.binaural){
            doc.text(report.rapport.fields[4].data.both.resultat,
                pos.audiometrie.left + pos.audiometrie.cell.width*6 - 14,
                pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, 'right');
            doc.text(report.rapport.fields[4].data.both.niveau,
                pos.audiometrie.left + pos.audiometrie.cell.width*6 - 14,
                pos.audiometrie.top + pos.audiometrie.cell.height*4 - 2, 'right');
            doc.text(report.rapport.fields[4].data.both.masking,
                pos.audiometrie.left + pos.audiometrie.cell.width*6 - 14,
                pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, 'right')
        }
    }else{
        if(report.rapport.fields[4].data.binaural){
            doc.text(report.rapport.fields[4].data.both.resultat,
                pos.audiometrie.left + pos.audiometrie.cell.width*5 - 14,
                pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, 'right');
            doc.text(report.rapport.fields[4].data.both.niveau,
                pos.audiometrie.left + pos.audiometrie.cell.width*5 - 14,
                pos.audiometrie.top + pos.audiometrie.cell.height*4 - 2, 'right');
            doc.text(report.rapport.fields[4].data.both.masking,
                pos.audiometrie.left + pos.audiometrie.cell.width*5 - 14,
                pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, 'right')
        }
    }
    doc.setTextColor('#000000');
    doc.setFontStyle('normal');
    doc.setFontSize(5);
    doc.text("dBHL",
        pos.audiometrie.left + pos.audiometrie.cell.width - 1,
        pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, "right");
    doc.text("dBHL",
        pos.audiometrie.left + pos.audiometrie.cell.width - 1,
        pos.audiometrie.top + pos.audiometrie.height - 2, "right");
    doc.text("dBHL",
        pos.audiometrie.left + pos.audiometrie.cell.width*2 - 1,
        pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, "right");
    doc.text("dBHL",
        pos.audiometrie.left + pos.audiometrie.cell.width*2 - 1,
        pos.audiometrie.top + pos.audiometrie.height - 2, "right");
    doc.text("%",
        pos.audiometrie.left + pos.audiometrie.cell.width*4 - 1,
        pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, "right");
    doc.text("%",
        pos.audiometrie.left + pos.audiometrie.cell.width*5 - 1,
        pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, "right");
    if(report.rapport.fields[0].data.type !== "Champ Libre"){
        doc.text("%",
            pos.audiometrie.left + pos.audiometrie.cell.width*6 - 1,
            pos.audiometrie.top + pos.audiometrie.cell.height*3 - 2, "right")
    }
    doc.text("dBHL",
        pos.audiometrie.left + pos.audiometrie.cell.width*4 - 1,
        pos.audiometrie.top + pos.audiometrie.cell.height*4 - 2, "right");
    doc.text("dBHL",
        pos.audiometrie.left + pos.audiometrie.cell.width*5 - 1,
        pos.audiometrie.top + pos.audiometrie.cell.height*4 - 2, "right");
    if(report.rapport.fields[0].data.type !== "Champ Libre"){
        doc.text("dBHL",
            pos.audiometrie.left + pos.audiometrie.cell.width*6 - 1,
            pos.audiometrie.top + pos.audiometrie.cell.height*4 - 2, "right")
    }
    doc.text("dBHL",
        pos.audiometrie.left + pos.audiometrie.cell.width*4 - 1,
        pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, "right");
    doc.text("dBHL",
        pos.audiometrie.left + pos.audiometrie.cell.width*5 - 1,
        pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, "right");
    if(report.rapport.fields[0].data.type !== "Champ Libre"){
        doc.text("dBHL",
            pos.audiometrie.left + pos.audiometrie.cell.width*6 - 1,
            pos.audiometrie.top + pos.audiometrie.cell.height*5 - 2, "right")
    }
    doc.setFontSize(8)

    ////////// Champ Libre extra audiometrie values //////////////////////
    if(report.rapport.fields[0].data.type === "Champ Libre"){
        let extra = {
            height: 35,
            width: 160,
            top: pos.audiometrie.top + pos.audiometrie.height + 14,
            left: (pos.tympanometrie.left + pos.audiometrie.width + pos.audiometrie.gap/2) - 80
        };
        extra = {
            ...extra,
            cell:{
                width: extra.width/4
            }
        };

        doc.text(
            "CHAMP LIBRE",
            pos.tympanometrie.left + pos.audiometrie.width + pos.audiometrie.gap/2,
            extra.top - 2,
            "center"
        );
        doc.rect(
            extra.left,
            extra.top,
            extra.width,
            extra.height
        );
        let values = {
            "MSP 3" : report.rapport.fields[4].data.champLibre.msp.freq3,
            "MSP 4" : report.rapport.fields[4].data.champLibre.msp.freq4,
            "SRP" : report.rapport.fields[4].data.champLibre.srp,
            "SDP" : report.rapport.fields[4].data.champLibre.sdp
        };
        let n = 0;
        for(let keys in values){
            doc.setFontSize(8);
            if(keys === "SDP" && report.rapport.fields[4].data.ndc){
                doc.text(
                    "NDC",
                    extra.left + extra.cell.width/2 + extra.cell.width*n,
                    extra.top + 8,
                    "center"
                );
                doc.setFontSize(10);
                doc.text(
                    report.rapport.fields[4].data.champLibre.ndc,
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
                );
                doc.setFontSize(10);
                doc.text(
                    values[keys],
                    extra.left + extra.cell.width/2 + extra.cell.width*n,
                    extra.top + extra.height - 10,
                    "center"
                )
            }
            doc.setFontSize(5);
            doc.text("dBHL",
                extra.left + extra.cell.width*(n+1) - 1,
                extra.top + extra.height - 3, "right");
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
    );
    doc.line(
        pos.tympanometrie.left + pos.tympanometrie.cell.width,
        pos.tympanometrie.top,
        pos.tympanometrie.left + pos.tympanometrie.cell.width,
        pos.tympanometrie.top + pos.tympanometrie.height
    );
    doc.line(
        pos.tympanometrie.left + pos.tympanometrie.cell.width*2,
        pos.tympanometrie.top,
        pos.tympanometrie.left + pos.tympanometrie.cell.width*2,
        pos.tympanometrie.top + pos.tympanometrie.height
    );
    doc.line(
        pos.tympanometrie.left + pos.tympanometrie.cell.width*3,
        pos.tympanometrie.top,
        pos.tympanometrie.left + pos.tympanometrie.cell.width*3,
        pos.tympanometrie.top + pos.tympanometrie.height
    );
    doc.rect(
        pos.tympanometrie.left + pos.tympanometrie.width,
        pos.tympanometrie.top + 10,
        pos.tympanometrie.extraCell.width,
        pos.tympanometrie.extraCell.height
    );
    doc.text("Pression",
        pos.tympanometrie.left + pos.tympanometrie.cell.width/2,
        pos.tympanometrie.top + 7, "center");
    doc.text("Compliance",
        pos.tympanometrie.left + pos.tympanometrie.cell.width*1.5,
        pos.tympanometrie.top + 7, "center");
    doc.text("Volume",
        pos.tympanometrie.left + pos.tympanometrie.cell.width*2.5,
        pos.tympanometrie.top + 7, "center");
    if(report.rapport.fields[0].data.type !== "Champ Libre"){
        doc.text("Gradient",
            pos.tympanometrie.left + pos.tympanometrie.cell.width*3.5,
            pos.tympanometrie.top + 7, "center")
    }
    doc.text("Type",
        pos.tympanometrie.left + pos.tympanometrie.width + pos.tympanometrie.extraCell.width/2,
        pos.tympanometrie.top + 10 + 7, "center");
    doc.setFontSize(10)
    doc.text(report.rapport.fields[2].data.droite.pression,
        pos.tympanometrie.left + pos.tympanometrie.cell.width/2,
        pos.tympanometrie.top + pos.tympanometrie.cell.height - 9, "center");
    doc.text(report.rapport.fields[2].data.droite.compliance,
        pos.tympanometrie.left + pos.tympanometrie.cell.width*1.5,
        pos.tympanometrie.top + pos.tympanometrie.cell.height - 9, "center");
    doc.text(report.rapport.fields[2].data.droite.volume,
        pos.tympanometrie.left + pos.tympanometrie.cell.width*2.5,
        pos.tympanometrie.top + pos.tympanometrie.cell.height - 9, "center");
    if(report.rapport.fields[0].data.type !== "Champ Libre"){
        doc.text(report.rapport.fields[2].data.droite.gradient,
            pos.tympanometrie.left + pos.tympanometrie.cell.width*3.5,
            pos.tympanometrie.top + pos.tympanometrie.cell.height - 9, "center")
    }
    doc.text(report.rapport.fields[2].data.droite.type,
        pos.tympanometrie.left + pos.tympanometrie.width + pos.tympanometrie.extraCell.width/2,
        pos.tympanometrie.top + 10 + pos.tympanometrie.extraCell.height - 3, "center");
    doc.setFontSize(6)
    doc.text("daPa",
        pos.tympanometrie.left + pos.tympanometrie.cell.width - 1.5,
        pos.tympanometrie.top + pos.tympanometrie.cell.height - 2, "right");
    doc.text("mL",
        pos.tympanometrie.left + pos.tympanometrie.cell.width*2 - 1.5,
        pos.tympanometrie.top + pos.tympanometrie.cell.height - 2, "right");
    doc.text("mL",
        pos.tympanometrie.left + pos.tympanometrie.cell.width*3 - 1.5,
        pos.tympanometrie.top + pos.tympanometrie.cell.height - 2,"right");
    if(report.rapport.fields[0].data.type !== "Champ Libre"){
        doc.text("daPa",
            pos.tympanometrie.left + pos.tympanometrie.cell.width*4 - 1.5,
            pos.tympanometrie.top + pos.tympanometrie.cell.height - 2,"right")
    }
    doc.setFontSize(8);

    doc.setFontStyle("bold");
    doc.text("TYMPANOMÉTRIE",
        pos.tympanometrie.left + pos.tympanometrie.width + pos.tympanometrie.gap/2,
        pos.tympanometrie.top + 4, "center");
    doc.setFontStyle("normal")
    if(report.rapport.fields[0].data.type === "Champ Libre"){
        doc.text("226hz",
            pos.tympanometrie.left + pos.tympanometrie.width + pos.tympanometrie.gap/2 -5,
            pos.tympanometrie.top + 16,
            "left"
        );
        doc.text("1000hz",
            pos.tympanometrie.left + pos.tympanometrie.width + pos.tympanometrie.gap/2 -5,
            pos.tympanometrie.top + 26,
            "left"
        );
        doc.rect(
            pos.tympanometrie.left + pos.tympanometrie.width + pos.tympanometrie.gap/2 -5 - pos.checkbox.width - pos.checkbox.gap,
            pos.tympanometrie.top + 16 - 7,
            pos.checkbox.width,
            pos.checkbox.height
        );
        if(report.rapport.fields[2].data.freq === "226hz"){
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
        );
        if(report.rapport.fields[2].data.freq === "1000hz"){
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
    );
    doc.line(
        pos.tympanometrie.left + pos.tympanometrie.cell.width,
        pos.tympanometrie.top,
        pos.tympanometrie.left + pos.tympanometrie.cell.width,
        pos.tympanometrie.top + pos.tympanometrie.height
    );
    doc.line(
        pos.tympanometrie.left + pos.tympanometrie.cell.width*2,
        pos.tympanometrie.top,
        pos.tympanometrie.left + pos.tympanometrie.cell.width*2,
        pos.tympanometrie.top + pos.tympanometrie.height
    );
    doc.line(
        pos.tympanometrie.left + pos.tympanometrie.cell.width*3,
        pos.tympanometrie.top,
        pos.tympanometrie.left + pos.tympanometrie.cell.width*3,
        pos.tympanometrie.top + pos.tympanometrie.height
    );
    doc.rect(
        pos.tympanometrie.left - pos.tympanometrie.extraCell.width,
        pos.tympanometrie.top + 10,
        pos.tympanometrie.extraCell.width,
        pos.tympanometrie.extraCell.height
    );
    doc.text("Pression",
        pos.tympanometrie.left + pos.tympanometrie.cell.width/2,
        pos.tympanometrie.top + 7, "center");
    doc.text("Compliance",
        pos.tympanometrie.left + pos.tympanometrie.cell.width*1.5,
        pos.tympanometrie.top + 7, "center");
    doc.text("Volume",
        pos.tympanometrie.left + pos.tympanometrie.cell.width*2.5,
        pos.tympanometrie.top + 7, "center");
    if(report.rapport.fields[0].data.type !== "Champ Libre"){
        doc.text("Gradient",
            pos.tympanometrie.left + pos.tympanometrie.cell.width*3.5,
            pos.tympanometrie.top + 7, "center")
    }
    doc.text("Type",
        pos.tympanometrie.left - pos.tympanometrie.extraCell.width/2,
        pos.tympanometrie.top + 10 + 7, "center");
    doc.setFontSize(10);
    doc.text(report.rapport.fields[2].data.gauche.pression,
        pos.tympanometrie.left + pos.tympanometrie.cell.width/2,
        pos.tympanometrie.top + pos.tympanometrie.cell.height - 9, "center");
    doc.text(report.rapport.fields[2].data.gauche.compliance,
        pos.tympanometrie.left + pos.tympanometrie.cell.width*1.5,
        pos.tympanometrie.top + pos.tympanometrie.cell.height - 9, "center");
    doc.text(report.rapport.fields[2].data.gauche.volume,
        pos.tympanometrie.left + pos.tympanometrie.cell.width*2.5,
        pos.tympanometrie.top + pos.tympanometrie.cell.height - 9, "center");
    if(report.rapport.fields[0].data.type !== "Champ Libre"){
        doc.text(report.rapport.fields[2].data.gauche.gradient,
            pos.tympanometrie.left + pos.tympanometrie.cell.width*3.5,
            pos.tympanometrie.top + pos.tympanometrie.cell.height - 9, "center")
    }
    doc.text(report.rapport.fields[2].data.gauche.type,
        pos.tympanometrie.left - pos.tympanometrie.extraCell.width/2,
        pos.tympanometrie.top + 10 + pos.tympanometrie.extraCell.height - 3, "center");
    doc.setFontSize(6);
    doc.text("daPa",
        pos.tympanometrie.left + pos.tympanometrie.cell.width - 1.5,
        pos.tympanometrie.top + pos.tympanometrie.cell.height - 2, "right");
    doc.text("mL",
        pos.tympanometrie.left + pos.tympanometrie.cell.width*2 - 1.5,
        pos.tympanometrie.top + pos.tympanometrie.cell.height - 2, "right");
    doc.text("mL",
        pos.tympanometrie.left + pos.tympanometrie.cell.width*3 - 1.5,
        pos.tympanometrie.top + pos.tympanometrie.cell.height - 2,"right");
    if(report.rapport.fields[0].data.type !== "Champ Libre"){
        doc.text("daPa",
            pos.tympanometrie.left + pos.tympanometrie.cell.width*4 - 1.5,
            pos.tympanometrie.top + pos.tympanometrie.cell.height - 2,"right")
    }
    doc.setFontSize(8);


    doc.rect(
        pos.tympanometrie.graph.left,
        pos.tympanometrie.graph.top,
        pos.tympanometrie.graph.width,
        pos.tympanometrie.graph.height
    );
    for(let i = 1; i < 8; i++){
        doc.line(
            pos.tympanometrie.graph.left,
            pos.tympanometrie.graph.top + pos.tympanometrie.graph.cell.height * i,
            pos.tympanometrie.graph.left + pos.tympanometrie.graph.width,
            pos.tympanometrie.graph.top + pos.tympanometrie.graph.cell.height * i
        )
    }
    for(let i = 1; i < 6; i++){
        doc.line(
            pos.tympanometrie.graph.left + pos.tympanometrie.graph.cell.width * i,
            pos.tympanometrie.graph.top,
            pos.tympanometrie.graph.left + pos.tympanometrie.graph.cell.width * i,
            pos.tympanometrie.graph.top + pos.tympanometrie.graph.height
        )
    }
    let v = ["2.0", "1.0", '0'];
    let h = [-400, -200, 0, +200];
    for(let i in v){
        doc.text(v[i],
            pos.tympanometrie.graph.left - 2,
            pos.tympanometrie.graph.top + pos.tympanometrie.graph.cell.height*4 * i + 3, "right")
    }
    for(let i in h){
        doc.text(h[i].toString(),
            pos.tympanometrie.graph.left + pos.tympanometrie.graph.cell.width*2 * i,
            pos.tympanometrie.graph.top + pos.tympanometrie.graph.height + 10, "center")
    }
    for(let i in report.rapport.fields[2].data.droite.graph.data){
        let path = report.rapport.fields[2].data.droite.graph.data[i];
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
    for(let i in report.rapport.fields[2].data.gauche.graph.data){
        let path = report.rapport.fields[2].data.gauche.graph.data[i];
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
    if(report.rapport.fields[0].data.type !== "Champ Libre"){
        doc.setFillColor("#cccccc");
        doc.rect(
            pos.seuils.left,
            pos.seuils.top,
            pos.seuils.width,
            pos.seuils.cell.height, "F");
        doc.rect(pos.seuils.left, pos.seuils.top, pos.seuils.width, pos.seuils.height);
        doc.line(
            pos.seuils.left + pos.seuils.cell.width*2,
            pos.seuils.top,
            pos.seuils.left + pos.seuils.cell.width*2,
            pos.seuils.top + pos.seuils.height
        );
        doc.line(
            pos.seuils.left + pos.seuils.cell.width*3,
            pos.seuils.top,
            pos.seuils.left + pos.seuils.cell.width*3,
            pos.seuils.top + pos.seuils.height
        );
        doc.line(
            pos.seuils.left + pos.seuils.cell.width*4,
            pos.seuils.top,
            pos.seuils.left + pos.seuils.cell.width*4,
            pos.seuils.top + pos.seuils.height
        );
        doc.line(
            pos.seuils.left + pos.seuils.cell.width*5,
            pos.seuils.top,
            pos.seuils.left + pos.seuils.cell.width*5,
            pos.seuils.top + pos.seuils.height
        );
        doc.line(
            pos.seuils.left,
            pos.seuils.top + pos.seuils.cell.height,
            pos.seuils.left + pos.seuils.width,
            pos.seuils.top + pos.seuils.cell.height
        );
        doc.line(
            pos.seuils.left,
            pos.seuils.top + pos.seuils.cell.height*2,
            pos.seuils.left + pos.seuils.width,
            pos.seuils.top + pos.seuils.cell.height*2
        );
        doc.line(
            pos.seuils.left,
            pos.seuils.top + pos.seuils.cell.height*3,
            pos.seuils.left + pos.seuils.width,
            pos.seuils.top + pos.seuils.cell.height*3
        );
        doc.text("Stimulation droite",
            pos.seuils.left + 1,
            pos.seuils.top + pos.seuils.cell.height - 2);
        doc.text("Ipsilatérale",
            pos.seuils.left + 1,
            pos.seuils.top + pos.seuils.cell.height*2 - 2);
        doc.text("Controlatérale",
            pos.seuils.left + 1,
            pos.seuils.top + pos.seuils.cell.height*3 - 2);
        doc.text("Metz",
            pos.seuils.left + 1,
            pos.seuils.top + pos.seuils.cell.height*4 - 2);
        doc.text("500",
            pos.seuils.left + pos.seuils.cell.width*2.5,
            pos.seuils.top + pos.seuils.cell.height - 2, "center");
        doc.text("1000",
            pos.seuils.left + pos.seuils.cell.width*3.5,
            pos.seuils.top + pos.seuils.cell.height - 2, "center");
        doc.text("2000",
            pos.seuils.left + pos.seuils.cell.width*4.5,
            pos.seuils.top + pos.seuils.cell.height - 2, "center");
        doc.text("4000",
            pos.seuils.left + pos.seuils.cell.width*5.5,
            pos.seuils.top + pos.seuils.cell.height - 2, "center");

        let freqs = [500, 1000, 2000, 4000];
        let simulations = ["ipsilaterale", "controlaterale", "metz"];
        Object.keys(report.rapport.fields[3].data.droite).forEach(simulation => {
            Object.keys(report.rapport.fields[3].data.droite[simulation]).forEach(freq => {
                if(freq === "0")
                    return;

                doc.text(report.rapport.fields[3].data.droite[simulation][freq],
                    pos.seuils.left + pos.seuils.cell.width*2 + pos.seuils.cell.width * freqs.indexOf(Number(freq)) + pos.seuils.cell.width/2,
                    pos.seuils.top + pos.seuils.cell.height*2 + pos.seuils.cell.height * simulations.indexOf(simulation) - 2,
                    "center"
                )
            });
        });

        doc.setFontStyle("bold");
        doc.text("SEUILS DE\nRÉFLEXE\nSTAPÉDIEN",
            pos.seuils.left + pos.seuils.width + pos.seuils.gap/2,
            pos.seuils.top + pos.seuils.height/2 - 8, "center");
        doc.setFontStyle("normal");


        pos.seuils.left = pos.seuils.left + pos.seuils.width + pos.seuils.gap;
        doc.setFillColor("#cccccc");
        doc.rect(
            pos.seuils.left,
            pos.seuils.top,
            pos.seuils.width,
            pos.seuils.cell.height, "F");
        doc.rect(pos.seuils.left, pos.seuils.top, pos.seuils.width, pos.seuils.height);
        doc.line(
            pos.seuils.left + pos.seuils.cell.width*2,
            pos.seuils.top,
            pos.seuils.left + pos.seuils.cell.width*2,
            pos.seuils.top + pos.seuils.height
        );
        doc.line(
            pos.seuils.left + pos.seuils.cell.width*3,
            pos.seuils.top,
            pos.seuils.left + pos.seuils.cell.width*3,
            pos.seuils.top + pos.seuils.height
        );
        doc.line(
            pos.seuils.left + pos.seuils.cell.width*4,
            pos.seuils.top,
            pos.seuils.left + pos.seuils.cell.width*4,
            pos.seuils.top + pos.seuils.height
        );
        doc.line(
            pos.seuils.left + pos.seuils.cell.width*5,
            pos.seuils.top,
            pos.seuils.left + pos.seuils.cell.width*5,
            pos.seuils.top + pos.seuils.height
        );
        doc.line(
            pos.seuils.left,
            pos.seuils.top + pos.seuils.cell.height,
            pos.seuils.left + pos.seuils.width,
            pos.seuils.top + pos.seuils.cell.height
        );
        doc.line(
            pos.seuils.left,
            pos.seuils.top + pos.seuils.cell.height*2,
            pos.seuils.left + pos.seuils.width,
            pos.seuils.top + pos.seuils.cell.height*2
        );
        doc.line(
            pos.seuils.left,
            pos.seuils.top + pos.seuils.cell.height*3,
            pos.seuils.left + pos.seuils.width,
            pos.seuils.top + pos.seuils.cell.height*3
        );
        doc.text("Stimulation gauche",
            pos.seuils.left + 1,
            pos.seuils.top + pos.seuils.cell.height - 2);
        doc.text("Ipsilatérale",
            pos.seuils.left + 1,
            pos.seuils.top + pos.seuils.cell.height*2 - 2);
        doc.text("Controlatérale",
            pos.seuils.left + 1,
            pos.seuils.top + pos.seuils.cell.height*3 - 2);
        doc.text("Metz",
            pos.seuils.left + 1,
            pos.seuils.top + pos.seuils.cell.height*4 - 2);
        doc.text("500",
            pos.seuils.left + pos.seuils.cell.width*2.5,
            pos.seuils.top + pos.seuils.cell.height - 2, "center");
        doc.text("1000",
            pos.seuils.left + pos.seuils.cell.width*3.5,
            pos.seuils.top + pos.seuils.cell.height - 2, "center");
        doc.text("2000",
            pos.seuils.left + pos.seuils.cell.width*4.5,
            pos.seuils.top + pos.seuils.cell.height - 2, "center");
        doc.text("4000",
            pos.seuils.left + pos.seuils.cell.width*5.5,
            pos.seuils.top + pos.seuils.cell.height - 2, "center");


        Object.keys(report.rapport.fields[3].data.gauche).forEach(simulation => {
            Object.keys(report.rapport.fields[3].data.gauche[simulation]).forEach(freq => {
                if(freq === "0")
                    return;

                doc.text(report.rapport.fields[3].data.gauche[simulation][freq],
                    pos.seuils.left + pos.seuils.cell.width*2 + pos.seuils.cell.width * freqs.indexOf(Number(freq)) + pos.seuils.cell.width/2,
                    pos.seuils.top + pos.seuils.cell.height*2 + pos.seuils.cell.height * simulations.indexOf(simulation) - 2,
                    "center"
                )
            });
        });
    }

    //Divers
    doc.setFontStyle("bold");
    doc.text("VALIDITÉ :", pos.divers.left, pos.divers.top);
    doc.setFontStyle("normal");
    doc.rect(
        pos.divers.left,
        pos.divers.top + pos.divers.lineHeight -4,
        pos.checkbox.width, pos.checkbox.height);
    doc.text("Bonne",
        pos.divers.left + pos.checkbox.width + pos.checkbox.gap,
        pos.divers.top + pos.divers.lineHeight + 3);
    doc.rect(
        pos.divers.left,
        pos.divers.top + pos.divers.lineHeight*2 -4,
        pos.checkbox.width, pos.checkbox.height);
    doc.text("Moyenne",
        pos.divers.left + pos.checkbox.width + pos.checkbox.gap,
        pos.divers.top + pos.divers.lineHeight*2 + 3);
    doc.rect(
        pos.divers.left,
        pos.divers.top + pos.divers.lineHeight*3 -4,
        pos.checkbox.width, pos.checkbox.height);
    doc.text("Nulle",
        pos.divers.left + pos.checkbox.width + pos.checkbox.gap,
        pos.divers.top + pos.divers.lineHeight*3 + 3);
    doc.rect(
        pos.divers.left,
        pos.divers.top + pos.divers.lineHeight*4 -4,
        pos.checkbox.width, pos.checkbox.height);
    doc.text("Repos sonore\ninadéquat",
        pos.divers.left + pos.checkbox.width + pos.checkbox.gap,
        pos.divers.top + pos.divers.lineHeight*4 + 3);
    switch(report.rapport.fields[6].data.validite){
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
        default: {

        }
    }

    doc.setFontStyle("bold");
    doc.text("AUDIOMÈTRE :",
        pos.divers.left,
        pos.divers.top + pos.divers.lineHeight*7);
    doc.setFontStyle("normal");
    doc.text(report.rapport.fields[6].data.audiometre,
        pos.divers.left,
        pos.divers.top + pos.divers.lineHeight*8);
    doc.text("Calibration :",
        pos.divers.left,
        pos.divers.top + pos.divers.lineHeight*9);
    let calibrationArr = report.rapport.fields[6].data.calibration.split("/");
    doc.text(calibrationArr[2] + " " + mois[calibrationArr[1] - 1] + " " + calibrationArr[0],
        pos.divers.left,
        pos.divers.top + pos.divers.lineHeight*10);

    doc.setFontStyle("bold");
    if(report.rapport.fields[6].data.methode === "Oui"){
        doc.text("NORME ANSI\nSÉRIE S3\nEN VIGUEUR",
            pos.divers.left,
            pos.divers.top + pos.divers.lineHeight*11.5)
    }else{
        doc.text("NORME ANSI\nSÉRIE S3 PAS\nEN VIGUEUR",
            pos.divers.left,
            pos.divers.top + pos.divers.lineHeight*11.5)
    }
    if(report.rapport.fields[0].data.type !== "Champ Libre"){
        doc.text("TRANSDUCTEUR :",
            pos.divers.left,
            pos.divers.top + pos.divers.lineHeight*15);
        doc.setFontStyle("normal");
        doc.rect(
            pos.divers.left,
            pos.divers.top + pos.divers.lineHeight*16 -4,
            pos.checkbox.width, pos.checkbox.height);
        doc.text("Intra-auriculaire",
            pos.divers.left + pos.checkbox.width + pos.checkbox.gap,
            pos.divers.top + pos.divers.lineHeight*16 + 3);
        doc.rect(
            pos.divers.left,
            pos.divers.top + pos.divers.lineHeight*17 -4,
            pos.checkbox.width, pos.checkbox.height);
        doc.text("Supra-auriculaire",
            pos.divers.left + pos.checkbox.width + pos.checkbox.gap,
            pos.divers.top + pos.divers.lineHeight*17 + 3);
        doc.rect(
            pos.divers.left,
            pos.divers.top + pos.divers.lineHeight*18 -4,
            pos.checkbox.width, pos.checkbox.height);
        doc.text("Champ libre",
            pos.divers.left + pos.checkbox.width + pos.checkbox.gap,
            pos.divers.top + pos.divers.lineHeight*18 + 3);
        if(report.rapport.fields[6].data.transducteur.intra){
            doc.addImage(check, "png",
                pos.divers.left + 2,
                pos.divers.top + pos.divers.lineHeight*16 -4 -2,
                pos.checkbox.width +1,
                pos.checkbox.height +1);
        }
        if(report.rapport.fields[6].data.transducteur.supra){
            doc.addImage(check, "png",
                pos.divers.left + 2,
                pos.divers.top + pos.divers.lineHeight*17 -4 -2,
                pos.checkbox.width +1,
                pos.checkbox.height +1);
        }
        if(report.rapport.fields[6].data.transducteur.champLibre){
            doc.addImage(check, "png",
                pos.divers.left + 2,
                pos.divers.top + pos.divers.lineHeight*18 -4 -2,
                pos.checkbox.width +1,
                pos.checkbox.height +1);
        }
    }
    doc.setFontStyle("normal");

    doc.setFillColor("#cccccc");
    doc.rect(
        pos.divers.legend.left,
        pos.divers.legend.top,
        pos.divers.legend.width,
        pos.divers.legend.cell.height,"F");
    doc.rect(
        pos.divers.legend.left,
        pos.divers.legend.top + pos.divers.legend.cell.height*4,
        pos.divers.legend.width,
        pos.divers.legend.cell.height,"F");
    let height = pos.divers.legend.height + 22;
    if(report.rapport.fields[0].data.type === "Champ Libre"){
        height = pos.divers.legend.height + 22 + pos.divers.legend.cell.height;
    }
    doc.rect(
        pos.divers.legend.left,
        pos.divers.legend.top,
        pos.divers.legend.width,
        height
    );
    doc.setFontSize(7);
    doc.text("Conduction aérienne",
        pos.divers.legend.center,
        pos.divers.legend.top + pos.divers.legend.cell.height - 3, "center");
    doc.text("Conduction osseuse",
        pos.divers.legend.center,
        pos.divers.legend.top + pos.divers.legend.cell.height*5 - 3, "center");
    doc.setFontSize(8);
    doc.line(
        pos.divers.legend.left,
        pos.divers.legend.top + pos.divers.legend.cell.height,
        pos.divers.legend.left + pos.divers.legend.width,
        pos.divers.legend.top + pos.divers.legend.cell.height
    );
    doc.line(
        pos.divers.legend.left,
        pos.divers.legend.top + pos.divers.legend.cell.height*2,
        pos.divers.legend.left + pos.divers.legend.width,
        pos.divers.legend.top + pos.divers.legend.cell.height*2
    );
    doc.line(
        pos.divers.legend.left,
        pos.divers.legend.top + pos.divers.legend.cell.height*3,
        pos.divers.legend.left + pos.divers.legend.width,
        pos.divers.legend.top + pos.divers.legend.cell.height*3
    );
    doc.line(
        pos.divers.legend.left,
        pos.divers.legend.top + pos.divers.legend.cell.height*4,
        pos.divers.legend.left + pos.divers.legend.width,
        pos.divers.legend.top + pos.divers.legend.cell.height*4
    );
    doc.line(
        pos.divers.legend.left,
        pos.divers.legend.top + pos.divers.legend.cell.height*5,
        pos.divers.legend.left + pos.divers.legend.width,
        pos.divers.legend.top + pos.divers.legend.cell.height*5
    );
    doc.line(
        pos.divers.legend.left,
        pos.divers.legend.top + pos.divers.legend.cell.height*6,
        pos.divers.legend.left + pos.divers.legend.width,
        pos.divers.legend.top + pos.divers.legend.cell.height*6
    );
    doc.line(
        pos.divers.legend.left,
        pos.divers.legend.top + pos.divers.legend.cell.height*7-1,
        pos.divers.legend.left + pos.divers.legend.width,
        pos.divers.legend.top + pos.divers.legend.cell.height*7-1
    );
    doc.line(
        pos.divers.legend.left,
        pos.divers.legend.top + pos.divers.legend.cell.height*7+1,
        pos.divers.legend.left + pos.divers.legend.width,
        pos.divers.legend.top + pos.divers.legend.cell.height*7+1
    );
    doc.line(
        pos.divers.legend.left,
        pos.divers.legend.top + pos.divers.legend.height,
        pos.divers.legend.left + pos.divers.legend.width,
        pos.divers.legend.top + pos.divers.legend.height
    );
    if(report.rapport.fields[0].data.type === "Champ Libre"){
        doc.line(
            pos.divers.legend.left,
            pos.divers.legend.top + pos.divers.legend.height + 22,
            pos.divers.legend.left + pos.divers.legend.width,
            pos.divers.legend.top + pos.divers.legend.height + 22
        )
    }
    doc.text("Non masqué",
        pos.divers.legend.center,
        pos.divers.legend.top + pos.divers.legend.cell.height*2 -3, "center");
    doc.addImage(symbols.cercle, "png",
        pos.divers.legend.left + 1,
        pos.divers.legend.top + pos.divers.legend.cell.height*1 + 1,
        pos.divers.legend.icon.width,
        pos.divers.legend.icon.height
    );
    doc.addImage(symbols.x, "png",
        pos.divers.legend.left + pos.divers.legend.width - pos.divers.legend.icon.width - 1,
        pos.divers.legend.top + pos.divers.legend.cell.height*1 + 1,
        pos.divers.legend.icon.width,
        pos.divers.legend.icon.height
    );
    doc.text("Masqué",
        pos.divers.legend.center,
        pos.divers.legend.top + pos.divers.legend.cell.height*3 -3, "center");
    doc.addImage(symbols.triangle, "png",
        pos.divers.legend.left + 1,
        pos.divers.legend.top + pos.divers.legend.cell.height*2 + 1,
        pos.divers.legend.icon.width,
        pos.divers.legend.icon.height);
    doc.addImage(symbols.carre, "png",
        pos.divers.legend.left + pos.divers.legend.width - pos.divers.legend.icon.width - 1,
        pos.divers.legend.top + pos.divers.legend.cell.height*2 + 1,
        pos.divers.legend.icon.width,
        pos.divers.legend.icon.height);
    doc.text("Inconfort",
        pos.divers.legend.center,
        pos.divers.legend.top + pos.divers.legend.cell.height*4 -3, "center");
    doc.addImage(symbols.iRouge, "png",
        pos.divers.legend.left + 1,
        pos.divers.legend.top + pos.divers.legend.cell.height*3 + 1,
        pos.divers.legend.icon.width,
        pos.divers.legend.icon.height);
    doc.addImage(symbols.iBleu, "png",
        pos.divers.legend.left + pos.divers.legend.width - pos.divers.legend.icon.width - 1,
        pos.divers.legend.top + pos.divers.legend.cell.height*3 + 1,
        pos.divers.legend.icon.width,
        pos.divers.legend.icon.height);
    doc.text("Non Masqué",
        pos.divers.legend.center,
        pos.divers.legend.top + pos.divers.legend.cell.height*6 -3, "center");
    doc.addImage(symbols.flecheRouge, "png",
        pos.divers.legend.left + 1,
        pos.divers.legend.top + pos.divers.legend.cell.height*5 + 1,
        pos.divers.legend.icon.width,
        pos.divers.legend.icon.height);
    doc.addImage(symbols.flecheBleu, "png",
        pos.divers.legend.left + pos.divers.legend.width - pos.divers.legend.icon.width - 1,
        pos.divers.legend.top + pos.divers.legend.cell.height*5 + 1,
        pos.divers.legend.icon.width,
        pos.divers.legend.icon.height);
    doc.text("Masqué",
        pos.divers.legend.center,
        pos.divers.legend.top + pos.divers.legend.cell.height*7 -3, "center");
    doc.addImage(symbols.bracketRouge, "png",
        pos.divers.legend.left + 1,
        pos.divers.legend.top + pos.divers.legend.cell.height*6 + 1,
        pos.divers.legend.icon.width,
        pos.divers.legend.icon.height)
    doc.addImage(symbols.bracketBleu, "png",
        pos.divers.legend.left + pos.divers.legend.width - pos.divers.legend.icon.width - 1,
        pos.divers.legend.top + pos.divers.legend.cell.height*6 + 1,
        pos.divers.legend.icon.width,
        pos.divers.legend.icon.height);
    doc.text("Non Réponse",
        pos.divers.legend.center,
        pos.divers.legend.top + pos.divers.legend.cell.height*8 -3, "center");
    doc.addImage(symbols.nrRouge, "png",
        pos.divers.legend.left + 1,
        pos.divers.legend.top + pos.divers.legend.cell.height*7 + 1.5,
        pos.divers.legend.icon.width,
        pos.divers.legend.icon.height);
    doc.addImage(symbols.nrBleu, "png",
        pos.divers.legend.left + pos.divers.legend.width - pos.divers.legend.icon.width - 1,
        pos.divers.legend.top + pos.divers.legend.cell.height*7 + 1.5,
        pos.divers.legend.icon.width,
        pos.divers.legend.icon.height);


    doc.setFontSize(12)
    doc.setTextColor('#f15c5d');
    doc.text("*",
        pos.divers.legend.left + 2,
        pos.divers.legend.top + pos.divers.legend.cell.height*9 + 4.5);
    doc.setTextColor('#5d6bb2');
    doc.text("*",
        pos.divers.legend.left + pos.divers.legend.width - pos.divers.legend.icon.width + 4,
        pos.divers.legend.top + pos.divers.legend.cell.height*9 + 4.5);
    doc.setTextColor('#000000');
    doc.setFontSize(6)
    doc.text("Surassourdissement,\nmasque insuffisant,\nplateau impossible",
        pos.divers.legend.left + pos.divers.legend.width/2,
        pos.divers.legend.top + pos.divers.legend.cell.height*8.5,
        "center");

    doc.setFontSize(7)
    if(report.rapport.fields[0].data.type === "Champ Libre"){
        doc.text("Champ Libre",
            pos.divers.legend.center,
            pos.divers.legend.top + pos.divers.legend.cell.height*9 + 22 -3, "center");
        doc.addImage(symbols.champLibre, "png",
            pos.divers.legend.left + 1,
            pos.divers.legend.top + pos.divers.legend.cell.height*8 + 22 + 1.5,
            pos.divers.legend.icon.width,
            pos.divers.legend.icon.height)
    }

    if(report.rapport.fields[0].data.dateAnterieur !== ""){
        doc.circle(
            pos.divers.left + 2,
            pos.divers.legend.top + pos.divers.legend.height + pos.divers.lineHeight*3 + 9, 2, "F");
        date = new Date(report.rapport.fields[0].data.dateAnterieur);
        doc.text(date.getDate() + " " + mois[date.getMonth()] + " " + date.getFullYear(),
            pos.divers.left + 7,
            pos.divers.legend.top + pos.divers.legend.height + pos.divers.lineHeight*3 + 12)
    }

    //signature
    let signature = {
        signature: "",
        fullName: "",
        titre: "",
        license: ""
    };

    let audiologisteInfos = await getAudiologisteInfos(audiologisteId);
    signature.signature = audiologisteInfos.signature;
    signature.fullName = audiologisteInfos.fullName;
    signature.titre = audiologisteInfos.titre;
    signature.license = audiologisteInfos.license;

    doc.setFontSize(10);
    doc.text('Audiologiste : ', pos.signature.left, pos.signature.top);
    if(report.rapport.fields[6].data.cc !== ""){
        doc.text("CC : "+report.rapport.fields[6].data.cc, pos.width - pos.margin.right, pos.signature.top, "right")
    }
    if(signature.signature !== ""){
        doc.addImage(signature.signature, "png", pos.signature.left + 60, pos.signature.top - 20, 130, 28);
        doc.setFontSize(8);
        doc.text(signature.fullName + ", " + signature.titre + ", OOAQ# "+signature.license, pos.signature.left + 60, pos.signature.top + 15)
    }


    //Notes
    doc.setFontSize(8);
    let fullText = "";
    for(let i in report.rapport.fields[7].data.tabs){
        fullText += report.rapport.fields[7].data.tabs[i].text;
    }
    fullText = fullText.replace(/&rsquo;/g, "'");
    if(report.rapport.fields[0].data.type !== "16 000hz"){
        doc.rect(pos.notes.left, pos.notes.top, pos.notes.width, pos.notes.height);
        doc.fromHTML("<div style='margin:0;font-size:9pt'>"+fullText+"</div>", pos.notes.left + 2, pos.notes.top - 2, {
            'width': pos.notes.width - 6,
        })
    }else{
        //Emission oto-acoustique
        doc.setFontSize(8);

        doc.setFontStyle("bold");
        doc.text("ÉMISSION OTO-ACOUSTIQUE",
            pos.eoa.left,
            pos.eoa.top)
        doc.setFontStyle("normal");

        doc.text(report.rapport.fields[5].data.type,
            pos.eoa.left + 120,
            pos.eoa.top
        );

        doc.text("OREILLE DROITE",
            pos.eoa.left,
            pos.eoa.top + 15
        );
        doc.rect(
            pos.eoa.left,
            pos.eoa.top + 20,
            pos.eoa.width,
            pos.eoa.height
        );
        doc.line(
            pos.eoa.left,
            pos.eoa.top + 20 + pos.eoa.cell.height,
            pos.eoa.left + pos.eoa.width,
            pos.eoa.top + 20 + pos.eoa.cell.height
        );

        doc.text("OREILLE GAUCHE",
            pos.eoa.left,
            pos.eoa.top + 20 + pos.eoa.height + 15
        );
        doc.rect(
            pos.eoa.left,
            pos.eoa.top + 20 + pos.eoa.height + 20,
            pos.eoa.width,
            pos.eoa.height
        );
        doc.line(
            pos.eoa.left,
            pos.eoa.top + 20 + pos.eoa.height + 20 + pos.eoa.cell.height,
            pos.eoa.left + pos.eoa.width,
            pos.eoa.top + 20 + pos.eoa.height + 20 + pos.eoa.cell.height
        );


        let droite, gauche;
        let i = 0;
        for(let key in report.rapport.fields[5].data.freq.droite){
            droite = report.rapport.fields[5].data.freq.droite[key];
            gauche = report.rapport.fields[5].data.freq.gauche[key];
            doc.text(key.toString(),
                pos.eoa.left + pos.eoa.cell.width/2 + pos.eoa.cell.width*i,
                pos.eoa.top + pos.eoa.cell.height + 15,
                "center"
            );
            doc.text(droite,
                pos.eoa.left + pos.eoa.cell.width/2 +pos.eoa.cell.width*i,
                pos.eoa.top + 15 + pos.eoa.cell.height*2,
                "center"
            );
            doc.text(key.toString(),
                pos.eoa.left + pos.eoa.cell.width/2 + pos.eoa.cell.width*i,
                pos.eoa.top + pos.eoa.height + 20 + pos.eoa.cell.height + 15,
                "center"
            );
            doc.text(gauche,
                pos.eoa.left + pos.eoa.cell.width/2 +pos.eoa.cell.width*i,
                pos.eoa.top + pos.eoa.height + 20 + 15 + pos.eoa.cell.height*2,
                "center"
            );
            if(i !== 0){
                doc.line(
                    pos.eoa.left + pos.eoa.cell.width*i,
                    pos.eoa.top + 20,
                    pos.eoa.left + pos.eoa.cell.width*i,
                    pos.eoa.top + 20 + pos.eoa.height
                );
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
        );
        doc.addPage();
        doc.text(
            "Page 2",
            pos.width - pos.margin.right,
            pos.height - pos.margin.bottom,
            "right"
        );
        doc.text("Date: "+date.getDate() + " " + mois[date.getMonth()] + " " + date.getFullYear(),
            pos.width - pos.margin.right,
            pos.infos.top, "right")
        doc.rect(pos.margin.left, pos.margin.top + 20, pos.width - pos.margin.left - pos.margin.right, pos.height - 100)
        doc.fromHTML("<div style='margin:0;font-size:9pt'>"+fullText+"</div>", pos.margin.left + 2, pos.margin.top - 2, {
            'width': pos.width - pos.margin.left - pos.margin.right - 6,
        });
        //signature
        doc.setFontSize(10);
        doc.text('Audiologiste : ', pos.signature.left, pos.signature.top)
        if(signature.signature !== ""){
            doc.addImage(signature.signature, "png", pos.signature.left + 60, pos.signature.top - 20, 130, 28);
            doc.setFontSize(8);
            doc.text(signature.fullName + ", " + signature.titre + ", OOAQ# "+signature.license, pos.signature.left + 60, pos.signature.top + 15)
        }
    }



    return doc;

};

const header = (doc, clinique) => {

    doc.setLineWidth(0.5);
    //Logo
    doc.addImage(logo, "png", pos.margin.left, pos.margin.top, pos.logo.width, pos.logo.height);

    //Adresse
    doc.setFontSize(8);

    let adresse = clinique.adresse + "\n" + clinique.ville+" (Qc) " + clinique.zip;
    let phone = "Tél. : " + clinique.phone;

    doc.text(adresse, pos.adresse.left, pos.adresse.top);
    doc.setFontSize(9);
    doc.text(phone, pos.adresse.left, pos.adresse.top + 19);

    return doc;
};


const informations = (doc, infos, date, reference) => {
    //infos
    doc.setFontSize(12);
    doc.setTextColor("#7D7D7D");
    let split = {
        x : 220,
        y : 20
    };

    date = new Date(date);
    doc.setTextColor("#000000");
    doc.text(
        infos.genre + " " +
        infos.prenom + " " +
        infos.nom + "(" +
        infos.ddn.jour + " " +
        infos.ddn.mois + " " +
        infos.ddn.annee + ")",
        pos.infos.left,
        pos.infos.top);
    doc.text("Date: "+date.getDate() + " " + mois[date.getMonth()] + " " + date.getFullYear(),
        pos.width - pos.margin.right,
        pos.infos.top, "right");
    doc.text("Référé par: " + reference,
        pos.width - pos.margin.right,
        pos.infos.top + split.y, "right");
    doc.text(   infos.ramq.no + " exp: "+
        infos.ramq.exp.annee + " " +
        infos.ramq.exp.mois,
        pos.infos.left,
        pos.infos.top + split.y);

    return doc;
};


const audiogrammes = (doc, title, data, type, left, color, showGrid = true) => {
    pos.audiogramme.cell.width = pos.audiogramme.width / data.axis.x.values.length * 2;

    if(showGrid){
        doc.setFontSize(10);
        doc.setFillColor("#cccccc");
        doc.rect(left,
            pos.audiogramme.top + pos.audiogramme.cell.height,
            pos.audiogramme.width,
            pos.audiogramme.cell.height, 'F');
        doc.roundedRect(
            left,
            pos.audiogramme.top,
            pos.audiogramme.width,
            pos.audiogramme.height,
            pos.audiogramme.borderRadius,
            pos.audiogramme.borderRadius
        );
        doc.text(title,
            left + pos.audiogramme.width / 2,
            pos.audiogramme.top + pos.audiogramme.cell.height - 4, 'center');
        doc.line(left,
            pos.audiogramme.top + pos.audiogramme.cell.height,
            left + pos.audiogramme.width,
            pos.audiogramme.top + pos.audiogramme.cell.height);
        doc.line(left,
            pos.audiogramme.top + pos.audiogramme.cell.height * 2,
            left + pos.audiogramme.width,
            pos.audiogramme.top + pos.audiogramme.cell.height * 2);

        doc.setFontSize(8);
        doc.text("Hertz",
            left - 3,
            pos.audiogramme.top + pos.audiogramme.cell.height * 2 - 8, 'right');
        doc.text("dBHL", left - 3,
            pos.audiogramme.top + pos.audiogramme.cell.height * 2 + 6, 'right');

        let freq = data.axis.x.values;

        for (let i in freq) {
            if (Number(i) === 0) {
                doc.setDrawColor("#666666");
                doc.setLineDash([2]);
                doc.line(
                    left + i/2 * pos.audiogramme.cell.width + pos.audiogramme.cell.width * 0.5,
                    pos.audiogramme.top + pos.audiogramme.cell.height * 2,
                    left + i/2 * pos.audiogramme.cell.width + pos.audiogramme.cell.width * 0.5,
                    pos.audiogramme.top + pos.audiogramme.height
                );
                doc.setLineDash();
                doc.setDrawColor("#000000")
            }

            if(i%2 === 0 || Number(i) === freq.length - 1 )
                continue;

            doc.text((freq[i] >= 10000) ? freq[i].toString()[0] + "" + freq[i].toString()[1] + "k" : freq[i].toString(),
                left + i/2 * pos.audiogramme.cell.width + pos.audiogramme.cell.width/2,
                pos.audiogramme.top + pos.audiogramme.cell.height * 2 - 5, 'center')
            doc.line(
                left + i/2 * pos.audiogramme.cell.width + pos.audiogramme.cell.width/2,
                pos.audiogramme.top + pos.audiogramme.cell.height * 2,
                left + i/2 * pos.audiogramme.cell.width + pos.audiogramme.cell.width/2,
                pos.audiogramme.top + pos.audiogramme.height
            );
            doc.setDrawColor("#666666");
            doc.setLineDash([2]);
            doc.line(
                left + i/2 * pos.audiogramme.cell.width + pos.audiogramme.cell.width,
                pos.audiogramme.top + pos.audiogramme.cell.height * 2,
                left + i/2 * pos.audiogramme.cell.width + pos.audiogramme.cell.width,
                pos.audiogramme.top + pos.audiogramme.height
            );
            doc.setLineDash();
            doc.setDrawColor("#000000");


        }
        doc.line(left,
            pos.audiogramme.top + pos.audiogramme.cell.height * 3 - 1,
            left + pos.audiogramme.width,
            pos.audiogramme.top + pos.audiogramme.cell.height * 3 - 1);
        doc.line(left,
            pos.audiogramme.top + pos.audiogramme.cell.height * 3 + 1,
            left + pos.audiogramme.width,
            pos.audiogramme.top + pos.audiogramme.cell.height * 3 + 1);

        let intensity = data.axis.y.values;

        for (let i in intensity) {
            if(i%2 === 1 || intensity[i] < 0)
                continue;

            doc.text(intensity[i].toString(), left - 3,
                pos.audiogramme.top + pos.audiogramme.cell.height * ((intensity[i] / 10) + 3) + 2, 'right')
        }
        for (let i in intensity) {
            if (intensity[i] === 0 || intensity[i] === 120 || i%2 === 1) {
                continue;
            }

            doc.line(
                left,
                pos.audiogramme.top + pos.audiogramme.cell.height * ((intensity[i] / 10) + 3),
                left + pos.audiogramme.width,
                pos.audiogramme.top + pos.audiogramme.cell.height * ((intensity[i] / 10) + 3));
            if (intensity[i] === 20) {
                doc.setLineDash([2]);
                doc.line(
                    left,
                    pos.audiogramme.top + pos.audiogramme.cell.height * ((intensity[i] / 10) + 3) + pos.audiogramme.cell.height / 2,
                    left + pos.audiogramme.width,
                    pos.audiogramme.top + pos.audiogramme.cell.height * ((intensity[i] / 10) + 3) + pos.audiogramme.cell.height / 2);
                doc.setLineDash()

            }
        }
    }


    let symbols = {
        width: 130,
        height: 130,

    };

    symbols = {
        ...symbols,
        offset: {
            x : left + pos.audiogramme.cell.width/2,
            y: pos.audiogramme.top + pos.audiogramme.cell.height * 2
        }
    };

    let linesToDraw = {};

    // get dots to draw
    Object.keys(data.dots).forEach(level => {
        Object.keys(data.dots[level]).forEach(frequency => {
            Object.keys(data.dots[level][frequency]).forEach(tool => {

                if(data.lineType[tool] !== undefined){
                    if(linesToDraw[tool] === undefined)
                        linesToDraw = {...linesToDraw, [tool] : []};

                    linesToDraw = {
                        ...linesToDraw,
                        [tool] : [
                            ...linesToDraw[tool],
                            {
                                freq : frequency,
                                level : level,
                                nr : (data.dots[level][frequency][tool])
                            }
                        ]
                    }
                }

                if(data.tools[tool].noDraw)
                    return;

                let x = data.axis.x.values.indexOf(Number(frequency));
                let y = data.axis.y.values.indexOf(Number(level));

                doc.addImage(
                    svgToPng(
                        (data.dots[level][frequency][tool]) ?
                            data.tools[tool].symbol.img :
                            data.tools[tool].symbol.imgNr,
                        symbols.width,
                        symbols.height
                    ),
                    "png",
                    pos.audiogramme.cell.width * x/2 + symbols.offset.x - symbols.width/10/2,
                    pos.audiogramme.cell.height * y/2 + symbols.offset.y  - symbols.height/10/2,
                    symbols.width/10,
                    symbols.height/10
                );

            });
        });
    });

    // merge depencied lines
    Object.keys(data.dependencies).forEach(dependency => {
        Object.keys(data.dependencies[dependency]).forEach(dependencyWith => {
            if(linesToDraw[dependency] !== undefined && linesToDraw[dependencyWith] !== undefined){
                linesToDraw[dependency] = linesToDraw[dependency].concat(linesToDraw[dependencyWith]);
                delete linesToDraw[dependencyWith];
            }
        });
    });

    // sort with frequency
    Object.keys(linesToDraw).forEach(lineType => {
        linesToDraw[lineType] = linesToDraw[lineType].sort((a, b)  => {
            return Number(a.freq) - Number(b.freq);
        });
    });

    //draw
    doc.setDrawColor(color);
    Object.keys(linesToDraw).forEach(lineType => {

        if(data.lineType[lineType].dash)
            doc.setLineDash([data.lineType[lineType].dash]);

        doc.setLineWidth(data.lineType[lineType].width / 2);

        linesToDraw[lineType].forEach((dot, index) => {
            if(index === linesToDraw[lineType].length - 1)
                return;

            if(!dot.nr || !linesToDraw[lineType][index+1].nr)
                return;

            let x1 = data.axis.x.values.indexOf(Number(dot.freq));
            let y1 = data.axis.y.values.indexOf(Number(dot.level));

            let x2 = data.axis.x.values.indexOf(Number(linesToDraw[lineType][index+1].freq));
            let y2 = data.axis.y.values.indexOf(Number(linesToDraw[lineType][index+1].level));

            doc.line(
                pos.audiogramme.cell.width * x1/2 + symbols.offset.x,
                pos.audiogramme.cell.height * y1/2 + symbols.offset.y,
                pos.audiogramme.cell.width * x2/2 + symbols.offset.x,
                pos.audiogramme.cell.height * y2/2 + symbols.offset.y
            )
        });

        doc.setLineDash();
        doc.setLineWidth(0.5);

    });
    doc.setDrawColor("#000000");

    return doc;
};

const masking = (doc, type, dataGauche, dataDroite) => {
    //droite
    let freqs = [250, 500, 750, 1000, 1500, 2000, 3000, 4000, 6000, 8000];
    if(type === "16 000hz"){
        freqs = [250, 500, 750, 1000, 1500, 2000, 3000, 4000, 6000, 8000, 9000, 10000, 11000, 12500, 14000, 16000];
        pos.masking.width = pos.audiogramme.width;
        pos.masking.gap = pos.audiogramme.gap;
        pos.masking.cell.width = pos.masking.width/16;
    }
    doc.text("MKG",
        pos.masking.left + pos.masking.width + pos.masking.gap/2,
        pos.masking.top + pos.masking.height/2 + 3, "center");
    doc.roundedRect(
        pos.masking.left,
        pos.masking.top,
        pos.masking.width,
        pos.masking.height,
        pos.masking.borderRadius,
        pos.masking.borderRadius
    );
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
    for(let i in freqs){
        if(i%2 !== 0){
            doc.text((freqs[i]/1000).toString(),
                pos.masking.left + pos.masking.cell.width * i + pos.masking.cell.width/2,
                pos.masking.top + pos.masking.cell.height*3 - 3, "center" )
        }
        if(Number(i) === 0){
            continue;
        }
        doc.line(
            pos.masking.left + pos.masking.cell.width * i,
            pos.masking.top,
            pos.masking.left + pos.masking.cell.width * i,
            pos.masking.top + pos.masking.height
        )
    }

    Object.keys(dataDroite.aerienne).forEach(freq => {
        if(freq === "0")
            return;

        doc.text(dataDroite.aerienne[freq],
            pos.masking.left + pos.masking.cell.width * freqs.indexOf(Number(freq)) + pos.masking.cell.width/2,
            pos.masking.top + pos.masking.cell.height - 3, "center");
    });

    Object.keys(dataDroite.osseuse).forEach(freq => {
        if(freq === "0")
            return;

        doc.text(dataDroite.osseuse[freq],
            pos.masking.left + pos.masking.cell.width * freqs.indexOf(Number(freq)) + pos.masking.cell.width/2,
            pos.masking.top + pos.masking.cell.height * 2 - 3, "center");
    });

    //gauche
    pos.masking.left = pos.masking.left + pos.masking.width + pos.masking.gap;
    doc.roundedRect(
        pos.masking.left,
        pos.masking.top,
        pos.masking.width,
        pos.masking.height,
        pos.masking.borderRadius,
        pos.masking.borderRadius
    );
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
    if(!(type === "16 000hz")){
        doc.text("C.A.",
            pos.masking.left + pos.masking.width + 3,
            pos.masking.top + pos.masking.cell.height - 4, "left");
        doc.text("C.O.",
            pos.masking.left + pos.masking.width + 3,
            pos.masking.top + pos.masking.cell.height*2 - 4, "left")
    }
    for(let i in freqs){
        if(i%2 !== 0){
            doc.text((freqs[i]/1000).toString(),
                pos.masking.left + pos.masking.cell.width * i + pos.masking.cell.width/2,
                pos.masking.top + pos.masking.cell.height*3 - 3, "center" )
        }
        if(Number(i) === 0){
            continue
        }
        doc.line(
            pos.masking.left + pos.masking.cell.width * i,
            pos.masking.top,
            pos.masking.left + pos.masking.cell.width * i,
            pos.masking.top + pos.masking.height
        )
    }

    Object.keys(dataGauche.aerienne).forEach(freq => {
        if(freq === "0")
            return;

        doc.text(dataGauche.aerienne[freq],
            pos.masking.left + pos.masking.cell.width * freqs.indexOf(Number(freq)) + pos.masking.cell.width/2,
            pos.masking.top + pos.masking.cell.height - 3, "center");
    });

    Object.keys(dataGauche.osseuse).forEach(freq => {
        if(freq === "0")
            return;

        doc.text(dataGauche.osseuse[freq],
            pos.masking.left + pos.masking.cell.width * freqs.indexOf(Number(freq)) + pos.masking.cell.width/2,
            pos.masking.top + pos.masking.cell.height * 2 - 3, "center");
    });

    return doc;
};


const EOAChampLibre = (doc, dataDroite, dataGauche, dataChampLibre, transducteur) => {
    let eoa = {
        height: pos.audiogramme.height,
        width: 120,
        center: pos.audiogramme.left + pos.audiogramme.width + pos.audiogramme.gap + 50,
        top: pos.audiogramme.top
    };
    eoa = {
        ...eoa,
        cell: {
            height: eoa.height/15,
            width: 60
        }
    };
    doc.setFillColor("#cccccc");
    doc.rect(
        eoa.center - eoa.width/2,
        eoa.top + eoa.cell.height,
        eoa.width,
        eoa.cell.height,
        "F"
    );
    doc.rect(
        eoa.center - eoa.width/2,
        eoa.top,
        eoa.width,
        eoa.height
    );
    doc.text("ÉMISSION OTO-ACOUSTIQUE",
        eoa.center,
        eoa.top + eoa.cell.height - 3, "center");
    doc.line(
        eoa.center,
        eoa.top + eoa.cell.height,
        eoa.center,
        eoa.top + eoa.height
    );
    doc.text("DROITE",
        eoa.center - eoa.cell.width/2,
        eoa.top + eoa.cell.height*2 - 3, "center");
    doc.text("GAUCHE",
        eoa.center + eoa.cell.width/2,
        eoa.top + eoa.cell.height*2 - 3,"center");
    doc.line(
        eoa.center - eoa.cell.width,
        eoa.top + eoa.cell.height,
        eoa.center + eoa.cell.width,
        eoa.top + eoa.cell.height
    );
    let i = 0;
    for(let key in dataDroite){
        doc.text(key.toString() + "hz",
            eoa.center - eoa.cell.width - 2,
            eoa.top + eoa.cell.height*3 + eoa.cell.height*i - 3, "right"
        );
        doc.line(
            eoa.center - eoa.cell.width,
            eoa.top + eoa.cell.height*2 + eoa.cell.height*i,
            eoa.center + eoa.cell.width,
            eoa.top + eoa.cell.height*2 + eoa.cell.height*i
        );
        doc.text(dataDroite[key],
            eoa.center - eoa.cell.width/2,
            eoa.top + eoa.cell.height*3 + eoa.cell.height*i - 3, "center"
        );
        doc.text(dataGauche[key],
            eoa.center + eoa.cell.width/2,
            eoa.top + eoa.cell.height*3 + eoa.cell.height*i - 3, "center"
        );
        i++
    }

    pos.audiometrie.top -= 20;
    pos.tympanometrie.top += 30;

    pos.audiometrie.width -= pos.audiometrie.cell.width;
    pos.audiometrie.gap = pos.audiogramme.width*2 + pos.audiogramme.gap - pos.audiometrie.width*2 + 38;
    pos.audiometrie.cell = {
        height: pos.audiometrie.height/5,
        width: pos.audiometrie.width/5
    };

    pos.tympanometrie.width -= pos.tympanometrie.cell.width;
    pos.tympanometrie.gap = pos.audiogramme.width*2 + pos.audiogramme.gap - pos.tympanometrie.width*2 + 38;
    pos.tympanometrie.cell = {
        height: pos.tympanometrie.height,
        width: pos.tympanometrie.width/3
    };

    // Extra checkbox fields ////////////////////////////////////////////////////////
    pos.champLibre = {
        top : pos.audiogramme.top - 10,
        left : eoa.center + eoa.width/2 + 15,
        conditionnement: 70,
        transducteur: 130,
        collaboration: 190
    };
    doc.setFontSize(9);
    doc.text("Stimuli",
        pos.champLibre.left,
        pos.champLibre.top
    );
    doc.text("Conditionnement",
        pos.champLibre.left,
        pos.champLibre.top + pos.champLibre.conditionnement
    );
    doc.text("Transducteur",
        pos.champLibre.left,
        pos.champLibre.top + pos.champLibre.transducteur
    );
    doc.text("Collaboration",
        pos.champLibre.left,
        pos.champLibre.top + pos.champLibre.collaboration
    );

    doc.setFontSize(8);
    let keys = ["Sons purs", "Sons hululés", "Sons pulsés", "Bruit de bande étroite"];
    let values = [
        dataChampLibre.stimuli.sonsPurs,
        dataChampLibre.stimuli.sonsHulliles,
        dataChampLibre.stimuli.sonsPulses,
        dataChampLibre.stimuli.brf
    ];
    for(let i in keys){
        doc.rect(
            pos.champLibre.left,
            pos.champLibre.top + 10 +12*i,
            pos.checkbox.width,
            pos.checkbox.height
        );
        doc.text(keys[i],
            pos.champLibre.left + pos.checkbox.width + pos.checkbox.gap,
            pos.champLibre.top + 10 +7 + 12*i
        );
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
        dataChampLibre.conditionnement.visuel,
        dataChampLibre.conditionnement.jeu,
        dataChampLibre.conditionnement.reponsesMotrices
    ];
    for(let i in keys){
        doc.rect(
            pos.champLibre.left,
            pos.champLibre.top + pos.champLibre.conditionnement + 10 +12*i,
            pos.checkbox.width,
            pos.checkbox.height
        );
        doc.text(keys[i],
            pos.champLibre.left + pos.checkbox.width + pos.checkbox.gap,
            pos.champLibre.top + pos.champLibre.conditionnement + 10 +7 + 12*i
        );
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
        transducteur.intra,
        transducteur.supra,
        transducteur.champLibre,
    ];
    for(let i in keys){
        doc.rect(
            pos.champLibre.left,
            pos.champLibre.top + pos.champLibre.transducteur + 10 +12*i,
            pos.checkbox.width,
            pos.checkbox.height
        );
        doc.text(keys[i],
            pos.champLibre.left + pos.checkbox.width + pos.checkbox.gap,
            pos.champLibre.top + pos.champLibre.transducteur + 10 +7 + 12*i
        );
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
    values = dataChampLibre.collaboration;
    for(let i in keys){
        doc.rect(
            pos.champLibre.left,
            pos.champLibre.top + pos.champLibre.collaboration + 10 +12*i,
            pos.checkbox.width,
            pos.checkbox.height
        );
        if(values === "Autre" && keys[i] === "Autre"){
            doc.fromHTML("<div style='font-size:8pt;margin: 0;font-family:sans-serif'>"+dataChampLibre.collaborationAutre+"</div>",
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
        if(values === keys[i]){
            doc.addImage(check, "png",
                pos.champLibre.left +2,
                pos.champLibre.top + pos.champLibre.collaboration + 10 -2 + 12*i,
                pos.checkbox.width +1,
                pos.checkbox.height +1
            )
        }
    }

    return doc;
};

const svgToPng = (svg, width, height) => {
    let canvas = document.createElement('canvas');
    canvas.setAttribute("id", "canvas");
    canvas.width  = width;
    canvas.height = height;
    document.body.appendChild(canvas);
    canvg('canvas', svg);
    let png = canvas.toDataURL("image/png");
    canvas.remove();
    return png;
};

export default pdfGenerator;
