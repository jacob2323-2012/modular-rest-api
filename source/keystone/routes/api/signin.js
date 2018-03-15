var keystone = require('keystone'),
  Base = keystone.list('base');

exports = module.exports = function (req, res) {

  if (!req.body.username || !req.body.password || !req.body.secret) {
    return res.status(403).json(Base.model.structuredJsonResponse(false,
      Base.model.structuredErrorObjects(Base, ["credentials_not_complete"])
    ));
  }

  var secretCorrect = req.body.secret === keystone.get('cookie secret');

  keystone.list('users').model.findOne({ email: req.body.username }).exec(function (err, user) {

    if (err) {

      // we need to output the error response here, because Mongoose model will encapsulate
      // the error so that we cannot react in error handling in middleware
      Base.model.outputInternalError(err, req, res);
      throw new Error("Unexpected Problem while attempt to signin. Error: " + err);
    } else {
      if (!user || !secretCorrect) {
        return res.status(403).json(Base.model.structuredJsonResponse(false,
          Base.model.structuredErrorObjects(Base, ["credentials_not_correct"])
        ));
      }
    }

    keystone.session.signin({ email: user.email, password: req.body.password }, req, res, function (user) {

      return res.status(200).json(Base.model.structuredJsonResponse(true, [{
        session: true,
        date: new Date().getTime(),
        userId: user.id
      }]));
    }, function (err) {
      if (err && err.message && err.message.indexOf("Incorrect") === 0) {
        return res.status(403).json(Base.model.structuredJsonResponse(false,
          Base.model.structuredErrorObjects(Base, ["credentials_not_correct"])
        ));
      } else {

        // we need to output the error response here, because Mongoose model will encapsulate
        // the error so that we cannot react in error handling in middleware
        Base.model.outputInternalError(err, req, res);
        throw new Error("Unexpected Problem while attempt to signin. Error: " + err);
      }
    });
  });
};