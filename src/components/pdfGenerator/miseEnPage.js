export const MiseEnPage = () => {
    let miseEnPage = {
        width: 612,
        height: 792,
        margin: {
            left: 15,
            top: 15,
            right: 15,
            bottom: 15
        },
        logo: {
            width: 112.5,
            height: 31.875
        },
        checkbox:{
            height:8,
            width: 8,
            gap: 3
        }
    };

    miseEnPage = {
        ...miseEnPage,
        adresse:{
            left: miseEnPage.margin.left,
            top: miseEnPage.margin.top + miseEnPage.logo.height + 10
        },
        infos : {
            left: miseEnPage.margin.left + miseEnPage.logo.width + 50,
            top: miseEnPage.margin.top + 15
        },
        rapport : {
            left: miseEnPage.margin.left,
            top: 78
        }
    };

    miseEnPage = {
        ...miseEnPage,
        audiogramme:{
            left: miseEnPage.rapport.left + 20,
            top: miseEnPage.rapport.top + 10,
            width: 200, //also width for Masking
            height: 210,
            borderRadius: 12,
            gap: 50
        }
    };

    miseEnPage = {
        ...miseEnPage,
        audiogramme : {
            ...miseEnPage.audiogramme,
            cell : {
                height: miseEnPage.audiogramme.height / 15,
                width: miseEnPage.audiogramme.width / 7
            }
        },
        masking: {
            left: miseEnPage.audiogramme.left,
            top: miseEnPage.audiogramme.top + miseEnPage.audiogramme.height + 8,
            width: miseEnPage.audiogramme.width,
            height: 32,
            borderRadius: 6,
            gap: miseEnPage.audiogramme.gap
        }
    };

    miseEnPage = {
        ...miseEnPage,
        masking:{
            ...miseEnPage.masking,
            cell:{
                height: miseEnPage.masking.height/3,
                width: miseEnPage.masking.width/10
            }
        },
        audiometrie: {
            left: miseEnPage.audiogramme.left - 15,
            top: miseEnPage.masking.top + miseEnPage.masking.height + 16,
            width: 214,
            height: 54
        }
    };

    miseEnPage = {
        ...miseEnPage,
        audiometrie:{
            ...miseEnPage.audiometrie,
            gap: miseEnPage.audiogramme.width*2 + miseEnPage.audiogramme.gap - miseEnPage.audiometrie.width*2 + 38,
            cell:{
                height: miseEnPage.audiometrie.height/5,
                width: miseEnPage.audiometrie.width/6
            }
        },
        tympanometrie: {
            left: miseEnPage.audiogramme.left - 15,
            top: miseEnPage.audiometrie.top + miseEnPage.audiometrie.height + 8,
            width: 190,
            height: 30
        }
    };

    miseEnPage = {
        ...miseEnPage,
        tympanometrie: {
            ...miseEnPage.tympanometrie,
            gap: miseEnPage.audiogramme.width*2 + miseEnPage.audiogramme.gap - miseEnPage.tympanometrie.width*2 + 38,
            cell:{
                height: miseEnPage.tympanometrie.height,
                width: miseEnPage.tympanometrie.width / 4
            },
            extraCell:{
                width: (miseEnPage.audiogramme.width*2 + miseEnPage.audiogramme.gap - miseEnPage.tympanometrie.width*2)/2 + 7,
                height: miseEnPage.tympanometrie.height - 10
            }
        },
        seuils : {
            left: miseEnPage.audiogramme.left - 15,
            top: miseEnPage.tympanometrie.top + miseEnPage.tympanometrie.height + 8,
            width: 210,
            height: 40
        }
    };

    miseEnPage = {
        ...miseEnPage,
        seuils: {
            ...miseEnPage.seuils,
            gap: miseEnPage.audiogramme.width*2 + miseEnPage.audiogramme.gap - miseEnPage.seuils.width*2 + 38,
            cell: {
                width: miseEnPage.seuils.width/6,
                height: miseEnPage.seuils.height/4
            }
        },
        eoa:{
            top: miseEnPage.seuils.top + miseEnPage.seuils.height + 20,
            left: miseEnPage.seuils.left,
            height: 30
        },
        divers: {
            left: miseEnPage.audiogramme.left + miseEnPage.audiogramme.width*2 + miseEnPage.audiogramme.gap + 40,
            top: miseEnPage.rapport.top,
            lineHeight: 10,
            gap: 8
        }
    };

    miseEnPage = {
        ...miseEnPage,
        eoa:{
            ...miseEnPage.eoa,
            width: miseEnPage.width - miseEnPage.seuils.left*2,
            cell:{
                height: 15,
                width: miseEnPage.eoa.width / 13
            }
        },
        divers: {
            ...miseEnPage.divers,
            legend: {
                top: miseEnPage.divers.top + miseEnPage.divers.lineHeight * 19,
                left: miseEnPage.divers.left,
                height: 90,
                width: 70
            }
        }
    };

    miseEnPage = {
        ...miseEnPage,
        eoa:{
            ...miseEnPage.eoa,
            cell:{
                height: 15,
                width: miseEnPage.eoa.width / 13
            }
        },
        divers: {
            ...miseEnPage.divers,
            legend: {
                ...miseEnPage.divers.legend,
                center: miseEnPage.divers.legend.left + miseEnPage.divers.legend.width/2,
                cell:{
                    height: miseEnPage.divers.legend.height/8
                },
                icon:{
                    height: 10,
                    width: 10
                }
            }
        },
        tympanometrie:{
            ...miseEnPage.tympanometrie,
            graph:{
                top: miseEnPage.divers.top + miseEnPage.divers.lineHeight*33,
                left: miseEnPage.divers.left,
                height: 72,
                width: 72
            }
        }
    };

    miseEnPage = {
        ...miseEnPage,
        tympanometrie:{
            ...miseEnPage.tympanometrie,
            graph:{
                ...miseEnPage.tympanometrie.graph,
                cell:{
                    height: miseEnPage.tympanometrie.graph.height/8,
                    width: miseEnPage.tympanometrie.graph.width/6
                }
            }
        },
        notes:{
            left: miseEnPage.margin.left,
            top: miseEnPage.seuils.top + miseEnPage.seuils.height + 8,
            width: miseEnPage.width - miseEnPage.margin.left - miseEnPage.margin.right,
            height: 240
        }
    };

    miseEnPage = {
        ...miseEnPage,
        signature:{
            left: miseEnPage.audiogramme.left,
            top: miseEnPage.notes.top + miseEnPage.notes.height + 23
        }
    };

    return miseEnPage;
};