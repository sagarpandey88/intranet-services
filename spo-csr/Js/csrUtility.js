
//can contain testimonial , feedback code
//

(function (CSRUtility) {

    /*
     * _csrAppContext.UserId
     * _csrAppContext.EmailId
     * _csrAppContext.UserGroups
     * _csrAppContext.IsDev
     * _csrAppContext.IsCSRAdmin
     * _csrAppContext.DebugMode
     * _csrAppContext.CurrentUserId
     *    
     */

    CSRUtility.camlQueryAll = "All";
    CSRUtility.SiteServerRelativeUrl = "/sites/CSR/";
    CSRUtility.DefaultProgramImageUrl = CSRUtility.SiteServerRelativeUrl + "/SiteAssets/images/no-image-available.jpg";
    CSRUtility.DisplayTypeBox = "Box";
    CSRUtility.DisplayTypeList = "List";

    /* List Names */
    CSRUtility.CSRAdminGroupName = "CSR Admin";
    CSRUtility.DeveloperGroupName = "CSR Developers";
    CSRUtility.HomePageSliderLibraryName = "HomePageImageSlider";
    CSRUtility.TestimonialsListName = "Testimonials";
    CSRUtility.MailTrackerListName = "MailTracker";
    CSRUtility.programsListName = "Programs";
    CSRUtility.volunteersListName = "Volunteers";
    CSRUtility.ngoListName = "NGO";
    CSRUtility.feedbackListName = "Feedback";
    CSRUtility.testimonialListName = "Testimonials";
    CSRUtility.configurationListName = "Configuration";
    CSRUtility.reportsListName = "CSR Reports";
    CSRUtility.aboutUsListName = "About Us";

    CSRUtility.GalleryName = "CSR Gallery";
    CSRUtility.ProgramIdQueryString = "progId";
    CSRUtility.DateFormat = "dd-MMM-yyyy hh:mm tt";
    CSRUtility.TimeFormat = "hh:mm tt";
    CSRUtility.SPDateFormat = "yyyy-MM-ddTHH:mm:ssZ";

    /* Page Urls*/
    CSRUtility.RegisterWithdrawServerRelativeUrl = CSRUtility.SiteServerRelativeUrl + "Pages/ProgramAction.aspx";
    CSRUtility.ViewProgramDetailsServerRelativeUrl = CSRUtility.SiteServerRelativeUrl + "Pages/ViewProgram.aspx";
    CSRUtility.ProgramActionServerRelativeUrl = CSRUtility.SiteServerRelativeUrl + "Pages/ProgramAction.aspx";
    CSRUtility.FeedbackPageServerRelativeUrl = CSRUtility.SiteServerRelativeUrl + "Lists/Feedback/Feedback.aspx";
    CSRUtility.ProgramEditPageServerRelativeUrl = CSRUtility.SiteServerRelativeUrl + "Lists/Programs/EditForm.aspx";
    CSRUtility.NGODetailsServerRelativeUrl = CSRUtility.SiteServerRelativeUrl + "Pages/NGODetails.aspx";
    CSRUtility.AddTestimonyServerRelativeUrl = CSRUtility.SiteServerRelativeUrl + "Pages/AddTestimony.aspx";
    CSRUtility.MarkAttendanceServerRelativeUrl = CSRUtility.SiteServerRelativeUrl + "Pages/Attendance.aspx";



    /* Include Fields*/
    CSRUtility.IncludeFieldsProgram = "ID,Title,ProgramDescription,EventDate,EndDate,Venue,Program_x0020_Manager,NGO,Need_x0020_Volunteers,VolunteerDetails,Volunteers,VolunteersAttended,ProgramLocation,Email_x0020_Para,Attachments,AttachmentFiles";
    CSRUtility.IncludeFieldsNGO = "ID,Title,Description,Attachments,AttachmentFiles";
    CSRUtility.IncludeFieldsHomePageSlider = "ID,Title,EncodedAbsUrl";
    CSRUtility.IncludeFieldsTestimonial = "ID,Title,Testimonial,IsPublished,ShowOnHomePage,Author";
    CSRUtility.IncludeFieldsReport = "ID,Title,EncodedAbsUrl,Description0";
    CSRUtility.IncludeFieldsFeedback = "ID,Title";


    /* Action Type*/
    CSRUtility.RegisterType = "Register";
    CSRUtility.WithdrawType = "Withdraw";
    CSRUtility.FeedbackType = "Feedback";



    CSRUtility.getItemById = function (clientContext, listName, itemId, includefields, successCallback) {

        var targetList = clientContext.get_web().get_lists().getByTitle(listName);
        var targetListItem = targetList.getItemById(itemId);
        if (includefields)
            clientContext.load(targetListItem, includefields.split(","));
        else
            clientContext.load(targetListItem);
        clientContext.executeQueryAsync(function () {
            successCallback(targetListItem);
        },
            function (sender, args) { CSRUtility.errorCallback(sender, args, "Error occurred for getItemById " + listName); });
    }


    CSRUtility.getAllItems = function (clientContext, listName, camlQuery, includefields, successCallback) {


        var targetList = clientContext.get_web().get_lists().getByTitle(listName);
        var camlQueryObject = new SP.CamlQuery();
        camlQueryObject = SP.CamlQuery.createAllItemsQuery();
        if (camlQuery !== CSRUtility.camlQueryAll) {
            camlQueryObject.set_viewXml(camlQuery);//set caml query if
        }
        var collListItem = targetList.getItems(camlQueryObject);

        //Include(Id, DisplayName, HasUniqueRoleAssignments) 
        if (includefields)
            clientContext.load(collListItem, "Include(" + includefields + ")");
        else
            clientContext.load(collListItem);
        clientContext.executeQueryAsync(function () {
            successCallback(collListItem);
        },
            function (sender, args) { CSRUtility.errorCallback(sender, args, "Error occurred for  getAllItems" + listName); });
    };


    CSRUtility.getItemByIdCurrentContext = function (listName, itemId, includefields, successCallback) {
        var clientContext = SP.ClientContext.get_current();
        CSRUtility.getItemById(clientContext, listName, itemId, includefields, successCallback);
    }

    CSRUtility.getAllItemsCurrentContext = function (listName, camlQuery, includefields, successCallback) {

        var clientContext = SP.ClientContext.get_current();
        CSRUtility.getAllItems(clientContext, listName, camlQuery, includefields, successCallback);
    }


    CSRUtility.getCurrentClientContext = function () {

        return SP.ClientContext.get_current();
    }

    CSRUtility.errorCallback = function (sender, args, msg) {

        console.log('Request failed. \nError: ' + args.get_message() + '\nStackTrace: ' + args.get_stackTrace() + '\n' + msg);
    }

    /**
     * Gets the query string
     * @param {any} name query string key
     * @return {any} results 
     */
    CSRUtility.getQueryString = function (name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(document.location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };


    CSRUtility.log = function (message) {

        console.log(message);
    }

    CSRUtility.replaceAllOccurances = function (targetString, searchValue, replacer) {

        return targetString.replace(new RegExp(searchValue, 'g'), replacer);
    }


    CSRUtility.getUserFieldDetails = function (listitem, fieldName) {

        var userDetailList = [];
        var multiUserField = listitem.get_item(fieldName);
        $(multiUserField).each(function () {

            var userDetail = {};
            userDetail.userName = this.get_lookupValue();
            userDetail.email = this.get_email();
            userDetail.Id = this.get_lookupId();
            userDetail.typeId = this.get_typeId();
            userDetailList.push(userDetail);
        });

        return userDetailList;

    }


    CSRUtility.getMultiLookupValue = function (listitem, fieldName) {

        var multilookupValues = [];
        var multiLookupField = listitem.get_item(fieldName);
        $(multiLookupField).each(function () {

            var lookupfieldValue = {};
            lookupfieldValue.lookupValue = this.get_lookupValue();
            lookupfieldValue.Id = this.get_lookupId();
            lookupfieldValue.typeId = this.get_typeId();
            multilookupValues.push(lookupfieldValue);
        });

        return multilookupValues;

    }

    CSRUtility.getLookupValue = function (listitem, fieldName) {

        var lookupItemValue = listitem.get_item(fieldName);

        var lookupfieldValue = {};
        lookupfieldValue.lookupValue = CSRUtility.isNullOrUndefined(lookupItemValue) ? "" : lookupItemValue.get_lookupValue();
        lookupfieldValue.Id = CSRUtility.isNullOrUndefined(lookupItemValue) ? 0 : lookupItemValue.get_lookupId();
        lookupfieldValue.typeId = CSRUtility.isNullOrUndefined(lookupItemValue) ? 0 : lookupItemValue.get_typeId();

        return lookupfieldValue;

    }

    CSRUtility.getAttachmentUrl = function (listItem) {

        var attachmentUrl = "";
        if (listItem.get_attachmentFiles().get_count() > 0) {
            var attachmentEnumerator = listItem.get_attachmentFiles().getEnumerator();
            attachmentEnumerator.moveNext();
            attachmentUrl = attachmentEnumerator.get_current().get_serverRelativeUrl();
        }

        return attachmentUrl;
    }

    CSRUtility.getConfigurationValue = function (key, successCallback) {

        var camlQuery = "<View><Query>" +
            "<Where>" +
            "<Eq><FieldRef Name=\"Title\"/><Value Type=\"Text\">" + key + "</Value></Eq>" +
            "</Where>" +
            "</Query></View>";
        CSRUtility.getAllItemsCurrentContext(CSRUtility.configurationListName, camlQuery, null, function (collListItem) {

            var configurationValue = {};
            var listItemEnumerator = collListItem.getEnumerator();

            while (listItemEnumerator.moveNext()) {

                var oListItem = listItemEnumerator.get_current();

                configurationValue.key = oListItem.get_item("Title");
                configurationValue.value = oListItem.get_item("Value");
                configurationValue.description = oListItem.get_item("Description");
            }

            successCallback(configurationValue);

        });
    };

    //check the permission of user method
    CSRUtility.checkCurrentUserInGroup = function (groupNames, successCallback) {

        CSRUtility.getCurrentUserGroups(function (usergroupNames) {
            var membershipDetails = [];
            $(usergroupNames).each(function () {
                if (groupNames.indexOf(this) > -1) {
                    isMember = true;
                    membershipDetails.push(this);
                    //break;
                }
            });

            successCallback(membershipDetails);

        });

    };


    CSRUtility.getCurrentUserGroups = function (successCallback) {

        var clientContext = new SP.ClientContext.get_current();
        var currentUser = clientContext.get_web().get_currentUser();
        clientContext.load(currentUser);
        var userGroups = currentUser.get_groups();
        clientContext.load(userGroups);
        clientContext.executeQueryAsync(function () {
            var groupNames = [];

            var membershipDetails = [];
            var isMember = false;
            var groupsEnumerator = userGroups.getEnumerator();
            while (groupsEnumerator.moveNext()) {
                var group = groupsEnumerator.get_current();
                groupNames.push(group.get_title());
            }

            successCallback(groupNames);

        }, CSRUtility.errorCallback);
    };


    CSRUtility.getDaysToGo = function (dateValue) {
        var actualDate = new Date(dateValue);
        var one_day = 1000 * 60 * 60 * 24;
        var daysToGo = Math.ceil((actualDate.getTime() - (new Date()).getTime()) / (one_day));
        var daysToGoString = "";

        if (daysToGo > 0) {
            daysToGoString = daysToGo + " Day(s) to go";
        }
        else {
            daysToGoString = -daysToGo + " Day(s) ago";
        }
        return daysToGoString;
    }

    CSRUtility.hasDatePassed = function (dateValue) {
        var actualDate = new Date(dateValue);
        var one_day = 1000 * 60 * 60 * 24;
        var daysToGo = Math.ceil((actualDate.getTime() - (new Date()).getTime()) / (one_day));

        if (daysToGo > 0) {
            return false;
        }
        else {
            return true;
        }

    };


    CSRUtility.showSPModal = function (modalTitle, serverRelativePageUrl, heightprop, widthprop, closeCallback) {

        //Set options for Modal PopUp  
        var options = {
            url: serverRelativePageUrl,//'/sites/HOL/Pages/Custom-Publishing-Page.aspx?IsDlg=1', //Set the url of the page  
            title: modalTitle, //Set the title for the pop up  
            allowMaximize: false,
            showClose: true,
            width: widthprop,
            height: heightprop
        };

        if (typeof (closeCallback) != typeof (undefined)) {
            options.dialogReturnValueCallback = Function.createDelegate(null, closeCallback);
        }
        //Invoke the modal dialog by passing in the options array variable  
        SP.SOD.execute('sp.ui.dialog.js', 'SP.UI.ModalDialog.showModalDialog', options);
        return false;

    };


    CSRUtility.containsIteminArray = function (list, propertyName, value) {
        var i;
        for (i = 0; i < list.length; i++) {
            if (list[i][propertyName] === value) {
                return true;
            }
        }

        return false;

    }

    CSRUtility.getIteminArray = function (list, propertyName, value) {
        var i;
        for (i = 0; i < list.length; i++) {
            if (list[i][propertyName] === value) {
                return list[i];
            }
        }

        return null;

    }

    CSRUtility.getCurrentUserInfo = function (successCallback) {
        CSRUtility.getCurrentUserGroups(function (groupNames) {

            _csrAppContext.IsCSRAdmin = false;
            _csrAppContext.IsDev = false;
            $(groupNames).each(function () {

                if (this == CSRUtility.CSRAdminGroupName) {

                    _csrAppContext.IsCSRAdmin = true;
                }

                if (this == CSRUtility.DeveloperGroupName) {
                    _csrAppContext.IsDev = true;
                }

            });


            CSRUtility.getCurrentUserProfileProperties(function (userProperties) {

                _csrAppContext.currentUser = {};

                for (var i = 0; i < userProperties.length; i++) {

                    var property = userProperties[i];

                    if (property.Key == "PreferredName") {
                        _csrAppContext.currentUser.PrefferedName = property.Value;
                    }

                    if (property.Key == "SPS-JobTitle") {
                        _csrAppContext.currentUser.JobTitle = property.Value;
                    }
                    if (property.Key == "PictureURL") {
                        //    _csrAppContext.currentUser.PictureURL = property.Value;
                    }
                    if (property.Key == "WorkEmail") {
                        _csrAppContext.currentUser.EmailId = property.Value;
                        _csrAppContext.currentUser.PictureURL = "/_layouts/15/userphoto.aspx?size=L&username=" + _csrAppContext.currentUser.EmailId;
                    }

                    if (property.Key == "Manager") {
                        _csrAppContext.currentUser.Manager = property.Value.replace("i:0#.f|membership|", "");
                    }

                }


                successCallback();
            });

        });


    }

    CSRUtility.getCurrentUserProfileProperties = function (successCallback) {

        var t = _spPageContextInfo.webAbsoluteUrl + "/_api/SP.UserProfiles.PeopleManager/GetMyProperties",
            i = window.location.protocol + "//" + window.location.host + _spPageContextInfo.siteServerRelativeUrl;
        jQuery.ajax({
            url: t,
            method: "GET",
            contentType: "application/json;odata=verbose",
            headers: {
                Accept: "application/json;odata=verbose"
            },
            success: function (t) {
                var i = t.d.UserProfileProperties.results;
                successCallback(i);

            },
            failure: function (t) {
                console.log("Error Occured to get properties" + t);

            }
        })

    };

    CSRUtility.mapUserProfileProperties = function (userProperties) {

        var userDetails = {};
        for (var i = 0; i < userProperties.length; i++) {

            var property = userProperties[i];

            if (property.Key == "PreferredName") {
                userDetails.PrefferedName = property.Value;
            }

            if (property.Key == "SPS-JobTitle") {
                userDetails.JobTitle = property.Value;
            }
            if (property.Key == "PictureURL") {
                userDetails.PictureURL = property.Value;
            }
            if (property.Key == "WorkEmail") {
                userDetails.EmailId = property.Value;
            }

            if (property.Key == "UserName") {
                userDetails.UserId = property.Value.toLowerCase();
            }

            if (property.Key == "Manager") {
                userDetails.Manager = property.Value.toLowerCase();
            }


        }
        return userDetails;

    }
    CSRUtility.getCurrentUserProfilePropertiesFor = function (userId, successCallback) {

        var accountName = "%27i:0%23.f|membership|" + userId + "@ORGANIZATION.com%27";
        var t = _spPageContextInfo.webAbsoluteUrl + "/_api/SP.UserProfiles.PeopleManager/GetPropertiesFor(accountName=@v)?@v=" + accountName,
            i = window.location.protocol + "//" + window.location.host + _spPageContextInfo.siteServerRelativeUrl;
        jQuery.ajax({
            url: t,
            method: "GET",
            contentType: "application/json;odata=verbose",
            headers: {
                Accept: "application/json;odata=verbose"
            },
            success: function (t) {
                var i = t.d.UserProfileProperties.results;
                successCallback(i);

            },
            failure: function (t) {
                console.log("Error Occured to get properties" + t);

            }
        })

    };


    CSRUtility.substring = function (value, startIndex, endIndex) {
        if (value == null) { return ""; }
        var truncatedString = value;
        if (value.length >= endIndex) {
            truncatedString = value.substring(startIndex, endIndex) + "...";
        }

        return truncatedString;
    };


    CSRUtility.trimLeft = function (value, charlist) {
        if (value == undefined) {
            return "";
        }
        if (charlist === undefined)
            charlist = "\s";

        return value.replace(new RegExp("^[" + charlist + "]+"), "");
    };


    CSRUtility.trimRight = function (value, charlist) {
        if (value == undefined) {
            return "";
        }
        if (charlist === undefined)
            charlist = "\s";

        return value.replace(new RegExp("[" + charlist + "]+$"), "");
    };

    CSRUtility.trim = function (value, charlist) {
        if (value == undefined) {
            return "";
        }
        return CSRUtility.trimRight(CSRUtility.trimLeft(value, charlist), charlist);
    };


    CSRUtility.sortArray = function (array, prop, asc) {

        array = array.sort(function (a, b) {
            if (asc) {
                return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
            } else {
                return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
            }
        });

        return array;

    }

    CSRUtility.compareDates = function (date1, date2) {

        if (date1.getDate() == date2.getDate() &&
            date1.getMonth() == date2.getMonth() &&
            date1.getFullYear() == date2.getFullYear()) {

            return 1;
        }

        return 0;

    }


    CSRUtility.isNullOrUndefined = function (obj) { return obj == null || obj == undefined }


})(window.CSRUtility = window.CSRUtility || {});