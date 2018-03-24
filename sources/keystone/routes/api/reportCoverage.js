var keystone = require('keystone'),
    Base = keystone.list('base'),
    istanbul = require('istanbul'),
    Report = istanbul.Report,
    Reporter = istanbul.Reporter,
    Collector = istanbul.Collector,
    nopt = require('nopt'),
    path = require('path'),
    fs = require('fs'),
    Collector = istanbul.Collector,
    util = require('util'),
    Command = istanbul.Command,
    configuration = istanbul.config;

exports = module.exports = function (req, res) {

    var template = {
        config: path,
        root: path,
        dir: path,
        include: String,
        verbose: Boolean
    },
        opts = nopt(template, { v: '--verbose' }, undefined, 0),
        includePattern = opts.include || '**/coverage*.json',
        root,
        collector = new Collector(),
        config = configuration.loadFile(opts.config, {
            verbose: opts.verbose,
            reporting: {
                dir: opts.dir
            }
        }),
        reporter = new Reporter(config, keystone.get('locals').logDirName + "coverage");

    formats = ['html','json'];
    reporter.addAll(formats);

    root = opts.root || process.cwd();

    try {
        collector.add(__coverage__);
        reporter.write(collector, false, function (err) {
            return res.status(200).json(Base.model.structuredJsonResponse(true, [{
                noOfCollectedFiles: collector.files().length
              }]));
        });
    } catch (err) {
        // When ___coverage___ is not defined most probably we do not run in mode coverage-test
        if (err.name === "ReferenceError" && err.message.indexOf("__coverage__") > -1) {
            return res.status(200).json(Base.model.structuredJsonResponse(true, [{
                noOfCollectedFiles: 0
              }]));
        } else {
            throw err;
        }
        
    }
};