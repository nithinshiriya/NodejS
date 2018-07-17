/**
 * Created by Nitheen on 2/6/2015.
 */
module.exports = function(config) {
    return config.set({
        basePath: "",
        frameworks: ["jasmine"],
        preprocessors: {
            'test/*Test*': ['webpack']
        },
        files: [
            'authentication/*.js',
            'business-logic/*.js',
            'database/*.js',
            'general/*.js',
            'models/*.js',
            'routes/*.js',
            'test/*.js',
            'test/test_transaction/*.js',
            'transaction/*.js'],
        exclude: [],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ["PhantomJS"],
        captureTimeout: 60000,
        singleRun: false
    });
};