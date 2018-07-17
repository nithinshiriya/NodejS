
## Get Account Details
```sh
    db.accounts.find({}, { _id:1, entityName:1})
```

## Update Pay Per Usage
```sh
    db.accounts.update({_id: ObjectId("AccountId")}, { $set: {"payPerUse": true }})    
```

## Update Account No
```sh
    db.accounts.update({_id: ObjectId("AccountId")}, { $set: {"accountNo": 1 }})    
```