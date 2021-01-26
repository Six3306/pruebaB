// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

const functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');
const { Card, Suggestion } = require('dialogflow-fulfillment');

// libreria de npm para comunicarnos con firebase
const admin = require('firebase-admin');
const { ref } = require('firebase-functions/lib/providers/database');

//configuracion para la conexión con firebase
const firebaseConfig = {
    apiKey: "AIzaSyDrw3rUOysLX__KgQez80s1kQz6jdIieMQ",
    authDomain: "chatbotcinvestav2.firebaseapp.com",
    databaseURL: "https://chatbotcinvestav2-default-rtdb.firebaseio.com",
    projectId: "chatbotcinvestav2",
    storageBucket: "chatbotcinvestav2.appspot.com",
    messagingSenderId: "492383338406",
    appId: "1:492383338406:web:68b68b725b8576d8951967",
    measurementId: "G-XVDNK3XLK8"
};

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {

    const agent = new WebhookClient({ request, response });
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

    // function welcome(agent) {
    //     agent.add(`Welcome to my agent!`);
    // }

    // function fallback(agent) {
    //     agent.add(`I didn't understand`);
    //     agent.add(`I'm sorry, can you try again?`);
    // }

    //funciones para preguntas relacionadas a las inscripciones
    function preguntasInscripciones(agent) {
        admin.initializeApp(firebaseConfig);
        const pregunta = agent.parameters.inscripcion;

        var insc = "";
        var cont = 0;
        return admin.database().ref('Recordatorios/').once('value').then((snapshot) => {
            const value = snapshot.val();
            if (value !== null) {
                for (var val in value) {
                    if ((value[val].reminder.includes("inscripcion") || value[val].reminder.includes("inscripción") || value[val].reminder.includes("INSCRIPCION") || value[val].reminder.includes("Inscripcion")) &&
                        value[val].delet == 1) {
                        cont++;
                        insc = insc + "(" + cont + ")" + value[val].reminder;
                    }
                }
                if (insc != "") {
                    agent.add("los avisos e información sobre inscripciones y reinscripciones son: " + insc);
                } else {
                    agent.add("No encontre avisos o información de inscripciones y/o reinscripciones");
                }
            }
        });
    }

    //para brindar informacion sobre el inicio o bien el fin de un curso
    function infoiniciofincurso(agent) {
        admin.initializeApp(firebaseConfig);
        const pregunta = agent.parameters.infoiniciofincursos;

        var inic = "",
            cierr = "";
        var cont = 0;
        // agent.add("PORFAVOR!");
        return admin.database().ref('Recordatorios/').once('value').then((snapshot) => {
            const value = snapshot.val();
            if (value !== null) {
                if (pregunta == "iniciancursos") {
                    for (var val in value) {
                        if ((value[val].reminder.toUpperCase().includes("CURSO") || value[val].reminder.toUpperCase().includes("CLASE")) &&
                            (value[val].reminder.toUpperCase().includes("INICI") || value[val].reminder.toUpperCase().includes("EMPIEZA") ||
                                value[val].reminder.toUpperCase().includes("COMIENZA") || value[val].reminder.toUpperCase().includes("ARRANCA")) &&
                            value[val].delet == 1) {
                            cont++;
                            inic = inic + "(" + cont + ")" + value[val].reminder;
                        }
                    }
                }
                if (pregunta == "terminancursos") {
                    for (var valt in value) {
                        if ((value[valt].reminder.toUpperCase().includes("CURSO") || value[valt].reminder.toUpperCase().includes("CLASE")) &&
                            (value[valt].reminder.toUpperCase().includes("TERMINA") || value[valt].reminder.toUpperCase().includes("CIERRA") ||
                                value[valt].reminder.toUpperCase().includes("ACABA") || value[valt].reminder.toUpperCase().includes("FINALIZA")) &&
                            value[valt].delet == 1) {
                            cont++;
                            cierr = cierr + "(" + cont + ")" + value[valt].reminder;
                        }
                    }
                }
                if (inic != "") {
                    agent.add("La información sobre el inicio de clases es: " + inic);
                } else {
                    if (cierr != "") {
                        agent.add("La información sobre el cierre de clases es: " + cierr);
                    } else {
                        agent.add("No encontre avisos o información del cierre o inicio de clases");
                    }
                }
            }
        });
    }

    //para consultar examenes programados para cierto grupo y grado
    function consultarExamenes(agent) {
        admin.initializeApp(firebaseConfig);

        const grado = agent.parameters.grado;
        const grupo = agent.parameters.grupo;

        return admin.database().ref('Examenes/').once('value').then((snapshot) => {
            const value = snapshot.val();
            if (value !== null) {
                var t = "";
                for (var val in value) {
                    if (value[val].grado == grado && value[val].grupo == grupo) {
                        t = t + value[val].clase + " a las " + value[val].dia + " a las " + value[val].hora + " , ";
                    }
                }
                if (t != "") {
                    agent.add("Examenes programados: " + t);
                } else {
                    agent.add("No hay examenes programados");
                }
            }
        });

        // firebaseService.database().ref('Users/' + us.uid).once('value').then(function(snapshot) {
        //     let dato = snapshot.val().countShops
        //     fun(dato);
        // })
    }

    //para consultar tareas dependiendo el grado, grupo y materia
    function consultarTareas(agent) {
        admin.initializeApp(firebaseConfig);

        const grado = agent.parameters.grado;
        const grupo = agent.parameters.grupo;
        const clases = agent.parameters.clases;

        return admin.database().ref('Tareas/').once('value').then((snapshot) => {
            const value = snapshot.val();
            if (value !== null) {
                var t = "";
                for (var val in value) {
                    if (value[val].grado == grado && value[val].grupo == grupo && value[val].clase == clases) {
                        t = t + 'Para la clase de ' + value[val].clase + " tienes que " + value[val].tema + " esa tarea la debes enviar antes del " + value[val].fecha + " , ";
                    }
                }
                if (t != "") {
                    agent.add("Lista de tareas: " + t);
                } else {
                    agent.add("No hay tareas en tu lista");
                }
            }
        });
    }

    //para consultar calificaciones de un alumno en determinada materia
    function consultarCalificacion(agent) {
        admin.initializeApp(firebaseConfig);

        const materia = agent.parameters.clase;
        const nombre = agent.parameters.nombre;

        return admin.database().ref(`Calificaciones/${materia}/${nombre}/`).once('value').then((snapshot) => {
            const value = snapshot.val();
            if (value !== null) {
                var t = "1er bimestre: " + value["bi1"] + ", 2do bimestre: " + value["bi2"] + ", 3er bimestre: " + value["bi3"] + ", 4to bimestre: " + value["bi4"] + ", 5to bimestre: " + value["bi5"];

                if (t != "") {
                    agent.add("Lista de calificaciones registradas: " + t);
                } else {
                    agent.add("No hay calificaciones registradas");
                }
            }
        });
    }

    //para consultar material de cierto grado grupo 
    function consultarMaterial(agent) {
        admin.initializeApp(firebaseConfig);

        const grado = agent.parameters.grado;
        const grupo = agent.parameters.grupo;
        const duda = agent.parameters.duda;
        const clase = agent.parameters.clases;

        var data = {
            'clase': clase,
            'duda': duda,
            'grupo': grupo,
            'grado': grado
        };
        //admin.database().ref("Generales").child("tests").set(data);
        admin.database().ref("DudasAlumnos").push(data);

        return admin.database().ref('Material/').once('value').then((snapshot) => {
            const value = snapshot.val();
            if (value !== null) {
                var t = "";
                for (var val in value) {
                    if (value[val].grado == grado && value[val].grupo == grupo && value[val].materia == clase) {
                        t = t + ' Dejó como apoyo para " ' + value[val].descripcion + ' " y el link del material es: ' + value[val].url;
                    }
                }
                if (t != "") {
                    agent.add("Bien, como resultado pude saber que tu profesor dejo lo siguiente: " + t);
                } else {
                    agent.add("No hay material relacionado que haya dejado tu profesor, le diré anonimamente que hay dudas sobre ello :) ");
                }
            }
        });
    }

    //para insertar un examen
    function insertarExamen(agent) {

        admin.initializeApp(firebaseConfig);
        const keyG = agent.parameters.keyG;

        return admin.database().ref('KeyProfesor/').once('value').then((snapshot) => {
            const value = snapshot.val();
            var band = false;
            if (value !== null) {
                for (var val in value) {
                    if (value[val].keyG == keyG) {
                        band = true;
                        break;
                    }
                }
                if (band) {
                    const clase = agent.parameters.clases;
                    const hora = agent.parameters.hora;
                    const dia = agent.parameters.dia;
                    const grado = agent.parameters.grado;
                    const grupo = agent.parameters.grupo;
                    var data = {
                        'clase': clase,
                        'hora': hora,
                        'dia': dia,
                        'grupo': grupo,
                        'grado': grado
                    };
                    //admin.database().ref("Generales").child("tests").set(data);
                    admin.database().ref("Examenes").push(data);
                    agent.add('Se ha añadido un examen de ' + clase + ' para ' + grado + ' ' + grupo + ', programado para el ' + dia + ' a las ' + hora);
                } else {
                    agent.add("Algo salió mal, checa tu key (llave) generada");
                }
            }
        });
    }

    //para insertar una tarea
    function insertarTarea(agent) {

        admin.initializeApp(firebaseConfig);
        const keyG = agent.parameters.keyG;

        return admin.database().ref('KeyProfesor/').once('value').then((snapshot) => {
            const value = snapshot.val();
            var band = false;
            if (value !== null) {
                for (var val in value) {
                    if (value[val].keyG == keyG) {
                        band = true;
                        break;
                    }
                }
                if (band) {
                    const clase = agent.parameters.clases;
                    const fecha = agent.parameters.fecha;
                    const tema = agent.parameters.tema;
                    const grado = agent.parameters.grado;
                    const grupo = agent.parameters.grupo;
                    var data = {
                        'clase': clase,
                        'fecha': fecha,
                        'tema': tema,
                        'grupo': grupo,
                        'grado': grado
                    };
                    admin.database().ref("Tareas").push(data);
                    agent.add('Tarea de ' + clase + ' añadida con éxito para el grupo de ' + grado + ' ' + grupo + ', sobre: "' + tema + '", para entregar antes del ' + fecha);
                } else {
                    agent.add("Algo salió mal, checa tu key (llave) generada");
                }

            }
        });

    }

    //para insertar una materia
    function insertarMaterial(agent) {
        admin.initializeApp(firebaseConfig);
        const keyG = agent.parameters.keyG;

        return admin.database().ref('KeyProfesor/').once('value').then((snapshot) => {
            const value = snapshot.val();
            var band = false;
            if (value !== null) {
                for (var val in value) {
                    if (value[val].keyG == keyG) {
                        band = true;
                        break;
                    }
                }
                if (band) {
                    const clase = agent.parameters.clases;
                    const url = agent.parameters.url;
                    const grado = agent.parameters.grado;
                    const grupo = agent.parameters.grupo;
                    const descripcion = agent.parameters.descripcion;
                    var data = {
                        'materia': clase,
                        'url': url,
                        'grado': grado,
                        'grupo': grupo,
                        'descripcion': descripcion,
                    };
                    admin.database().ref("Material").push(data);
                    agent.add('Se ha añadido un nuevo material a la clase de ' + clase + " de " + grado + "  " + grupo);
                } else {
                    agent.add("Algo salió mal, checa tu key (llave) generada");
                }
            }
        });
    }



    //SOLO UN  intento por funcion
    // Run the proper function handler based on the matched Dialogflow intent name
    let intentMap = new Map();
    // intentMap.set('Default Welcome Intent', welcome);
    // intentMap.set('Default Fallback Intent', fallback);
    intentMap.set('Añadir-examen', insertarExamen);
    intentMap.set('Consultar-examen', consultarExamenes);
    intentMap.set('Añadir-material-clase', insertarMaterial);
    intentMap.set('Preguntas-inscripcion', preguntasInscripciones);
    intentMap.set('Preguntas-cursos', infoiniciofincurso);
    intentMap.set('Añadir-tarea', insertarTarea);
    intentMap.set('Consultar-tarea', consultarTareas);
    intentMap.set('Dudas-trabajo', consultarMaterial);
    intentMap.set('Consultar-calificacion', consultarCalificacion);

    agent.handleRequest(intentMap);
});