const express = require("express");
const bodyParser = require("body-parser");
const app = express()

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let code100 = { code: 100, error: false, message: '2-DAMVI Server Up' };
let code200 = { code: 200, error: false, message: 'Player Exists' };
let code201 = { code: 201, error: false, message: 'Player Correctly Created' };
let code202 = { code: 202, error: false, message: 'Player Correctly Updated' };
let code203 = { code: 203, error: false, message: 'Player Correctly Deleted' };
let codeError502 = { code: 502, error: true, message: 'The field: name, surname, score are mandatories (the score value has to be >0)' };
let codeError503 = { code: 503, error: true, message: 'Error: Player Exists' };
let codeError504 = { code: 504, error: true, message: 'Error: Player not found' };
//Mensajes de compras
let codeBuy401 = { code: 401, error: false, message: 'Purchase made' };
let codeErrorBuy402 = { code: 402, error: true, message: 'Error: Please specify the alias or the number of billetes to buy'};
let codeErrorBuy403 = { code: 403, error: true, message: "Error: You don't have enough points"};

var CatalogoHabilidades = [
    {nombre: "Bola de fuego", id: 1},
    {nombre: "Flash", id: 2 }
];

var players = [
    { position: "1", alias: "jperez", name: "Jose", surname: "Perez", score: 1000, created: "2020-11-03T15:20:21.377Z", coins: 0, billetes: 0, habilidad1: false, habilidad2: false},
    { position: "2", alias: "jsanz", name: "Juan", surname: "Sanz", score: 950, created: "2020-11-03T15:20:21.377Z", coins: 0, billetes: 0, habilidades: "?" },
    { position: "3", alias: "mgutierrez", name: "Maria", surname: "Gutierrez", score: 850, created: "2020-11-03T15:20:21.377Z", coins: 0, billetes: 0, habilidades: "?" }
];
let response = {
    error: false,
    code: 200,
    message: ''
};

function UpdateRanking() {
    //Order the ranking
    players.sort((a, b) => (a.score <= b.score) ? 1 : -1);

    //Position Update
    for (var x = 0; x < players.length; x++) {
        players[x].position = x + 1;
    }
};

app.get('/', function (req, res) {
    //code funciona ok
    res.send(code100);
});

app.get('/ranking', function (req, res) {
    let ranking = { namebreplayers: players.length, players: players };
    res.send(ranking);
});
app.get('/players', function (req, res){
    res.send(players);
});
app.get('/players/:alias', function (req, res) {
    //Player Search
    var index = players.findIndex(j => j.alias === req.params.alias);

    if (index >= 0) {
        //Player exists
        response = code200;
        response.jugador = players[index];
    } else {
        //Player doesn't exists
        response = codeError504;
    }
    res.send(response);
});

app.post('/players/:alias', function (req, res) {
    var paramAlias = req.params.alias || '';
    var paramName = req.body.name || '';
    var paramSurname = req.body.surname || '';
    var paramScore = req.body.score || '';

    if (paramAlias === '' || paramName === '' || paramSurname === '' || parseInt(paramScore) <= 0 || paramScore === '') {
        response = codeError502;
    } else {
        //Player Search
        var index = players.findIndex(j => j.alias === paramAlias)

        if (index != -1) {
            //Player allready exists
            response = codeError503;
        } else {
            //Add Player
            players.push({ 
                position: '', 
                alias: paramAlias, 
                name: paramName, 
                surname: paramSurname, 
                score: paramScore ,
                created: new Date(),
                coins: 10,
                billetes: 5,
                habilidades: "Ninguna"
            });
            //Sort the ranking
            UpdateRanking();
            //Search Player Again
            index = players.findIndex(j => j.alias === paramAlias);
            //Response return
            response = code201;
            response.player = players[index];
        }
    }
    res.send(response);
});

app.put('/players/:alias', function (req, res) {
    var paramalias = req.params.alias || '';
    var paramname = req.body.name || '';
    var paramsurname = req.body.surname || '';
    var paramScore = req.body.score || '';

    if (paramalias === '' || paramname === '' || paramsurname === '' || parseInt(paramScore) <= 0 || paramScore === '') {
        response = codeError502; //Paràmetres incomplerts
    } else {
        //Player Search
        var index = players.findIndex(j => j.alias === paramalias)

        if (index != -1) {
            //Update Player
            players[index] = { 
                position: '', 
                alias: paramalias, 
                name: paramname, 
                surname: paramsurname, 
                score: paramScore,
                created:  players[index].created,
                updated: new Date(),
                coins: 10,
                billetes: 5,
                habilidades: "Ninguna"
            };
            //Sort the ranking
            UpdateRanking();
            //Search Player Again
            index = players.findIndex(j => j.alias === paramalias);
            //Response return
            response = code202;
            response.jugador = players[index];
            
        } else {
            response = codeError504;
        }
    }
    res.send(response);
});

//Borrar jugador by https://www.codegrepper.com/code-examples/c/delete+array+item+by+id+using+app.delete
app.delete('/players/:alias', function(req,res){
    var paramalias = req.params.alias || '';

    if (paramalias === '') {
        response = codeError502; //Paràmetres incomplerts
    } 
    else{
        //Player Search
        var index = players.findIndex(j => j.alias === paramalias)
        if (index != -1) {
            players.splice(index)
            
        }
        else {
            response = codeError504;
        }
    }
    res.send(response);
});

//Comprar monedas con billetes
app.get('/buycoins/:alias', function(req,res){
    var paramalias = req.params.alias || '';
    var parambilletes = req.body.billetes || '';
    if (paramalias === '' || parambilletes === '') {
        response = codeErrorBuy402;
    }
    else{
        var index = players.findIndex(j => j.alias === paramalias)
        //Supongamos xk no tengo ni idea, que con 1 billetes se pilla 5 monedas. pos eso
        if(players[index].billetes < 1){
            response = codeErrorBuy403;
        }
        else{
            var precio = 1;
            var ganancia = 5;
            players[index].billetes -= precio;
            players[index].coins += ganancia;
            response = codeBuy401;
            response.jugador = players[index];
        }
    }
    res.send(response);
});
function hey(){
    console.log("Hey");
}

module.exports = {
    app,
    hey
}
//module.exports = app;