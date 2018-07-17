'use strict';

//Rest API 
var restify                 = require('restify');
//Authentication
var passport                = require('passport');
//Package Json
var packageJson             = require('./package.json');
//Database connection
var dbConnection            = require('./database/db-connection');
//Account route
var accountRoute            = require('./routes/account-route');
//Patient route
var patientRoute            = require('./routes/patient-route');
//Sample route
var sampleRoute             = require('./routes/sample-route');
//Report route
var reportRoute             = require('./routes/report-route');
//Standard route
var standardRoute           = require('./routes/standard-route');
//Search route
var searchRoute             = require('./routes/search-route');
//ICD route
var icdRoute                = require('./icd/icd-route');
var icdService              = require('./icd/icd-service');
//Specification
var specificationRoute                = require('./specification/specification-route');
var specificationService              = require('./specification/specification-service');

//web Search
var webSearchRoute          =require("./web-search/websearch-route");

//Application logger
var logger                  = require('./general/application-logger');
//Transaction Route
var transactionRoute;
var transactionMGR;

/**
 *  Define the account management service application.
 */
var StepscanCloudService = function() {

    //  Scope.
    var self = this;

    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.        
        self.port      = process.env.PORT;
        self.DisplayPort;

        if( packageJson.stepscan.port !== 0){
             self.port = packageJson.stepscan.port;
             self.DisplayPort = packageJson.stepscan.port;
        }else{
             self.DisplayPort = "80";
        }        

    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === 'undefined') {
            self.zcache = { 'index.html': '' };
        }
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === 'string') {
            console.log('%s: Received %s - terminating sample app ...',
                Date(Date.now()), sig);
            process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
            'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element) {
                process.on(element, function() { self.terminator(element); });
            });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        var basepath = packageJson.stepscan.appBasePath;
        var ICDService = new icdService();
        accountRoute(self.app);
        patientRoute(self.app);        
        sampleRoute(self.app, dbConnection, transactionMGR, ICDService);
        reportRoute(self.app);
        standardRoute(self.app, dbConnection);
        searchRoute(self.app, basepath);
        icdRoute(self.app, basepath, ICDService);    

        var speciService = new specificationService(packageJson.stepscan.id);
        specificationRoute(self.app, basepath, speciService);

        if(transactionMGR){
            transactionRoute(self.app, basepath, transactionMGR)
        }
         self.setupServiceRoute(basepath);  

         webSearchRoute(self.app, basepath + "web/", dbConnection);
    };

    self.setupServiceRoute = function(basePath){

        //Service Version
        self.app.get({path: basePath, version: '1.0.0'}, function(req, res, next){
            res.send(packageJson.version);
            next();
        }); 

        //Database Status
        self.app.get({path: basePath + 'health', version: '1.0.0'}, function(req, res, next){
            var health = {
                version: packageJson.version,
                database: dbConnection.getStatus(),
                lastError: logger.lastError
            }
            res.send(health);
            next();
        }); 
    }

    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.app = restify.createServer({
            versions: ['1.0.0', '2.0.0']
        });
        self.app.pre(restify.pre.sanitizePath());
        self.app.use(restify.queryParser());
        self.app.use(restify.bodyParser());
        self.app.use(restify.CORS({'origins' : ['*'], methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS']}));
        self.app.use(restify.fullResponse());
        self.app.use(passport.initialize()); //Passport for authentication.
        self.createRoutes();

        self.InitializeDatabase();

        self.app.use(accountRoute);
        self.app.use(patientRoute);
        self.app.use(sampleRoute);
        self.app.use(reportRoute);
        self.app.use(standardRoute);
        self.app.use(searchRoute);        
        self.app.use(icdRoute);
        self.app.use(specificationRoute);
        
        if(transactionMGR) {            
            self.app.use(transactionRoute);
        }
    };

    /**
     * [Initialize database and connect]
     */
    self.InitializeDatabase = function() {        
        dbConnection.connect(packageJson.stepscan.mongodbpath, packageJson.stepscan.crypto);
    };

    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initTransaction();
        self.initializeServer();
    };

    self.initTransaction = function(){        
        try{            
            var transaction = require('./transaction/transaction-manager');            
            transactionMGR = new transaction();
            transactionRoute = require('./transaction/transaction-route');
        } catch(err){
            console.log("[-------TRANSACTION MODULE NOT FOUND-------]");
        }
    };

    /**
     * [unknownMethodHandler : Handling CORS OPTIONS ]
     */
    self.unknownMethodHandler = function(req, res) {
        if (req.method.toLowerCase() === 'options') {
            var allowHeaders = ['Accept', 'Accept-Version', 'Content-Type', 'Api-Version', 'Authorization'];

            if (res.methods.indexOf('OPTIONS') === -1) {res.methods.push('OPTIONS');}

            res.header('Access-Control-Allow-Credentials', true);
            res.header('Access-Control-Allow-Headers', allowHeaders.join(', '));
            res.header('Access-Control-Allow-Methods', res.methods.join(', '));
            res.header('Access-Control-Allow-Origin', req.headers.origin);

            return res.send(204);
        }
        else {
            return res.send(new restify.MethodNotAllowedError());
        }
    };

    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //Handling un known method for CORS;
        self.app.on('MethodNotAllowed', self.unknownMethodHandler);
        
        self.app.listen(self.port, function() {
            console.log('%s : \nStepscan Cloud Service started on %s:%d ...',
                Date(Date.now() ), "0.0.0.0", self.DisplayPort);
        });        
    };

};   /*  Account management service Application.  */



/**
 *  main():  Main code.
 */
var cloudService = new StepscanCloudService();
cloudService.initialize();
cloudService.start();


