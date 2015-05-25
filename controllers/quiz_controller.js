var models = require('../models/models.js');

// MW que permite acciones solamente si el quiz objeto pertenece al usuario logeado o si es cuenta admin
exports.ownershipRequired = function(req, res, next){
    var objQuizOwner = req.quiz.UserId;
    var logUser = req.session.user.id;
    var isAdmin = req.session.user.isAdmin;

    if (isAdmin || objQuizOwner === logUser) {
        next();
    } else {
        res.redirect('/');
    }
};

// Autoload :id
exports.load = function(req, res, next, quizId) {
  models.Quiz.find({
              where: {
                  id: Number(quizId)
              },
              include: [{
                  model: models.Comment
              }]
          }).then(function(quiz) {
    if (quiz) {
        req.quiz = quiz;
        next();
    } else{next(new Error('No existe quizId=' + quizId))}
  }
  ).catch(function(error){next(error)});
};

// GET /quizes
//exports.index = function(req, res) {
//  models.Quiz.findAll().then(
//    function(quizes) {
//      res.render('quizes/index.ejs', {quizes: quizes, errors: []});
//    }
//  ).catch(function(error){next(error)});
//};

// GET /quizes/question
exports.index = function(req, res) {
  if (req.query.search) {
    models.Quiz.findAll({where: ["pregunta like ?", '%' + req.query.search + '%']}).then(
    function(quizes) {res.render('quizes/index.ejs', { quizes: quizes, errors: []});}).catch(function(error) { next(error);})
  }
  else{
    models.Quiz.findAll().then(
    function(quizes) {res.render('quizes/index.ejs', { quizes: quizes, errors: []});}).catch(function(error) { next(error)});
  }
};

//
//

// GET /quizes/:id
exports.show = function(req, res) {
  res.render('quizes/show', { quiz: req.quiz, errors: []});
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
  var resultado = 'Incorrecto';
  if (req.query.respuesta === req.quiz.respuesta) {
    resultado = 'Correcto';
  }
  res.render(
    'quizes/answer', 
    { quiz: req.quiz, 
      respuesta: resultado, 
      errors: []
    }
  );
};


//GET /quizes/author
exports.author = function (req, res) {
  models.Quiz.findAll().then(
    function(quizes) {
      res.render('quizes/author', {author: 'Marta Hoyuelos y Rosa Lu', errors: []});
    }
  ).catch(function(error){next(error)});
};


// GET /quizes/new
exports.new = function(req, res) {
  var quiz = models.Quiz.build( // crea objeto quiz 
    {pregunta: "Pregunta", respuesta: "Respuesta"}
  );

  res.render('quizes/new', {quiz: quiz, errors: []});
};

// POST /quizes/create
exports.create = function(req, res) {
  req.body.quiz.UserId = req.session.user.id;
  var quiz = models.Quiz.build( req.body.quiz );

  quiz
  .validate()
  .then(
    function(err){
      if (err) {
        res.render('quizes/new', {quiz: quiz, errors: err.errors});
      } else {
        quiz // save: guarda en DB campos pregunta y respuesta de quiz
        .save({fields: ["pregunta", "respuesta", "UserId"]})
        .then( function(){ res.redirect('/quizes')}) 
      }      // res.redirect: Redirección HTTP a lista de preguntas
    }
  ).catch(function(error){next(error)});
};
// GET /quizes/:id/edit
exports.edit = function(req, res) {
  var quiz = req.quiz;  // req.quiz: autoload de instancia de quiz

  res.render('quizes/edit', {quiz: quiz, errors: []});
};

// PUT /quizes/:id
exports.update = function(req, res) {
  req.quiz.pregunta  = req.body.quiz.pregunta;
  req.quiz.respuesta = req.body.quiz.respuesta;

  req.quiz
  .validate()
  .then(
    function(err){
      if (err) {
        res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
      } else {
        req.quiz     // save: guarda campos pregunta y respuesta en DB
        .save( {fields: ["pregunta", "respuesta"]})
        .then( function(){ res.redirect('/quizes');});
      }     // Redirección HTTP a lista de preguntas (URL relativo)
    }
  ).catch(function(error){next(error)});
};

// DELETE /quizes/:id
exports.destroy = function(req, res) {
  req.quiz.destroy().then( function() {
    res.redirect('/quizes');
  }).catch(function(error){next(error)});
};


//Estadisticas
exports.stadistics = function(req, res) {
models.Quiz.count().then(function(num_preg){
    models.Comment.count().then(function(num_com){
        models.Quiz.findAll({ include: [{ model: models.Comment }] }).then(function(quizes){
            var preg_con_coment=0;
            for(preg in quizes){
                if(quizes[preg].Comments.length)
                preg_con_coment++;
            }
            
            res.render('quizes/stadistics', {
                num_preg: num_preg,
                num_com: num_com,
                media: num_com / num_preg,
                preg_con_coment: preg_con_coment,
                preg_sin_coment: num_preg - preg_con_coment,
                errors: []});
        })
    })
});
}

