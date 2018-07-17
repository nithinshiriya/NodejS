/**
 * Created by Nitheen on 7/8/2015.
 */
/**
 * Created by Nitheen on 3/28/2015.
 */
var accountSchema = require("../models/mongoose-model").Account,
  constant = require("../general/application-constant");
var sample_type_path = "./sample_modules/";
var fs = require("fs");

module.exports = function(grunt) {
  grunt.registerTask("runModule", function(args) {
    var done = this.async();
    var task = grunt.config("module").task;

    if (args !== "a") {
      var filePath = sample_type_path + task.name + ".json";
      if (!fs.existsSync(filePath)) {
        grunt.log.error(filePath + " Not found.");
        return done();
      }
    }

    accountSchema
      .find()
      .select("_id software")
      .then(function(accounts) {
        var promiseArray = [];
        accounts.forEach(function(account) {
          if (args === "a") {
            promiseArray.push(updateAll(account));
          } else {
            promiseArray.push(setModuleList(account, task.name, args));
          }
        });
        return Promise.all(promiseArray).then(response => {
          return response;
        });
      })
      .then(response => {
        grunt.log.ok(response.length + " Accounts where updated");
        done();
      })
      .catch(function(error) {
        grunt.log.error(error);
        done();
      });
  });
};

function updateTab(account, moduleName) {
  var tabs = [];
  account.software.tabs.forEach(function(tab) {
    if (tab.name !== moduleName) {
      tabs.push(tab);
    }
  });

  var content = fs.readFileSync(
    sample_type_path + moduleName + ".json",
    "utf8"
  );
  tabs.push(JSON.parse(content));

  return accountSchema
    .findByIdAndUpdate(account._id, { $set: { "software.tabs": tabs } })
    .exec();
}

function getModuleSet(account, moduleName) {
  var modules = [];
  account.software.tabs.forEach(function(tab) {
    if (tab.name !== moduleName) {
      modules.push(tab);
    }
  });
  return modules;
}

function addToList(modules, moduleName) {
  try
  {
    var content = fs.readFileSync(
      sample_type_path + moduleName + ".json",
      "utf8"
    );
    modules.push(JSON.parse(content));
  }
  catch(error){
    console.log(error);
  }
  return modules;
}

function setModuleList(account, moduleName, mode) {
  var modules = getModuleSet(account, moduleName);
  switch (mode) {
    case "i":
      modules = addToList(modules, moduleName);
      break;
    case "u":
      modules = addToList(modules, moduleName);
      break;
  }

  return accountSchema
    .findByIdAndUpdate(account._id, { $set: { "software.tabs": modules } })
    .exec();
}

function updateAll(account) {
  var modules = [];
  account.software.tabs.forEach(function(tab) {
    addToList(modules, tab.name);
  });

  return accountSchema
    .findByIdAndUpdate(account._id, { $set: { "software.tabs": modules } })
    .exec();
}
