/*
 * Pending items
 *  
 *  Mass attendance
 *  Testimonial
 *  Feedback
 *  
 *  Secondary
 *  Role based hiding of links
 *  Hide Ribbon in Calendar view based on roles
 *  hide control using css
 *  callback logging
 *  Column names in utility function
 *  
 *  Tertiary
 *  scripts for list schema
 */


_csrAppContext = {};
_csrAppContext.DebugMode = true;
_csrAppContext.SiteServerRelativeUrl = "/sites/CSR/";


function loadScript(url, callback) {
    var head = document.getElementsByTagName("head")[0],
        script = document.createElement("script"),
        done = false;

    script.src = url;

    // Attach event handlers for all browsers
    script.onload = script.onreadystatechange = function () {
        if (!done && (!this.readyState ||
            this.readyState === "loaded" || this.readyState === "complete")) {
            done = true;
            callback(this.src); // execute callback function

            // Prevent memory leaks in IE
            script.onload = script.onreadystatechange = null;
            head.removeChild(script);
        }
    };
    head.appendChild(script);
}

function loadCss(id, stylesheethref) {


    var cssId = id;  // you could encode the css path itself to generate id..
    if (!document.getElementById(cssId)) {
        var head = document.getElementsByTagName('head')[0];
        var link = document.createElement('link');
        link.id = cssId;
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = stylesheethref;
        link.media = 'all';
        head.appendChild(link);
    }

}



function blankCallback(src) {
    if (_csrAppContext.DebugMode) {
        console.log(src + " has been loaded..");
    }
}


/**
 * 
 * @param {any} caTitle  Title of the custom action
 * @param {any} caDescription Description for the Custom action
 * @param {any} caScriptSrc ~SiteCollection/SiteAssets/CustomTool.min.js
 * @param {any} caSequence Sequence No of the custom action
 *  @param {any} caLocation Location of custom action e.g. ScriptLink
 *  Usage : AddSiteUserCustomAction("csrMaster","This script will be called globally and is added in master page","~SiteCollection/SiteAssets/js/csrMaster.min.js",1001,"ScriptLink");
 */
function AddSiteUserCustomAction(caTitle, caDescription, caScriptSrc, caSequence, caLocation) {
    var clientContext = new SP.ClientContext();
    var site = clientContext.get_site();
    var UserCustomActions = site.get_userCustomActions();

    var newUserCustomAction = UserCustomActions.add();
    newUserCustomAction.set_title(caTitle);
    newUserCustomAction.set_description(caDescription);
    newUserCustomAction.set_scriptSrc(caScriptSrc);
    newUserCustomAction.set_sequence(caSequence);
    newUserCustomAction.set_location(caLocation);

    newUserCustomAction.update();

    clientContext.executeQueryAsync(function () { console.log("Custom Action added to site" + caScriptSrc); }, function (sender, args) { console.log('Request failed. \nError: ' + args.get_message() + '\nStackTrace: ' + args.get_stackTrace()); });
}


function onSPContextLoad() {

    console.log("SP Context Loaded. Starting to load other dependent files");

    loadScript(_csrAppContext.SiteServerRelativeUrl + "siteassets/js/jquery.min.js", onJqueryLoaded);




}


function onJqueryLoaded() {

    // setFooterBottom();
    loadScript(_csrAppContext.SiteServerRelativeUrl + "siteassets/js/csrUtility.js", oncsrUtilityJsLoaded);

    _csrAppContext.CurrentUserId = _spPageContextInfo.userLoginName.toLowerCase();
    _csrAppContext.userDisplayName = _spPageContextInfo.userDisplayName;

    //Keep this as the last statement of the file
    $(document).ready(onMasterPageLoad);

    //load bootstrap
    loadScript(_csrAppContext.SiteServerRelativeUrl + "SiteAssets/bootstrap-4.3.1-dist/bootstrap-4.3.1-dist/js/popper.min.js", blankCallback);
    loadScript(_csrAppContext.SiteServerRelativeUrl + "SiteAssets/bootstrap-4.3.1-dist/bootstrap-4.3.1-dist/js/bootstrap.min.js", blankCallback);


}



function oncsrUtilityJsLoaded() {
    CSRUtility.getCurrentUserInfo(function () {
        //handle all user related items here

        if (!_csrAppContext.IsCSRAdmin && !_csrAppContext.IsDev) {
            validateProgramListView();
        }

        if (_csrAppContext.IsCSRAdmin || _csrAppContext.IsDev) {
            $(".csr-admin-icon").removeClass("d-none").addClass("d-block");
        }

        populateProfileProperties();


    });
    loadScript(_csrAppContext.SiteServerRelativeUrl + "siteassets/js/csrProgram.min.js", oncsrProgramJsLoaded);
}


