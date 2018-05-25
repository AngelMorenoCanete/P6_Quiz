const Sequelize = require("sequelize");
const {models} = require("../models");

// Autoload the quiz with id equals to :quizId
exports.load = (req, res, next, quizId) => {

    models.quiz.findById(quizId)
    .then(quiz => {
        if (quiz) {
            req.quiz = quiz;
            next();
        } else {
            throw new Error('There is no quiz with id=' + quizId);
        }
    })
    .catch(error => next(error));
};


// GET /quizzes
exports.index = (req, res, next) => {

    models.quiz.findAll()
    .then(quizzes => {
        res.render('quizzes/index.ejs', {quizzes});
    })
    .catch(error => next(error));
};


// GET /quizzes/:quizId
exports.show = (req, res, next) => {

    const {quiz} = req;

    res.render('quizzes/show', {quiz});
};


// GET /quizzes/new
exports.new = (req, res, next) => {

    const quiz = {
        question: "", 
        answer: ""
    };

    res.render('quizzes/new', {quiz});
};

// POST /quizzes/create
exports.create = (req, res, next) => {

    const {question, answer} = req.body;

    const quiz = models.quiz.build({
        question,
        answer
    });

    // Saves only the fields question and answer into the DDBB
    quiz.save({fields: ["question", "answer"]})
    .then(quiz => {
        req.flash('success', 'Quiz created successfully.');
        res.redirect('/quizzes/' + quiz.id);
    })
    .catch(Sequelize.ValidationError, error => {
        req.flash('error', 'There are errors in the form:');
        error.errors.forEach(({message}) => req.flash('error', message));
        res.render('quizzes/new', {quiz});
    })
    .catch(error => {
        req.flash('error', 'Error creating a new Quiz: ' + error.message);
        next(error);
    });
};


// GET /quizzes/:quizId/edit
exports.edit = (req, res, next) => {

    const {quiz} = req;

    res.render('quizzes/edit', {quiz});
};


// PUT /quizzes/:quizId
exports.update = (req, res, next) => {

    const {quiz, body} = req;

    quiz.question = body.question;
    quiz.answer = body.answer;

    quiz.save({fields: ["question", "answer"]})
    .then(quiz => {
        req.flash('success', 'Quiz edited successfully.');
        res.redirect('/quizzes/' + quiz.id);
    })
    .catch(Sequelize.ValidationError, error => {
        req.flash('error', 'There are errors in the form:');
        error.errors.forEach(({message}) => req.flash('error', message));
        res.render('quizzes/edit', {quiz});
    })
    .catch(error => {
        req.flash('error', 'Error editing the Quiz: ' + error.message);
        next(error);
    });
};


// DELETE /quizzes/:quizId
exports.destroy = (req, res, next) => {

    req.quiz.destroy()
    .then(() => {
        req.flash('success', 'Quiz deleted successfully.');
        res.redirect('/quizzes');
    })
    .catch(error => {
        req.flash('error', 'Error deleting the Quiz: ' + error.message);
        next(error);
    });
};


// GET /quizzes/:quizId/play
exports.play = (req, res, next) => {

    const {quiz, query} = req;

    const answer = query.answer || '';

    res.render('quizzes/play', {
        quiz,
        answer
    });
};


// GET /quizzes/:quizId/check
exports.check = (req, res, next) => {

    const {quiz, query} = req;

    const answer = query.answer || "";
    const result = answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim();

    res.render('quizzes/result', {
        quiz,
        result,
        answer
    });
};

