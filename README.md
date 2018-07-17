
Running Mongodb command
	1. mongod --dbpath D:\MANGODBDATA

	Note: To enable http access run with below command
	1. mongod --dbpath D:\MANGODBDATA --rest
	To query use below url on browser
	localhost:28017/StepscanCloudDBTest/samples


## How to run test cases for individual files
1. Open the directory where the test file resides.
2. Mocha $filename


## runing Mongo without auth;
mongod --config D:\mongodb\mongod.cfg


# Create Distribution files / Build
> <b>node build.js</b>


## License

MIT © [Nitheen.Rao.T](www.stepscan.com)


[npm-url]: https://npmjs.org/package/stepscan-cloud-service
[npm-image]: https://badge.fury.io/js/stepscan-cloud-service.svg
[travis-url]: https://travis-ci.org/sds/stepscan-cloud-service
[travis-image]: https://travis-ci.org/sds/stepscan-cloud-service.svg?branch=master
[daviddm-url]: https://david-dm.org/sds/stepscan-cloud-service.svg?theme=shields.io
[daviddm-image]: https://david-dm.org/sds/stepscan-cloud-service




Dev office path
"mongodbpath": "[427c8042cbbc1e8c:426ba55c8dab1a92]mongodb://127.0.0.1:27017/stepscancloud",    
"mongodbpath": "mongodb://127.0.0.1:27017/stepscancloud",