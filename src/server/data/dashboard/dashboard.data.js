/**
 * Created by sherindharmarajan on 11/10/15.
 */
module.exports = function(app) {

    var soap = require('soap');
    var wsUrl = 'http://dev-vm-websvc.advisen.com:8080/advwebservice/AdvisenTemplateVer1.wsdl?wsdl';
    var api = '/api';
    app.get(api + '/dashboard', getDashboard);

    //Get Dashboard data
    function getDashboard(req, res, next) {
        res.send(getDashboardData());
    }

    function getDashboardData()
    {
        return [
            {
                "company": "General Electric Company",
                "projectName": "US_Public_D&O_GE_023",
                "status": "Submitted",
                "projectHistory": "Yes",
                "createdBy": "sherinkd@live.com",
                "createdName": "Sherin, Dharmarajan",
                "lastUpdated": "2015-09-10"
            },
            {
                "company": "General Electric Company",
                "projectName": "International_Public_D&O_GE_003",
                "status": "Submitted",
                "projectHistory": "Yes",
                "createdBy": "sherinkd@live.com",
                "createdName": "Sherin, Dharmarajan",
                "lastUpdated": "2015-09-09"
            },
            {
                "company": "General Electric Company",
                "projectName": "US_Public_D&O_GE_024",
                "status": "Submitted",
                "projectHistory": "Yes",
                "createdBy": "sherinkd@live.com",
                "createdName": "Sherin, Dharmarajan",
                "lastUpdated": "2015-09-09"
            },
            {
                "company": "Dish TV India Ltd",
                "projectName": "US_Public_D&O_DISHTV_001",
                "status": "Submitted",
                "projectHistory": "Yes",
                "createdBy": "sherinkd@live.com",
                "createdName": "Sherin, Dharmarajan",
                "lastUpdated": "2015-07-25"
            },
            {
                "company": "The Walt Disney Company",
                "projectName": "US_Public_D&O_DIS_048",
                "status": "Submitted",
                "projectHistory": "Yes",
                "createdBy": "sherinkd@live.com",
                "createdName": "Sherin, Dharmarajan",
                "lastUpdated": "2015-07-17"
            }
        ];
    }

};
