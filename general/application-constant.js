'use strict';

var constant = {
    ROLE_TYPES                          : {
        rl_Super_Admin                  : 'rlSuperAdmin',
        rl_Admin                        : 'rlAdmin',
        rl_User                         : 'rlUser',
        allTypes                        : ['rlSuperAdmin', 'rlAdmin', 'rlUser'],
        rolesList                       : [
            {
                key                     : 'rlAdmin',
                name                    : 'Admin'
            },
            {
                key                     : 'rlUser',
                name                    : 'User'
            }
        ]
    },
    ACCOUNT_TYPES                       : {
        ac_stepscan_empty               : 'stepscan_empty',
        ac_stepscan_software_gait       : 'stepscan_software_gait',
        ac_stepscan_software_balance    : 'stepscan_software_balance',
        ac_stepscan_research            : 'stepscan_research',
        types                           : ['stepscan_empty', 'stepscan_research', 'stepscan_software_gait', 'stepscan_software_balance']
    },
    PERMISSIONS                         : {
        allPermissions                  : ['prUserManagement', 'prClient', 'prComparativeStat', 'prInvoice'],        
        permissionList                  : [
            {
                key                     : 'prUserManagement',
                name                    :  'User Management'
            },
            {
                key                     : 'prClient',
                name                    :  'Patients'
            },
            {
                key                     : 'prComparativeStat',
                name                    :  'Normatives'
            }
        ],
        permissionListInvoice           : [
            {
                key                     : 'prUserManagement',
                name                    :  'User Management'
            },
            {
                key                     : 'prClient',
                name                    :  'Patients'
            },
            {
                key                     : 'prComparativeStat',
                name                    :  'Normatives'
            },
             {
                key                     : 'prInvoice',
                name                    :  'Invoice'            
             }            
        ]        
    },

	msg_route_home 						: 'Welcome to Stepscan(r). Please contact us for service enquiry @ http://stepscan.com/',
	error 								: 'error',
	ok 									: 'OK',
	route_post_registeraccount 			: 'registeraccount',
	array_user_roles 					: new Array('admin', 'user'),
	array_user_roles_list				: new Array('admin', 'user'),
	permission_admin					: new Array('admin'),
	permission_stepscan					: new Array('stepscanadmin'),
    REPORT_HEADER_COLOR                 : '#FFCC33',
    FILE_TYPE                           : { 'tile' : 'tile', 'camera' : 'camera' },

	//Application Error Messages
	error_account_inactive				: 'Inactive account',
	ERROR_DUPLICATE_USER				: 'Duplicate user name found',
	ERROR_NULL_USER						: 'Null user object passed',
	ERROR_INVALID_EMAIL					: 'User name should be an email address.',
	ERROR_USER_SHOULD_NOT_ARRAY			: 'User object should not be an array.',
	ERROR_USER_NOT_FOUND				: 'User not found.',
	ERROR_NO_FILE_FOUND					: 'No File found',
	ERROR_INVALID_ACCOUNTID				: 'Invalid account id',
	ERROR_FOUND_KEY_PROPERTIES 			: 'Found some of the key properties are defined in the sample',
	ERROR_INVALID_INPUTS                : 'Invalid inputs',

	//Mongo Query
	queryreturn_validuser				: {'users.$': 1, _accountID: 1, entityName: 1, isActive: 1},
	queryreturn_users					: {'users._userID': 1, 'users.userName': 1, 'users.firstName': 1, 'users.lastName': 1, 
											'users.roles': 1, 'users.isActive': 1, 'users.isDeleted': 1 },
    //TODO : Move to database
    softwareTabs                        : [
        {
            name: 'Search',
            key: 'TabSearch',
            enumName: "Search",
            automatedTest: false,
            items: [
                {
                    name: 'Home',
                    key: 'NodeHome',
                    type: '',
                    isTreeViewItem: false,
                    typeValue: {}
                },
                {
                    name: 'Client',
                    key: 'NodeClient',
                    type: '',
                    isTreeViewItem: false,
                    typeValue: {}
                },
                {
                    name: 'Project/Session',
                    key: 'NodeProject_Session',
                    type: '',
                    isTreeViewItem: false,
                    typeValue: {}
                },
                {
                    name: 'Sample',
                    key: 'NodeSample',
                    type: '',
                    isTreeViewItem: false,
                    typeValue: {}
                }
            ]
        },
        {
            name: 'Gait',
            key: 'TabGait',
            enumName: "Gait",
            automatedTest: false,
            items: [
                {
                    name: 'Replay',
                    key: 'NodeRecordPreview',
                    type: 'GaitPreview',
                    isTreeViewItem: true,
                    typeValue: {}
                },
                {
                    name: 'MetaData',
                    key: 'NodeMetadata',
                    type: 'report',
                    isTreeViewItem: true,
                    typeValue: {}
                },                              
                {
                    name: 'GaitReport',
                    key: 'NodeGaitReportView',
                    type: 'report',
                    isTreeViewItem: true,
                    typeValue: {
                        'showStandardList' : true,
                        'StandardListType' : 'Gait',
                        'reportKey' : 'GaitReport'
                    }
                },
                {
                    name: 'PressureReport',
                    key: 'NodeGaitPressureReport',
                    type: 'report',
                    isTreeViewItem: true,
                    typeValue: {
                        'showStandardList' : true,
                        'StandardListType' : 'GaitPressure',                        
                        'reportKey' : 'GaitPressureReportFrame'
                    }
                },
                {
                    name: 'PressureAnalysis',
                    key: 'NodePressureAnalysis',
                    type: '',
                    isTreeViewItem: true,
                    typeValue: {}
                },
                {
                    name: 'Record',
                    key: 'Record',
                    type: 'GaitRecord',
                    isTreeViewItem: false,
                    typeValue: {}
                },
                {
                    name: 'Footprints',
                    key: 'NodeSampleEditor',
                    type: 'GaitSampleEditor',
                    isTreeViewItem: true,
                    typeValue: {}
                }                               
            ]
        },
        {
            name: 'Balance',
            key: 'TabBalance',
            enumName: "Balance",
            automatedTest: false,
            items: [
                {
                    name: 'Replay',
                    key: 'NodeRecordPreview',
                    type: 'BalancePreview',
                    isTreeViewItem: true,
                    typeValue: {}
                },          
                {
                    name: 'MetaData',
                    key: 'NodeMetadata',
                    type: 'report',
                    isTreeViewItem: true,
                    typeValue: {}
                },                      
                {
                    name: 'BalanceReport',
                    key: 'NodeBalanceReportView',
                    type: 'report',
                    isTreeViewItem: true,
                    typeValue: {
                        'showStandardList' : true,
                        'StandardListType' : 'Balance',
                        'reportKey' : 'BalanceReport'
                    }
                },
                {
                    name: 'PressureAnalysis',
                    key: 'NodePressureAnalysis',
                    type: '',
                    isTreeViewItem: true,
                    typeValue: {}
                },
                {
                    name: 'Record',
                    key: 'Record',
                    type: 'BalanceRecord',
                    isTreeViewItem: false,
                    typeValue: {}
                },
                {
                    name: 'Footprints',
                    key: 'NodeSampleEditor',
                    type: 'BalanceSampleEditor',
                    isTreeViewItem: true,
                    typeValue: {}
                }                                
            ]
        },
        {
            name: 'TimedUpAndGo',
            key: 'TabTug',
            enumName: "Tug",
            automatedTest: true,
            items: [
                {
                    name: 'Preview',
                    key: 'NodeRecordPreview',
                    type: 'TugPreview',
                    isTreeViewItem: true,
                    typeValue: {}
                },      
                {
                    name: 'Meta Data',
                    key: 'NodeMetadata',
                    type: 'report',
                    isTreeViewItem: true,
                    typeValue: {}
                },                       
                {
                    name: 'Gait Report',
                    key: 'NodeReportView',
                    type: 'report',
                    isTreeViewItem: true,
                    typeValue: {
                        'showStandardList' : true,
                        'StandardListType' : 'Gait',
                        'reportKey' : 'GaitReport'
                    }
                },
                {
                    name: 'Record',
                    key: 'Record',
                    type: 'TugRecord',
                    isTreeViewItem: false,
                    typeValue: {}
                },                   
            ]
        }        
    ],
    
    ethnicity                           : ['White', 'Hispanic or Latino', 'Native American or American Indian', 'Asian / Pacific Islander',  'Other'],
    automatedTestList   : [
        {
            name: "Concussion",
            description: "Concussion",
            enumName : "Concussion"
        }          
    ]

};


module.exports = constant;