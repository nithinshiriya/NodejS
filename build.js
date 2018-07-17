var readline = require("readline");
var fs = require('fs');

var buildPath = "./dist"; //Local System

var mustFiles = [
  "/web.config",
  "/Gruntfile.js",  
  "/server.js",
  "/authentication",
  "/business-logic",
  "/database",
  "/general",
  "/grunt_task",
  "/icd",
  "/interface_impl",
  "/models",
  "/routes",
  "/specification",
  "/web-search",
  "/storage"
]

var azure = [
  "/transaction"
]


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


function buildClient(type, deployPath){
  buildPath = deployPath;
   console.log("Building Stepscan(r) Service for Client system.....");
   createDistributionDir(buildPath);
   copyFiles(mustFiles, buildPath);   
   logDirectory(buildPath);
   var packageJson =  getPackageJson(buildPath);
   packageJson.stepscan.port = 0;
    packageJson.stepscan.appBasePath = "stepscan/api/";
    packageJson.stepscan.applicationurl = "localhost/stepscan/api/";
    packageJson.stepscan.allowCameraFile = true;
    packageJson.stepscan.fileStorage = "database";
    packageJson.stepscan.mongodbpath = "";
    packageJson.stepscan.tokenSecret = "";
    packageJson.stepscan.tokenIssuer ="";
    packageJson.stepscan.crypto = "";
    savePackageJson(buildPath, packageJson);
}

function buildAzure(type, deployPath){
  buildPath = deployPath;
   console.log("Building Stepscan(r) Service for Azure system.....");
   createDistributionDir(buildPath);
   copyFiles(mustFiles, buildPath);
   copyFiles(azure, buildPath);
   logDirectory(buildPath);
   var packageJson =  getPackageJson(buildPath);    
   packageJson.stepscan.port = 0;
    packageJson.stepscan.appBasePath = "stepscan/api/";
    packageJson.stepscan.applicationurl = "localhost/stepscan/api/";
    packageJson.stepscan.allowCameraFile = false;
    packageJson.stepscan.fileStorage = "";
    packageJson.stepscan.mongodbpath = "";
    packageJson.stepscan.tokenSecret = ""
    packageJson.stepscan.tokenIssuer = "";
    packageJson.stepscan.crypto = "";
    savePackageJson(buildPath, packageJson);    
}

function getPackageJson(){  
  var jsonContent =  fs.readFileSync("./package.json", "utf8");
  return  JSON.parse(jsonContent);
}

function savePackageJson(destionationPath, jsonObject){  
  fs.writeFileSync(destionationPath + "/package.json" , JSON.stringify(jsonObject, null, 2) );
}

function logDirectory(destionationPath){
    destionationPath = destionationPath + "/log";        
    if (!fs.existsSync(destionationPath)){
      fs.mkdirSync(destionationPath);
    }  
}

function copyFiles(files, destionationPath){
  files.forEach(function(file) {
    var sourceFile = "." + file;
    if(fs.lstatSync(sourceFile).isDirectory()){
        copyFolderRecursive(file, destionationPath);
    }else{
        copyFile(sourceFile,  (destionationPath + file));
    }     
  });
}

var copyFolderRecursive = function(path, destionationPath) {
  var lookFile = "." + path;
  var orginalPath = destionationPath;
  if( fs.existsSync(lookFile) ) {  
    destionationPath = destionationPath + path;        
    if (!fs.existsSync(destionationPath)){
      fs.mkdirSync(destionationPath);
    }
    fs.readdirSync(lookFile).forEach(function(file,index){
      var curPath = lookFile + "/" + file;      
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        copyFolderRecursive(path + "/" + file, orginalPath);
      } else { // copy file
        copyFile(curPath, destionationPath + "/" + file);        
      }
    });    
  }
};

function copyFile(sourcePath, destinationPath){
  fs.createReadStream(sourcePath).pipe(fs.createWriteStream(destinationPath));
}

function createDistributionDir(path){
  if (fs.existsSync(path)){
      deleteFolderRecursive(path);
  }  
  fs.mkdirSync(path);
}

var deleteFolderRecursive = function(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};


//Prompt for Build system
rl.question('Please enter build type => Client[C], Azure[A]? ', (answer) => {  
        path = buildPath;
        switch(answer.toLowerCase()){
          case "c":    
            buildClient("c" , path);
            break;
          case "a":    
            buildAzure("a", path)
            //console.log('Azure:', answer);
            break;                  
        }
        rl.close();
  });  