var keystone = require('keystone'),
    istanbul = require('istanbul'),
    Report = istanbul.Report,
    Reporter = istanbul.Reporter,
    Collector = istanbul.Collector,
    Base = keystone.list('base'),
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
        reporter = new Reporter(config);


    formats = ['html'];
    reporter.addAll(formats);

    root = opts.root || process.cwd();

    collector.add(__coverage__);
    reporter.write(collector, false, function (err) {
        console.log('Done');
        res.sendStatus(200);
    });


};