function oncsrProgramJsLoaded() {

    if (checkIsPage("RegisterWithdraw.aspx")) {
        CSRApp.renderRegisterWithdraw();
    }
    if (checkIsPage("HomePageDev.aspx") || checkIsPage("Home.aspx")) {
        CSRApp.renderHomeProgramDetails();
        CSRApp.renderHomePageSlider();
        CSRApp.renderReport();
        CSRApp.renderTestimonials(4, true);
    }
    if (checkIsPage("NGO.aspx")) {
        CSRApp.renderNGOList();
    }
    if (checkIsPage("MarkAttendance.aspx") || checkIsPage("Attendance.aspx")) {
        CSRApp.renderMarkAttendance();
    }

    if (checkIsPage("ViewProgram.aspx")) {
        CSRApp.renderViewProgram();
    }

    if (checkIsPage("MyPrograms.aspx")) {
        CSRApp.renderMyProgramDetails();
    }


    if (checkIsPage("/Lists/Feedback/Feedback.aspx")) {
        CSRApp.renderFeedbackPage();
    }


    if (checkIsPage("NGODetails.aspx")) {
        CSRApp.renderNGODetails();
    }

    if (checkIsPage("Gallery.aspx")) {
        CSRApp.renderGallery();//
    }

    if (checkIsPage("Testimonies.aspx")) {
        CSRApp.renderTestimonials(null, false);
    }




    if (checkIsPage("ProgramAction.aspx")) {


        loadCss("bootstrappickercss", _csrAppContext.SiteServerRelativeUrl + "SiteAssets/bootstrap-4.3.1-dist/bootstrap-datetimepicker-master/css/bootstrap-datetimepicker.min.css");

        loadScript(_csrAppContext.SiteServerRelativeUrl + "SiteAssets/bootstrap-4.3.1-dist/bootstrap-datetimepicker-master/js/bootstrap-datetimepicker.min.js", function () {
            CSRApp.renderProgramAction();



        });



        //loadScript(_csrAppContext.SiteServerRelativeUrl + "siteassets/js/moment.min.js", function () {
        //    loadScript(_csrAppContext.SiteServerRelativeUrl + "siteassets/bootstrap-4.3.1-dist/Date-Time-Picker-Bootstrap-4/src/js/bootstrap-datetimepicker.js", function () {
        //        CSRApp.renderProgramAction();

        //    });

        //});
    }

}


function onMasterPageLoad() {


}


function validateProgramListView() {


    //page not found
    if (checkIsPage("PageNotFoundError.aspx") && !_csrAppContext.IsCSRAdmin) {
        $("body").hide();
        window.location = _csrAppContext.SiteServerRelativeUrl + "?pagenotfound";
    }


    //layouts page
    //if (checkIsPage("/_layouts/") && (!_csrAppContext.IsCSRAdmin && !_csrAppContext.IsDev)) {
    //    $("body").hide();
    //    window.location = _csrAppContext.SiteServerRelativeUrl + "?layoutspage";
    //}



    //validate any list page
    if (checkIsPage("/Lists/") && !checkIsPage("/Lists/Feedback/Feedback.aspx")) {
        $("body").hide();
        alert("Access Denied!");
        window.location = _csrAppContext.SiteServerRelativeUrl;
    }

    if (checkIsPage("Lists/Programs/")) {

        // hide ribbon in calendar view
        ExecuteOrDelayUntilScriptLoaded(function () {

            //Disable calendar events
            $('.ms-acal-rootdiv td').on("mousedown mouseup dblclick mousemove", false);
            $("body").on("mousedown mouseup dblclick mousemove", ".ms-acal-rootdiv td", false);

        }, 'SP.UI.ApplicationPages.Calendar.js');

        $("#s4-ribbonrow").hide();
    }

}


function populateProfileProperties() {

    $(".csr-account-name").html(CSRUtility.substring(_csrAppContext.currentUser.PrefferedName, 0, 15));
    $(".csr-account-name").attr("title", _csrAppContext.currentUser.PrefferedName);
    $(".csr-account-description").html(_csrAppContext.currentUser.JobTitle);
    $(".csr-user img").attr("src", _csrAppContext.currentUser.PictureURL);

}



function loadConditionalCss() {

    loadCss("csrStyle", _csrAppContext.SiteServerRelativeUrl + "siteassets/css/csrstyle.css");
}


function checkIsPage(pagePart) {

    if (window.location.href.toLowerCase().indexOf(pagePart.toLowerCase()) > -1) {
        return true;
    }
    else {
        return false;
    }
}

//Page Load
loadConditionalCss();
ExecuteOrDelayUntilBodyLoaded(function () {
    EnsureScriptFunc("SP.js", "SP.ClientContext", onSPContextLoad);
});



