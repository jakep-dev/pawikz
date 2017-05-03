/**
 * Created by sherindharmarajan on 1/4/16.
 */
(function() {
    'use strict';

    angular
        .module('app.dashboard.business', [])
        .service('dashboardBusiness', dashboardBusiness);

    /* @ngInject */
    function dashboardBusiness(commonBusiness, $compile, $rootScope) {
        this.searchCompanyId = 0;
        this.searchUserId = 0;

        var isFilterDasboard = false;
        var isClearDashboard = false;
        
        var business = {
            getActionButtonsHtml: getActionButtonsHtml,
            getWorkupHtml: getWorkupHtml,
            getPlatformHtml: getPlatformHtml,
            renderHtml : renderHtml
        }

        Object.defineProperty(this, 'isFilterDasboard', {
            enumerable: true,
            configurable: false,
            get: function() {
                return isFilterDasboard;
            },
            set: function(value) {
                isFilterDasboard = value;
                commonBusiness.emitMsg('FilterDashboard');
            }
        });

        Object.defineProperty(this, 'isClearDashboard', {
            enumerable: true,
            configurable: false,
            get: function() {
                return isFilterDasboard;
            },
            set: function(value) {
                isFilterDasboard = value;
                commonBusiness.emitMsg('ClearFilterDashboard');
            }
        });

        //get action buttons html in dashboard
        function getActionButtonsHtml(data, type, full, meta)
        {
            return '<div layout="row" layout-align="left center"> ' +
                    '<div> ' +
                        '<md-icon md-font-icon="icon-rotate-3d"  class="renewStyle" projectId="'+ full.projectId +'" projectName="'+ full.projectName +'"> ' +
                            '<md-tooltip md-direction="top">Renew</md-tooltip> ' +
                        '</md-icon> ' +
                    '</div> ' + 
                    '<div> ' +
                        '<md-icon md-font-icon="icon-delete" class="deleteWorkupStyle" projectId="'+ full.projectId +'" projectName="'+ full.projectName +'"> ' +
                            '<md-tooltip md-direction="top">Delete</md-tooltip> ' +
                        '</md-icon> ' + 
                    '</div> ' + 
                '</div> ';
        }

        // get workup link html in dashboard
        function getWorkupHtml(data, type, full, meta)
        {
            var projectName = (Number(full.projectId) === Number(commonBusiness.projectId))? commonBusiness.projectName : data;
            return '<a class="overviewStyle" overview="true" projectId="'+ full.projectId +'"  href="#">' + projectName + '</a>';
        }

        // get platform image
        function getPlatformHtml(data, type, full, meta)
        {
            var imgSrc = (full.isNewFramework === 'Y')? 'new-platform-logo' : 'advisen-logo';
            return '<span class="' + imgSrc + '"></span>';
        }

        function renderHtml(api, rowIdx, columns) {
        var data = api.cells( rowIdx, ':hidden' ).eq(0).map( function ( cell ) {
				var header = $( api.column( cell.column ).header() );
				var idx = api.cell( cell ).index();

				if ( header.hasClass( 'control' ) || header.hasClass( 'never' ) ) {
					return '';
				}
				
				var dtPrivate = api.settings()[0];
				var cellData = dtPrivate.oApi._fnGetCellData(
					dtPrivate, idx.row, idx.column, 'display'
				);
				var title = header.text();
				if ( title ) {
					title = title + ':';
				}

				return '<li data-dtr-index="'+idx.column+'">'+
                            '<span class="dtr-title">'+
                                title+
                            '</span> '+
                        '</li>' +
                        '<li data-dtr-index="'+idx.column+'">'+
                            '<span class="dtr-data">'+
                                cellData+
                            '</span>'+
					    '</li>';
			} ).toArray().join('');

            var row = $('<ul id="dashBoardDetailsExtension" data-dtr-index="'+rowIdx+'"/>').append(data);
            
            $compile(row.contents())($rootScope);
            
            return row;
        }

        return business;
    }
})();
