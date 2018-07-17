/**
 * Created by Nitheen on 2/6/2015.
 */
module.exports = function(grunt) {
  grunt.loadNpmTasks("grunt-mocha-test");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-prompt");
  grunt.loadTasks("./grunt_task");

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    mochaTest: {
      test: {
        options: {
          reporter: "spec",
          captureFile: "results.txt", // Optionally capture the reporter output to a file
          quiet: false, // Optionally suppress output to standard out (defaults to false)
          clearRequireCache: true // Optionally clear the require cache before running tests (defaults to false)
        },
        src: ["test/**/*.js"]
      }
    },
    watch: {
      js: {
        options: {
          spawn: false
        },
        files: "**/*.js",
        tasks: ["default"]
      }
    },
    report: {
      task: {}
    },
    reportTask: {
      task: {
        url: "<%= pkg.stepscan.mongodbpath %>",
        cipher: "<%= pkg.stepscan.crypto %>",
        directoryPath: "./grunt_task/reports/",
        reportFileName: "Report"
      }
    },
    icdMaster: {
      task: {
        proceed: false,
        db: "<%= pkg.stepscan.mongodbpath %>",
        cipher: "<%= pkg.stepscan.crypto %>",
        code: "-1"
      }
    },
    databaseClean: {
      task: {
        delete: false,
        url: "<%= pkg.stepscan.mongodbpath %>",
        cipher: "<%= pkg.stepscan.crypto %>"
      }
    },
    createAccount: {
      task: {
        url: "<%= pkg.stepscan.applicationurl %>"
      }
    },
    createReport: {
      task: {
        url: "<%= pkg.stepscan.mongodbpath %>",
        sectionFileNames: [
          "AverageDistributionAvgAndMax",
          "AverageForce",
          "AverageMaxPressure",
          "BalanceDistributionChart",
          "BalanceReportImage",
          "BalanceReportTable",
          "CenterOfPressureDistribution",
          "GaitPressureTable",
          "GaitReportTable",
          "IndividualFeetDistribution",
          "LeftAndRightZones",
          "PressureDistributionByFootSection",
          "PressureDistributionAvg_Max_Table",
          "participant_gait_report",
          "participant_AverageDistributionAvgAndMax"
        ],
        reportFileName: "Report"
      }
    },
    softwareTab: {
      task: {
        url: "<%= pkg.stepscan.mongodbpath %>",
        cipher: "<%= pkg.stepscan.crypto %>",
        accountId: ""
      }
    },
    specificationList: {
      task: {
        url: "<%= pkg.stepscan.mongodbpath %>",
        cipher: "<%= pkg.stepscan.crypto %>",
        accountId: "<%= pkg.stepscan.id %>"
      }
    },
    allowCamera: {
      task: {
        url: "<%= pkg.stepscan.mongodbpath %>",
        cipher: "<%= pkg.stepscan.crypto %>",
        allow: true
      }
    },
    accountid: {
      task: {
        db: "<%= pkg.stepscan.mongodbpath %>"
      }
    },
    dbConnectTask: {
      task: {
        url: "<%= pkg.stepscan.mongodbpath %>",
        cipher: "<%= pkg.stepscan.crypto %>"
      }
    },
    dbDisConnectTask: {},
    webAccountCreationTask: {
      task: {}
    },
    normativeTask: {
      task: {
        filePath: "./grunt_task/normative_data/"
      }
    },
    module: {
      task: {
        name: "-1"
      }
    },
    prompt: {
      cleanOption: {
        options: {
          questions: [
            {
              config: "databaseClean.task.delete",
              type: "confirm",
              default: false,
              message:
                "Are you sure to delete this db(<%= pkg.stepscan.mongodbpath %>)?"
            }
          ]
        }
      },
      softwareTabOption: {
        options: {
          questions: [
            {
              config: "softwareTab.task.accountId",
              type: "input",
              default: "",
              message: "Please enter the Account ID:"
            }
          ]
        }
      },
      icd_i: {
        options: {
          questions: [
            {
              config: "icdMaster.task.proceed",
              type: "confirm",
              default: false,
              message:
                "Are you sure you want to delete existing (if any) ICD master table and install fresh ICD codes?."
            }
          ]
        }
      },
      icd_u: {
        options: {
          questions: [
            {
              config: "icdMaster.task.proceed",
              type: "confirm",
              default: false,
              message: "Are you sure you want to delete ICD master table?."
            }
          ]
        }
      },
      icd_d: {
        options: {
          questions: [
            {
              config: "icdMaster.task.code",
              type: "confirm",
              default: false,
              message:
                "Please enter ICD code that you want to delete [e for exit]?."
            }
          ]
        }
      },
      module: {
        options: {
          questions: [
            {
              config: "module.task.name",
              type: "input",
              default: "",
              message: "Please enter a module name."
            }
          ]
        }
      }
    },
    mongobackup: {
      options: {
        host: "localhost",
        port: "27017",
        db: "stepscancloud",
        dump: {
          out: "./dump"
        },
        restore: {
          path: "./dump/stepscancloud",
          drop: true
        }
      }
    }
  });

  // On watch events, if the changed file is a test file then configure mochaTest to only
  // run the tests from that file. Otherwise run all the tests
  var defaultTestSrc = grunt.config("mochaTest.test.src");
  grunt.event.on("watch", function(action, filepath) {
    grunt.config("mochaTest.test.src", defaultTestSrc);
    if (filepath.match("test/")) {
      grunt.config("mochaTest.test.src", filepath);
    }
  });

  grunt.registerTask("cleandb", ["prompt:cleanOption", "databaseClean"]);
  grunt.registerTask("account", ["createAccount"]);
  grunt.registerTask("default", ["mochaTest", "watch"]);

  grunt.registerTask("icd", "ICD Master list", function(args) {
    if (arguments.length === 0) {
      args = "i";
    }
    switch (args) {
      case "u":
        grunt.task.run(["prompt:icd_u", "icdmaster:u"]);
        break;
      case "i":
        grunt.task.run(["prompt:icd_i", "icdmaster:i"]);
        break;
      case "a":
        grunt.task.run("icdmaster:a");
        break;
      case "d":
        grunt.task.run(["prompt:icd_d", "icdmaster:d"]);
        break;
      default:
        grunt.log.writeln("Valid commands are", "icdmaster:", "i,u,a,d");
        break;
    }
  });

  grunt.registerTask("report", "Install report collections", function(args) {
    if (arguments.length === 0) {
      grunt.task.run("reportTask:i");
    } else {
      switch (args) {
        case "u":
          grunt.task.run("reportTask:u");
          break;
        case "i":
          grunt.task.run("reportTask:i");
          break;
        default:
          grunt.log.writeln(
            "Valid commands are",
            "report",
            "report:i",
            "report:u"
          );
          break;
      }
    }
  });

  grunt.registerTask("run", "Run Individual grunt", function(args) {
    if (arguments.length === 0) {
      grunt.log.error("Valid commands not found");
    } else {
      grunt.log.writeln("Running =>", args);
      grunt.task.run("connect", args, "Disconnect");
    }
  });

  grunt.registerTask("connect", ["dbConnectTask"]);
  grunt.registerTask("Disconnect", ["dbDisConnectTask"]);

  grunt.registerTask("update", [
    "connect",
    "runModule:a",
    "camera",
    "report",
    "normative",
    "specification",
    "icd",
    "Disconnect"
  ]);
  grunt.registerTask("camera", ["allowCamera"]);
  grunt.registerTask("normative", ["normativeTask"]);
  grunt.registerTask("specification", ["specificationList"]);
  grunt.registerTask("webuser", ["webAccountCreationTask"]);

  grunt.registerTask("module", "Stepscan Module", function(args) {
    if (arguments.length === 0) {
      args = "i";
    }
    switch (args) {
      case "u": //Update
        grunt.task.run([
          "prompt:module",
          "connect",
          "runModule:u",
          "Disconnect"
        ]);
        break;
      case "i": //Insert
        grunt.task.run([
          "prompt:module",
          "connect",
          "runModule:i",
          "Disconnect"
        ]);
        break;
      case "d": //delete
        grunt.task.run([
          "prompt:module",
          "connect",
          "runModule:d",
          "Disconnect"
        ]);
        break;
      case "a": //Update All
        grunt.task.run([
          "connect",
          "runModule:a",
          "Disconnect"
        ]);
        break;
      default:
        grunt.log.writeln("Valid commands are", "module:", "i,u,d");
        break;
    }
  });

  return grunt.registerTask("build", ["karma:travis"]);
};

//grunt run:normative