/*
// GET /quizzes/randomplay
exports.randomplay = (req, res, next) =>{
    const {quiz, query} = req;

    const answer = query.answer || "";
    let nUnsolvedQuizzes = 0;
    let unsolvedQuizzes = [];
    
    //Si quizzes no está definido es que estamos en la primera pregunta y tenemos que inicializar
    if(req.session.quizzes === undefined){
        req.session.score =0;

        models.quiz.findAll()
        .then(quizzes => {            
            req.session.quizzes = quizzes;

            nUnsolvedQuizzes = req.session.quizzes.length;
            let randomNumber = Math.floor(Math.random() * nUnsolvedQuizzes); 
            let question = req.session.quizzes[randomNumber];
            req.session.quizzes.splice(randomNumber, 1); //Quitamos del array la pregunta que acabamos de hacer
            res.render('quizzes/random_play', {
                score: req.session.score,
                quiz: question
            });
        })
        .catch(err => console.log(err));
    }
    //Si está definido es que ya hemos hecho una pregunta antes y no hace falta inicializar
    else{
        unsolvedQuizzes = req.session.quizzes;
        //Si no quedan preguntas es que ya se han preguntado todas y el jugador ha ganado
        if(unsolvedQuizzes.length === 0){
            let score = req.session.score;

            //Ponemos a undefined los valores de sesión para poder volver a jugar
            req.session.score = undefined;
            req.session.quizzes = undefined;
            
            res.render('quizzes/random_nomore', {
                score
            });
        }
        //Si quedan preguntas, actualizamos las variables de sesión e imprimimos la siguiente pregunta
        else{
            nUnsolvedQuizzes = req.session.quizzes.length;
            let randomNumber = Math.floor(Math.random() * nUnsolvedQuizzes);
            let question = req.session.quizzes[randomNumber];
            req.session.quizzes.splice(randomNumber, 1);
            res.render('quizzes/random_play', {
                score: req.session.score,
                quiz: question
            });
        }
    }
};
*/

// GET /quizzes/randomplay
exports.randomplay = (req, res, next) =>{
    const {quiz, query} = req;

    const answer = query.answer || "";
    let nUnsolvedQuizzes = 0;
    let unsolvedQuizzes = [];
    
    //Si quizzes no está definido es que estamos en la primera pregunta y tenemos que inicializar
    if(req.session.quizzes === undefined){
        req.session.score =0;

        models.quiz.findAll()
        .then(quizzes => {            
            req.session.quizzes = quizzes;

            nUnsolvedQuizzes = req.session.quizzes.length;
            let randomNumber = Math.floor(Math.random() * nUnsolvedQuizzes); 
            let question = req.session.quizzes[randomNumber];
            res.render('quizzes/random_play', {
                score: req.session.score,
                quiz: question
            });
        })
        .catch(err => console.log(err));
    }
    //Si está definido es que ya hemos hecho una pregunta antes y no hace falta inicializar
    else{
        unsolvedQuizzes = req.session.quizzes;
        //Si no quedan preguntas es que ya se han preguntado todas y el jugador ha ganado
        if(unsolvedQuizzes.length === 0){
            let score = req.session.score;

            //Ponemos a undefined los valores de sesión para poder volver a jugar
            req.session.score = undefined; // delete req.session.score
            req.session.quizzes = undefined; // delete req.session.quizzes
            
            res.render('quizzes/random_nomore', {
                score: score
            });
        }
        //Si quedan preguntas, actualizamos las variables de sesión e imprimimos la siguiente pregunta
        else{
            nUnsolvedQuizzes = req.session.quizzes.length;
            let randomNumber = Math.floor(Math.random() * nUnsolvedQuizzes);
            let question = req.session.quizzes[randomNumber];
            res.render('quizzes/random_play', {
                score: req.session.score,
                quiz: question
            });
        }
    }
};

// GET /quizzes/randomcheck/:quizId?answer=respuesta
exports.randomcheck = (req, res, next) => {
    const {quiz, query} = req;

    const answer = query.answer || "";
    const result = answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim();
    let score;
    
    //Si la respuesta es correcta cargamos la siguiente
    if (result) {
        let pos;
        console.log("Sesion: " + req.session.quizzes);
        console.log("Constante quiz" + quiz);
        for(let i in req.session.quizzes){
            if(req.session.quizzes[i] == quiz){
                pos = i;
            }
        }

        req.session.score++;
        score = req.session.score; 
        req.session.quizzes.splice(pos, 1); //Quitamos del array la pregunta que acabamos de hacer

        res.render('quizzes/random_result', {
            answer: answer,
            quiz: quiz,
            result: result,
            score: score
        });
    }else{
        score = req.session.score;
        req.session.quizzes = undefined; // delete req.session.quizzes;
        req.session.score = undefined; // delete req.session.score;

        res.render('quizzes/random_result', {
                answer: answer,
                quiz: quiz,
                result: result,
                score: score
        });
    }
    

};