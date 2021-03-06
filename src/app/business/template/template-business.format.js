(function() {
    'use strict';

    angular
        .module('app.template.business.format', [])
        .service('templateBusinessFormat', templateBusinessFormat);

    /* @ngInject */
    function templateBusinessFormat(toast, $filter, templateBusiness, overviewBusiness, clientConfig) {
        var business = {
            getFormatObject: getFormatObject,
			getHybridTableFormatObject: getHybridTableFormatObject,
            removeFixes: removeFixes,
            formatData: formatData,
			formatProgramTableData: formatProgramTableData,

    		getMnemonicAlignment: getMnemonicAlignment,
    		getMnemonicDataType: getMnemonicDataType,
    		getMnemonicDefaultValue: getMnemonicDefaultValue,
    		getMnemonicPrecision: getMnemonicPrecision,
    		getMnemonicPrefix: getMnemonicPrefix,
    		getMnemonicPostfix: getMnemonicPostfix,
    		removeNonNumericCharacters: removeNonNumericCharacters,
    		isKMB: isKMB,
    	    getAlignmentForLabelItem : getAlignmentForLabelItem,
            getAlignmentForGenericTableItem : getAlignmentForGenericTableItem,
            getAlignmentForTableLayoutGenericTextItem: getAlignmentForTableLayoutGenericTextItem,
            getAlignmentForTableLayoutR : getAlignmentForTableLayoutR,
            getAlignmentForTableLayoutNonEditable : getAlignmentForTableLayoutNonEditable,
            getAlignmentWidthColumForTableLayout : getAlignmentWidthColumForTableLayout,
            formatDate: formatDate,
			parseDate: parseDate,
			getScrapedHTML: getScrapedHTML

        }
    	return business;

    	function getFormatObject(tearsheet) {
    	    var formatObject = new Object();
    	    var value;
    	    formatObject.dataType = templateBusiness.getMnemonicDataType(tearsheet);
    	    formatObject.dataSubtype = templateBusiness.getMnemonicDataSubtype(tearsheet);
    	    formatObject.prefix = getMnemonicPrefix(tearsheet);
    	    formatObject.postfix = templateBusiness.getMnemonicPostfix(tearsheet);
    	    value = templateBusiness.getMnemonicPrecision(tearsheet);
    	    formatObject.precision = Number(value);
    	    if ((formatObject.dataType === 'NUMBER') && isNaN(formatObject.precision)) {
    	        if (formatObject.dataSubtype !== 'CURRENCY') {
    	            console.log('Default processing[Adding precision attribute 2]');
    	            formatObject.precision = 2;
    	        } else {
    	            console.log('Default processing[Adding precision attribute 0]');
    	            formatObject.precision = 0;
    	        }
    	    }
    	    formatObject.isKMB = ((tearsheet.onBlur && (tearsheet.onBlur.indexOf('transformKMB(this)') > -1))
                || (tearsheet.onkeyup && (tearsheet.onkeyup.indexOf('transformKMB(this)') > -1))
                || (tearsheet.onChange && (tearsheet.onChange.indexOf('transformKMB(this)') > -1)))
                || false;
    	    if (!formatObject.isKMB && (formatObject.dataType === 'NUMBER') && (formatObject.dataSubtype === 'CURRENCY')) {
    	        console.log('Default processing[Adding KMB attribute]');
    	        formatObject.isKMB = true;
    	    }
    	    formatObject.defaultValue = getMnemonicDefaultValue(tearsheet);
    	    formatObject.isNumeric = templateBusiness.isMnemonicNumberType(tearsheet.Mnemonic);
    	    return formatObject;
    	}

		function getHybridTableFormatObject(tearsheet, mnemonicType) {
			var formatObject = getFormatObject(tearsheet);
			
			if(formatObject) {	
				formatObject.dataType = mnemonicType.dataType;
    	    	formatObject.dataSubtype = mnemonicType.dataSubtype;

				if(formatObject.dataType && formatObject.dataType === 'NUMBER') {
					formatObject.precision = 2;
					formatObject.invalidMessage = clientConfig.messages.programTableHybrid.invalidInput;
				}
			}

			return formatObject;
		}

		function formatProgramTableData(scope) {
			var formatted = scope.value;

            /*
                force to zero if columnName === RETAIN and if 1st row
            */
            if(scope.rowid === '0' && scope.columnname === 'RETAIN' && formatted === '') {
                formatted = '0.00';
            }

             /*
                * formats input except
                * 1) if 1st row and
                * 2) columnName === 'ROL'
            */ 
            if(scope.rowid !== 0 && scope.columnname !== 'ROL') {
                formatted = formatData(formatted, scope.formatObj);
            }

            return formatted;
		}
        
    	function removeFixes(value, formatObj) {

    	    var formatted;

    	    formatted = preFormatData(value, formatObj);
    	    if(formatted === formatObj.defaultValue) {
                formatted = '';
            } else if (formatObj.postProcessingNeeded) {
    	        formatObj.postProcessingNeeded = undefined;
    	        if (formatObj.isNegative) {
    	            formatted = '-' + formatObj.numericValue.toString();
    	        } else {
    	            formatted = formatObj.numericValue.toString();
    	        }
            }

/*
    	    if (value) {
    	        formatted = value.trim();
    	    } else {
    	        formatted = value;
    	    }
    		
    	    if(formatObj && formatted && formatted.length > 0)
    	    {
    	        switch (formatObj.dataType) {
    	            case 'NUMBER':
    	                var index;
    	                var lParenIndex;
    	                var rParenIndex;
    	                var isNegative = false;
    	                var numericValue;

    	                if (formatObj.prefix) {
    	                    index = formatted.indexOf(formatObj.prefix);
    	                    if (index === 0) {
    	                        formatted = formatted.substr(formatObj.prefix.length)
    	                    }
    	                }
    	                if (formatObj.postfix) {
    	                    index = formatted.indexOf(formatObj.postfix);
    	                    if (index >= 0) {
    	                        formatted = formatted.substr(0, index);
    	                    }
    	                }
    	                lParenIndex = formatted.indexOf('(');
    	                rParenIndex = formatted.indexOf(')');
    	                if ((lParenIndex >= 0) && (rParenIndex >= 0) && (lParenIndex < rParenIndex)) {
    	                    isNegative = true;
    	                    formatted = formatted.substr(lParenIndex + 1, rParenIndex - lParenIndex - 1);
    	                }
    	                formatted = formatted.replace(/[\(\)\,]/g, '').trim();
    	                index = formatted.indexOf('-');
    	                if (index === 0) {
    	                    formatted = formatted.substr(1);
    	                    isNegative = true;
    	                }
    	                numericValue = Number(removeNonNumericCharacters(formatted));
    	                if (isNegative) {
    	                    formatted = '-' + numericValue.toString();
    	                } else {
    	                    formatted = numericValue.toString();
    	                }
    	                break;
    	            case 'DATE':
    	                formatted = templateBusiness.formatDate(formatted, 'DD-MMM-YY');
    	                break;
    	            default:
    	                break;
    	        }
    	    } else if(formatObj && formatObj.defaultValue && formatObj.defaultValue.length > 0) {
    	        formatted = formatObj.defaultValue;
    	    }
*/

    	    return formatted;
    	}

    	function preFormatData(value, formatObj) {

    	    var formatted;

    	    if (value) {
    	        formatted = value.trim();
    	    } else {
    	        formatted = value;
    	    }

    	    if (formatObj && formatted && formatted.length > 0) {
    	        switch (formatObj.dataType) {
    	            case 'NUMBER':
    	                var index;
    	                var lParenIndex;
    	                var rParenIndex;
    	                var isNegative = false;
    	                var numericValue;

    	                if (formatObj.prefix) {
    	                    index = formatted.indexOf(formatObj.prefix);
    	                    if (index === 0) {
    	                        formatted = formatted.substr(formatObj.prefix.length)
    	                    }
    	                }
    	                if (formatObj.postfix) {
    	                    index = formatted.indexOf(formatObj.postfix);
    	                    if (index >= 0) {
    	                        formatted = formatted.substr(0, index);
    	                    }
    	                }
    	                lParenIndex = formatted.indexOf('(');
    	                rParenIndex = formatted.indexOf(')');
    	                if ((lParenIndex >= 0) && (rParenIndex >= 0) && (lParenIndex < rParenIndex)) {
    	                    isNegative = true;
    	                    formatted = formatted.substr(lParenIndex + 1, rParenIndex - lParenIndex - 1);
    	                }
    	                formatted = formatted.replace(/[\(\)\,]/g, '').trim();
    	                index = formatted.indexOf('-');
    	                if (index === 0) {
    	                    formatted = formatted.substr(1);
    	                    isNegative = true;
    	                }
    	                numericValue = Number(removeNonNumericCharacters(formatted, formatObj.invalidMessage));
    	                formatObj.postProcessingNeeded = true;
    	                formatObj.isNegative = isNegative;
    	                formatObj.numericValue = numericValue;
    	                break;
    	            case 'DATE':
    	                var dateObject = null;

                        //parsed date & check if valid date for DD-MMM-YY format
                        dateObject = parseDate(formatted, 'DD-MMM-YY');
                        if(angular.isDate(dateObject)) {
                            formatted = formatDate(dateObject, 'MM/DD/YYYY');
                            break;
                        }

                        //parsed date & check if valid date for MM/DD/YYYY format
                        dateObject = parseDate(formatted, 'MM/DD/YYYY');
                        if(angular.isDate(dateObject)) {
                            formatted = formatDate(dateObject, 'MM/DD/YYYY');
                            break;
                        }
                        
    	                break;
    	            default:
    	                break;
    	        }
    	    } else if (formatObj && formatObj.defaultValue && formatObj.defaultValue.length > 0) {
    	        formatted = formatObj.defaultValue;
    	    }

    	    return formatted;
        }

    	function formatData(value, formatObj) {

    	    var formatted;
    	    var expr = /[0-9]+\.?[0-9]*/;

    	    formatted = preFormatData(value, formatObj);
    	    if (formatObj.postProcessingNeeded && formatted !== formatObj.defaultValue) {
    	        formatObj.postProcessingNeeded = undefined;
    	        if (formatObj.isNegative) {
    	            if (formatObj.dataSubtype === 'CURRENCY') {
    	                formatted = $filter('currency')(formatObj.numericValue, formatObj.prefix, formatObj.precision);
    	            } else {
    	                formatted = $filter('number')(formatObj.numericValue, formatObj.precision);
    	            }
    	            formatted += ')' + formatObj.postfix;
    	            formatted = formatted.substr(0, formatObj.prefix.length) + '(' + formatted.substr(expr.exec(formatted).index);
    	        } else {
    	            if (formatObj.dataSubtype === 'CURRENCY') {
						if(formatted === '0'){
							formatObj.precision = '';
							formatted = $filter('currency')(formatObj.numericValue, formatObj.prefix, formatObj.precision);
						}else{
							formatted = $filter('currency')(formatObj.numericValue, formatObj.prefix, formatObj.precision);
						}
    	            } else {
    	                formatted = $filter('number')(formatObj.numericValue, formatObj.precision);
    	            }
    	            formatted += formatObj.postfix;
    	        }
            }

/*
    	    if (value) {
    	        formatted = value.trim();
    	    } else {
    	        formatted = value;
    	    }
    		
    		if(formatObj && formatted && formatted.length > 0)
    		{
    		    switch (formatObj.dataType) {
    		        case 'NUMBER':
    		            var index;
    		            var lParenIndex;
    		            var rParenIndex;
    		            var isNegative = false;
    		            var numericValue;
    		            var expr = /[0-9]+\.?[0-9]-*-/;

    		            if (formatObj.prefix) {
    		                index = formatted.indexOf(formatObj.prefix);
    		                if (index === 0) {
    		                    formatted = formatted.substr(formatObj.prefix.length)
    		                }
    		            }
    		            if (formatObj.postfix) {
    		                index = formatted.indexOf(formatObj.postfix);
    		                if (index >= 0) {
    		                    formatted = formatted.substr(0, index);
    		                }
    		            }
    		            lParenIndex = formatted.indexOf('(');
    		            rParenIndex = formatted.indexOf(')');
    		            if ((lParenIndex >= 0) && (rParenIndex >= 0) && (lParenIndex < rParenIndex)) {
    		                isNegative = true;
    		                formatted = formatted.substr(lParenIndex + 1, rParenIndex - lParenIndex - 1);
    		            }
    		            formatted = formatted.replace(/[\(\)\,]/g, '').trim();
    		            index = formatted.indexOf('-');
    		            if (index === 0) {
    		                formatted = formatted.substr(1);
    		                isNegative = true;
    		            }
    		            numericValue = Number(removeNonNumericCharacters(formatted));
    		            if (isNegative) {
    		                if (formatObj.dataSubtype === 'CURRENCY') {
    		                    formatted = $filter('currency')(numericValue, formatObj.prefix, formatObj.precision);
    		                } else {
    		                    formatted = $filter('number')(numericValue, formatObj.precision);
    		                }
    		                formatted += ')' + formatObj.postfix;
    		                formatted = formatted.substr(0, formatObj.prefix.length) + '(' + formatted.substr(expr.exec(formatted).index);
    		            } else {
    		                if (formatObj.dataSubtype === 'CURRENCY') {
    		                    formatted = $filter('currency')(numericValue, formatObj.prefix, formatObj.precision);
    		                } else {
    		                    formatted = $filter('number')(numericValue, formatObj.precision);
    		                }
    		                formatted += formatObj.postfix;
    		            }
    		            break;
    		        case 'DATE':
    		            formatted = templateBusiness.formatDate(formatted, 'DD-MMM-YY');
    		            break;
    		        default:
    		            break;
    		    }
    		} else if(formatObj && formatObj.defaultValue && formatObj.defaultValue.length > 0) {
    			formatted = formatObj.defaultValue;
    		}
*/

    		return formatted;
    	}

    	function getMnemonicDataType(tearSheet)
    	{
    		return 'NUMBER';
    	}

    	function removeNonNumericCharacters(value, msg)
    	{
    		var inputVal = $.trim(value);
			var msg = (msg) ? msg : 'Your input is not a valid number.';

            /*
                TODO change to consider negative values for numeric
            */
			var regEx = /[^\d\,\.]/g; 

            //allow only numberic for number datatype
			if(regEx.test(inputVal)){
				toast.simpleToast(msg);
				inputVal = inputVal.replace(regEx,''); 
			}

			return inputVal;
    	}

        /*
        function numberWithCommas(value)
		{ 
			//ensure that value is number
			if(value+''.match(/^-?[0-9]*[\.]?[0-9]+$/))
			{
				var parts = value.toString().split("."); 
				parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ","); 
				return parts.join("."); 
			}
			
			return value;
        }
        */

        //get currency symbol prefix
    	function getMnemonicPrefix(tearSheet) {
    	    var prefix = '';

    	    if (isCurrencySubtype(tearSheet.Mnemonic) && overviewBusiness.templateOverview && overviewBusiness.templateOverview.defaultCurrency) {
    	        var currency = overviewBusiness.templateOverview.defaultCurrency;
    	        switch (currency) {
    	            case 'USD':
    	            case 'CAD':
    	                prefix = '$';
    	                break;
    	            case 'JPY':
    	                prefix = '¥';
    	                break;
    	            case 'EUR':
    	                prefix = '€';
    	                break;
    	            case 'GBP':
    	                prefix = '£';
    	                break;
    	            case 'CHF':
    	                prefix = 'CHF';
    	                break;
    	            default:
    	                prefix = '';
    	        }
    	    }
    	    return prefix;
    	}

        //check if subtype is CURRENCY to add prefix (currency symbol)
        function isCurrencySubtype(mnemonicValue)
        {
            var isCurrency = false;
            if(templateBusiness.mnemonics)
            {

                var mnemonic = _.find(templateBusiness.mnemonics, function(m)
                {
                  if(m.mnemonic === mnemonicValue)
                  {
                      return m;
                  }
                });

                if(mnemonic)
                {
                    isCurrency = mnemonic.dataSubtype === 'CURRENCY';
                }
            }
            
            return isCurrency;
        }


        //get KMB indicators for NUMBER types
    	function getMnemonicPostfix(tearSheet) {
    	    var postFix = '';

    	    //xml units value set
    	    var xmlParameters = getMnemonicParameters(tearSheet);
    	    if (xmlParameters && xmlParameters.unit_in) {
    	        return getKMBIndicator(xmlParameters.unit_in);
    	    }

    	    //webservice default units value
    	    if (business.mnemonics) {
    	        var mnemonic = _.find(business.mnemonics, function (m) {
    	            if (m.mnemonic === tearSheet.Mnemonic) {
    	                return m;
    	            }
    	        });

    	        if (mnemonic) {
    	            return getKMBIndicator(mnemonic.units);
    	        }
    	    }
    	    return postFix;
    	}

    	function getMnemonicDefaultValue(tearSheet)
    	{
    	    if (tearSheet instanceof Object && tearSheet.answer) {
                return tearSheet.answer;
            } else {
                return '';
            }
    	}

    	function getMnemonicPrecision(tearSheet)
    	{
    		/*
				TODO get precision
    		*/

    		return 0;
    	}

    	function isKMB(tearSheet)
    	{
    		/*
				TODO get is KMB
    		*/

    		return false;
    	}

    	function getMnemonicAlignment(tearSheet)
    	{
    		/*
				TODO get alignment
    		*/

    		return '';
    	}

        function getAlignmentForLabelItem(tearSheetItem, classtype){  // use
            
            var classVal = classtype;

            if(!angular.isUndefined(tearSheetItem) && typeof(tearSheetItem.type) != 'object'){
                if((tearSheetItem.type && tearSheetItem.type.indexOf('alignRight') > -1)){
                    classVal = 'align-right-for-label';
                }else if((tearSheetItem.type && tearSheetItem.type.indexOf('alignCenter') > -1)){
                    classVal = 'align-center-for-label';
                }
            }
            return classVal;

        }

        function getAlignmentForGenericTableItem(col, classtype){ // use
            
            var classVal = classtype;

            if(!angular.isUndefined(col) && typeof(col.css) != 'object'){
                if((col.css && col.css.indexOf('alignRight') > -1)){
                    classVal = 'align-right';
                }
            }

            return classVal;
        }

        function getAlignmentForTableLayoutGenericTextItem(tearSheetItem, classtype){  // use
            var classVal = classtype;

            if(!angular.isUndefined(tearSheetItem) && typeof(tearSheetItem.css) != 'object'){
                if((tearSheetItem.css && tearSheetItem.css.indexOf('alignRight') > -1)){
                    classVal = 'align-right';
                }
            }

            return classVal;
        }

        function getAlignmentForTableLayoutR(tearSheetItem, classtype){  // use
            var classVal = classtype;

            if(!angular.isUndefined(tearSheetItem) && typeof(tearSheetItem.css) != 'object'){
                if((tearSheetItem.css && tearSheetItem.css.indexOf('alignRight') > -1)){
                    classVal = 'align-right-tablelayout-r';
                }
            }

            return classVal;
        }

        function getAlignmentForTableLayoutNonEditable(col, classtype){ // use
            
            var classVal = classtype;

            if(!angular.isUndefined(col) && typeof(col.css) != 'object'){
                if((col.css && col.css.indexOf('alignRight') > -1)){
                    classVal = 'align-right-non-editable-table';
                }else if((col.css && col.css.indexOf('alignCenter') > -1)){
                    classVal = 'align-center-non-editable-table';
                }
            }

            return classVal;
        }

        function getAlignmentWidthColumForTableLayout(col, colWidth){ // use
            
            var columnWidth = colWidth;

            if(!angular.isUndefined(col) && typeof(col.css) != 'object'){
                if ((col.css && col.css.indexOf('tableWidth50') > -1)) {
                    columnWidth = '50%';
                } else if ((col.css && col.css.indexOf('tableWidth40') > -1)) {
                    columnWidth = '20%';
                } else if ((col.css && col.css.indexOf('tableWidth30') > -1)) {
                    columnWidth = '15%';
                } else if ((col.css && col.css.indexOf('tableWidth15') > -1)) {
                    columnWidth = '';
                } else if ((col.css && col.css.indexOf('tableWidth') > -1)) {
                    columnWidth = '10%';
                } else {
                    columnWidth = '';
                }
            }

            return columnWidth;
        }
        
        function parseDate(str, format)
        {
            var date = moment(str, format, true);
            return date.isValid() ? date.toDate() : '';
        }
        
        function formatDate(date, format)
        {
            var date = moment(date);
            return date.isValid() ? date.format(format) : '';
		}
		
		function getScrapedHTML(scope, scraped)
		{
			var html = '';
			html += '<div>';
			if(scraped && scraped.html)
			{	
				//insert hardcoded html to have same display for no found SEC documents
				if(scope.mnemonicid === 'SEC_PARSE' && scraped.html === 'No data was found!')
				{
					html += '<table width="98%" align="center"> ' +
							'   <tr> ' +
							'       <td style="font-size:12px; font-family: monospace; color:#000000;">No SEC documents have been found</td> ' +
							'   </tr> ' +
							'</table>';
				}
				else 
				{
					html += scraped.html;
				}
			}
			else
			{
				html += '<ms-message message="Under Construction"></ms-message>';
			}						
			html += '<div>';

			return html;
		}

    }
})();