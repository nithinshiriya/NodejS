use admin
db.createUser({user: "vitraksystems",pwd: "sTepS(@n",roles: [ "root" ]})

use stepscancloud
db.createUser({user: "stepscan",pwd: "sc@n5tep",roles: [ {"role" : "readWrite", "db": "stepscancloud" }]})

use admin
db.system.users.find()