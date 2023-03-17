const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const jwt = require('jsonwebtoken')

app.use(cors())
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

var db = {
    users:[
        {
            id: 100,
            nome: 'fernando'
        }
    ]
}

const jwtSecret = 'chaveSecretaGeosiga'

function auth(req, res, next){

    const authToken = req.headers['authorization']

    if(authToken != undefined){

        const bearer = authToken.split(' ')
        var token = bearer[1]

        jwt.verify(token, jwtSecret, (err, data) => {
            if(err){
                res.status(401)
                res.json({err: 'Token invalido'})
            } else{

                req.token = token
                req.loggedUser = {id: data.id, nome: data.nome}
                next()
            }
        })

    }else{
        res.status(401)
        res.json({err: 'Token inválido'})
    }

    
}

app.post('/auth', (req, res) => {
    var {id, nome} = req.body;

    if (id != undefined) {

        var user = db.users.find(u => u.id == id)

        if (user != undefined) {
            
            if (user.nome == nome) {

                jwt.sign({id: user.id, nome: user.nome}, jwtSecret, {expiresIn: '48h'},(err, token) => {
                    if(err){
                        res.status(400)
                        res.json({err: 'Falha interna'})
                    } else {
                        res.status(200)
                        res.json({token: token})
                    }
                })

            } else {
                res.status(401);
                res.json({err: 'nome inválido'})
            }

        } else {
            res.status(404);
            res.json({err: 'id não existe na base de dados'})
        }

    } else {
        res.status(400);
        res.json({err: 'id invalido'})
    }
})

app.get('/', (req, res) => {
    app.send('Ola')
});

app.listen(7000, () => {
    console.log('API RODANDO!!')
})