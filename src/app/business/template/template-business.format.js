(function() {
    'use strict';

    angular
        .module('app.template.business.format', [])
        .service('templateBusinessFormat', templateBusinessFormat);

    /* @ngInject */
    function templateBusinessFormat(toast, $filter, templateBusiness) {
        var business = {
            getFormatObject: getFormatObject,
            removeFixes: removeFixes,
            formatData: formatData,

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
            formatDate: formatDate,
            parseDate: parseDate

        }
    	return business;

    	function getFormatObject(tearsheet) {
    	    var formatObject = new Object();
    	    var value;
    	    formatObject.dataType = templateBusiness.getMnemonicDataType(tearsheet);
    	    formatObject.dataSubtype = templateBusiness.getMnemonicDataSubtype(tearsheet);
    	    formatObject.prefix = templateBusiness.getMnemonicPrefix(tearsheet);
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
        
    	function removeFixes(value, formatObj) {

    	    var formatted;

    	    formatted = preFormatData(value, formatObj);
    	    if (formatObj.postProcessingNeeded) {
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
    	                numericValue = Number(removeNonNumericCharacters(formatted));
    	                formatObj.postProcessingNeeded = true;
    	                formatObj.isNegative = isNegative;
    	                formatObj.numericValue = numericValue;
    	                break;
    	            case 'DATE':
    	                formatted = templateBusiness.formatDate(formatted, 'DD-MMM-YY');
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
    	    if (formatObj.postProcessingNeeded) {
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
    	                formatted = $filter('currency')(formatObj.numericValue, formatObj.prefix, formatObj.precision);
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

    	function removeNonNumericCharacters(value)
    	{
    		var inputVal = $.trim(value);

            /*
                TODO change to consider negative values for numeric
            */
			var regEx = /[^\d\,\.]/g; 

            //allow only numberic for number datatype
			if(regEx.test(inputVal)){
				toast.simpleToast('Your input is not a valid number.');
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
    	                prefix = '&yen;';
    	                break;
    	            case 'EUR':
    	                prefix = '&euro;';
    	                break;
    	            case 'GBP':
    	                prefix = '&pound;';
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
    	    if (tearSheet instanceof Object) {
                return '';
    	    } else {
    	        return tearSheet.answer;
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

    }
})();