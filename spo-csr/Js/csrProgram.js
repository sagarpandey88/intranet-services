/// <reference path="csrUtility.js" />

//This will contain view and edit program page scripts
/*
 * View
 * Edit
 * Register
 * Withdraw
 * View All programs
 * Feedback
 * Testimonial
 */

(function (CSRApp) {

    /******************Web UI*********************/

    CSRApp.renderHomeProgramDetails = function () {

        CSRApp.getAllActiveProgramDetails(function (programDetailsList) {

            var htmlMarkup = CSRApp.getProgramListMarkup(programDetailsList, CSRUtility.DisplayTypeBox);

            $("#csr-active-programs").html(htmlMarkup);

        });
    }

    CSRApp.getProgramListMarkup = function (programDetailsList, listType) {

        var allProgramsHtml = "";//"<div class='row'>";

        var programDetailsMarkup = "";

        var boxTypeMarkup = '   <div class="col-md-4 col-12">  ' +
            '     ' +
            '             <div class="csr-program mb-4 shadow-sm">  ' +
            '     ' +
            '                <img src="[IMGURL]" style="width:100%;height:200px" />  ' +//IMG
            '     ' +
            '               <div class="csr-program-body p-3">  ' +
            '     ' +
            '                <p class="csr-program-title">[PROGRAMTITLE]</p>  ' + //TITLE
            '     ' +
            '                 <p class="csr-program-desc"> [PROGRAMDESCRIPTION]</p>  ' + //DESC
            '                 <p class="csr-program-location"> Location: [PROGRAMLOCATION]</p>  ' + //DESC
            '     ' +
            '                 <div class="d-flex justify-content-between align-items-center">  ' +
            '     ' +
            '                  <div class="btn-group csr-buttons">  ' +
            '     ' +
            '                     <button type="button" class="btn btn-sm btn-outline-secondary" onclick="CSRApp.openViewProgramDetails({{PROGRAMID}})" >View</button>  ' + //JS Onclick
            '     ' +
            '                     <button type="button" class="btn btn-sm btn-outline-secondary" onclick="CSRApp.openRegisterWithdrawPage({{PROGRAMID}})">Register</button>  ' + //On clcik
            '     ' +
            '                   </div>  ' +
            '     ' +
            '                   <small class="text-muted csr-days">[DAYSTOGO]</small>  ' + // DaystoGO
            '     ' +
            '                 </div>  ' +
            '                 </div>  ' +
            '                 </div>  ' +
            '                 </div>  ' +

            '     ';

        var listTypeMarkup = "<tr>" +
            "<td>[PROGRAMTITLE]</td>" +
            "<td>[PROGRAMDESCRIPTION]</td>" +
            "<td>[DAYSTOGO]</td>" +
            "<td> <a href='CSRApp.openViewProgramDetails({{PROGRAMID}})'> View </a> </td>" +
            "<td> <a href='CSRApp.openRegisterWithdrawPage({{PROGRAMID}})'> Register </a> </td>"
            ;

        if (listType == "Box") {
            programDetailsMarkup = boxTypeMarkup;
        }
        else {
            programDetailsMarkup = listTypeMarkup;
        }


        $(programDetailsList).each(function () {

            var programDetail = this;
            var programMarkup = programDetailsMarkup;

            programMarkup = programMarkup.replace("[IMGURL]", programDetail.ImageUrl);
            programMarkup = programMarkup.replace("[PROGRAMTITLE]", CSRUtility.substring(programDetail.Title, 0, 35));
            programMarkup = programMarkup.replace("[PROGRAMLOCATION]", CSRUtility.substring(programDetail.Location, 0, 35));
            programMarkup = programMarkup.replace("[PROGRAMDESCRIPTION]", CSRUtility.substring(programDetail.Description, 0, 75));
            programMarkup = CSRUtility.replaceAllOccurances(programMarkup, "{{PROGRAMID}}", programDetail.Id);
            programMarkup = programMarkup.replace("[DAYSTOGO]", programDetail.DaysToGo);

            allProgramsHtml += programMarkup;

        });

        return allProgramsHtml;


    }

    CSRApp.renderMyProgramDetails = function () {

        CSRApp.getCurrentUserAllProgramDetails(function (programDetailsList) {

            CSRApp.MyProgramList = programDetailsList;// saving it in cache for paging and other quick client side operation        

            var pastMarkup = "";
            var activeMarkup = "";
            $(programDetailsList).each(function () {

                var program = this;
                var itemUrl = CSRUtility.ViewProgramDetailsServerRelativeUrl + "?progId=" + this.Id;
                var itemMarkup = "<li class='list-group-item'><a href=" + itemUrl + ">" + program.Title + "</a></li>"

                if (program.HasEnded) {
                    pastMarkup += itemMarkup;
                }
                else {
                    activeMarkup += itemMarkup;

                }

            });


            $("#csr-myactive-program ul").html(activeMarkup);
            $("#csr-mypast-program ul").html(pastMarkup);


            $(".dvMyPrograms").html(htmlMarkup);

        });
    }

    CSRApp.renderViewProgram = function () {

        var progId = parseInt(CSRUtility.getQueryString("progId"));
        CSRApp.getProgramDetails(progId, function (programDetails) {

            CSRApp.currentProgramDetails = programDetails;
            $("#csr-program-title").html(programDetails.Title);
            $("#csr-program-desc").html(programDetails.Description);
            $("#csr-program-venue").append(programDetails.Venue);
            $("#csr-program-location").append(programDetails.Location);
            $("#csr-program-start-date").append(programDetails.EventStartDate.format(CSRUtility.DateFormat));
            $("#csr-program-end-date").append(programDetails.EventEndDate.format(CSRUtility.DateFormat));
            $("#csr-program-manager").append(programDetails.ProgramManager[0].userName + " (" + programDetails.ProgramManager[0].email + ")");

            $("#csr-program-ngo").append("<a href=javascript:CSRApp.showNGOModal(" + programDetails.NGO.Id + ") >" + programDetails.NGO.lookupValue + " <i class='fa fa-eye' aria-hidden=true></i> </a> ");
            $("#csr-program-image").attr("src", programDetails.ImageUrl);


            //post rendering fixes
            if (programDetails.NGO.Id == 0) {
                $("#csr-program-ngo").hide();
            }

            if (CSRUtility.compareDates(programDetails.EventStartDate, programDetails.EventEndDate) == 1) {

                $("#csr-program-start-date").html("<strong>Date :</strong>" + programDetails.EventEndDate.format(CSRUtility.DateFormat)
                    + " - " + programDetails.EventEndDate.format(CSRUtility.TimeFormat))
                $("#csr-program-end-date").hide();

            }

            var hasAttended = false;
            var hasRegistered = false;

            if (programDetails.Volunteers && programDetails.Volunteers.indexOf(_csrAppContext.CurrentUserId) > -1) {

                hasRegistered = true;
            }

            if (programDetails.VolunteersAttended && programDetails.VolunteersAttended.indexOf(_csrAppContext.CurrentUserId) > -1) {
                hasAttended = true;
            }



            var actionTitle = "";
            if (hasRegistered && !hasAttended) {
                actionTitle = "Withdraw";
                programDetails.IsRegistered = true;

                $("#csr-program-action").on("click", function () {
                    if (window.confirm("Are you sure you want to withdraw?")) {

                        CSRApp.withdrawVolunteer(function (status) { if (status) { alert("Withdrawn from the event"); window.location.href = CSRUtility.SiteServerRelativeUrl; } });
                    }
                    return false;
                });

            }
            else if (!hasRegistered && !hasAttended) {

                if (!programDetails.HasEnded) {
                    actionTitle = "Register";
                    programDetails.IsRegistered = false;
                    $("#csr-program-action").on("click", function () {
                        CSRUtility.showSPModal("", CSRUtility.ProgramActionServerRelativeUrl + "?progId=" + progId + "&IsDlg=1", 500, 450);
                        return false;
                    });
                }
            }


            if (hasAttended) {
                actionTitle = "Feedback";
                programDetails.hasAttended = true;
                $("#csr-program-action").on("click", function () {
                    var feedbackUrl = CSRUtility.FeedbackPageServerRelativeUrl + "?progId=" + progId + "&IsDlg=1&Source=" + CSRUtility.SiteServerRelativeUrl;
                    // window.location.href = feedbackUrl;
                    CSRUtility.showSPModal("Feedback", feedbackUrl, 600, 650, function () { window.location = window.location; });
                    return false;
                });

                CSRApp.checkIfFeedbackSubmitted(function (isSubmitted) {
                    if (isSubmitted) {
                        $("#csr-program-action").hide();
                    }
                });

            }
            else {

                programDetails.hasAttended = false;
            }

            if (programDetails.HasEnded) {
                if ($("#csr-program-action").html() == "") { $("#csr-program-action").hide() }

            }

            $("#csr-program-action").html(actionTitle);

            if (_csrAppContext.IsCSRAdmin) {

                $("#csr-program-attendance").removeClass("d-none").addClass("d-block");
                $("#csr-program-edit").removeClass("d-none").addClass("d-block");
                $("#csr-program-attendance").on("click", function () {

                    window.location = CSRUtility.MarkAttendanceServerRelativeUrl + "?progId=" + progId + "&IsDlg=1";

                });

                $("#csr-program-edit").on("click", function () {
                    var sourceUrl = window.location.href;

                    window.location = CSRUtility.ProgramEditPageServerRelativeUrl + "?ID=" + progId + "&Source=" + encodeURIComponent(sourceUrl);

                });


            }
        });

    }

    CSRApp.renderProgramAction = function () {

        var progId = parseInt(CSRUtility.getQueryString(CSRUtility.ProgramIdQueryString));
        CSRApp.getProgramDetails(progId, function (programDetails) {

            CSRApp.currentProgramDetails = programDetails;
            $("#csr-program-title").html(programDetails.Title);
            //     $("#csr-program-start-date").append(programDetails.EventStartDate);
            //   $("#csr-program-end-date").append(programDetails.EventEndDate);

            $(document).ready(function () {

                $("#csr-program-start-date").val(programDetails.EventStartDate.format("dd-MMM-yyyy hh:mm"));
                $("#csr-program-end-date").val(programDetails.EventEndDate.format("dd-MMM-yyyy hh:mm"));
                $("#csr-program-start-date").datetimepicker({
                    showClose: true,
                    format: "dd-M-yyyy HH:ii",
                    autoclose: true,
                    pickerPosition: "bottom",
                    initialDate: programDetails.EventStartDate
                });

                $("#csr-program-end-date").datetimepicker({
                    showClose: true,
                    format: "dd-M-yyyy HH:ii",
                    autoclose: true,
                    pickerPosition: "bottom",
                    initialDate: programDetails.EventEndDate
                });
            });

            var actionButtonId = "#csr-program-register";

            if (programDetails.Volunteers && programDetails.Volunteers.indexOf(_csrAppContext.CurrentUserId) > -1) {
                programDetails.IsRegistered = true;
                $(".csr-buttons").prepend("<span style=color:red>You have already registered for this event.</span><br/>")
                $(actionButtonId).html("Withdraw");
                $(actionButtonId).on("click", function () {
                    if (window.confirm("Are you sure you want to withdraw?")) {

                        CSRApp.withdrawVolunteer(function (status) { if (status) { alert("Withdrawn from the event"); window.parent.location.href = CSRUtility.SiteServerRelativeUrl; } });
                    }
                    return false;
                });

            }
            else {
                programDetails.IsRegistered = false;
                $(actionButtonId).on("click", function () {

                    if (window.confirm("Are you sure you want to register?")) {
                        CSRApp.registerVolunteer(function (status) { if (status) { alert("Your Registration has been received.You will receive an email shortly."); window.parent.location.href = CSRUtility.SiteServerRelativeUrl; } });
                    }
                });
            }


            if (programDetails.VolunteersAttended && programDetails.VolunteersAttended.indexOf(_csrAppContext.CurrentUserId) > -1) {
                programDetails.VolunteersAttended.hasAttended = true;
                $(actionButtonId).hide();
                $(actionButtonId).parent().html("<span class='text-sucess'>You have already attended this program</span>");
            }


            if (programDetails.HasEnded) {

                $(actionButtonId).hide();
            }



        });



    };

    //Not in use
    CSRApp.renderRegisterWithdraw = function () {

        var progId = parseInt(CSRUtility.getQueryString("progId"));
        CSRApp.getProgramDetails(progId, function (programDetails) {
            CSRApp.currentProgramDetails = programDetails; // storing the value in memory for future access
            $(".btnRegister").hide();
            $(".btnWithdraw").hide();

            if (programDetails.Volunteers && programDetails.Volunteers.indexOf(_csrAppContext.CurrentUserId) > -1) {
                $(".btnWithdraw").show();
                programDetails.IsRegistered = true;
            }
            else {
                $(".btnRegister").show();
                programDetails.IsRegistered = false;
            }

            if (programDetails.VolunteersAttended && programDetails.VolunteersAttended.indexOf(_csrAppContext.CurrentUserId) > -1) {
                $(".btnRegister").hide();
                $(".btnWithdraw").hide();
                programDetails.hasAttended = true;
            }
            else {
                programDetails.hasAttended = false;
            }

            if (programDetails.HasEnded) {
                $(".btnRegister").hide();
                $(".btnWithdraw").hide();
                //Show feedback and testimonial button
            }



            $("#dvProgramTitle").html(programDetails.Title);
            $("#dvProgramManager").html(programDetails.ProgramManager.userName);
            $("#dvStartDate").html(programDetails.EventStartDate);
            $("#dvEndDate").html(programDetails.EventEndDate);




        });

    }

    //not in use
    CSRApp.renderProgramAttendanceScreen = function () {

        var progId = parseInt(CSRUtility.getQueryString("progId"));
        CSRApp.getProgramDetails(progId, function (programDetails) {
            CSRApp.currentProgramDetails = programDetails; // storing the value in memory for future access
            $("#dvProgramTitle").html(programDetails.Title);



            //generate the table based on volunteer details


        });
    };

    CSRApp.renderTestimonials = function (noOfItems, isHomePage) {

        //get the program names and add in drop down list

        $("#csr-create-testimony").on("click", function () {

            CSRUtility.showSPModal("Testimony", CSRUtility.AddTestimonyServerRelativeUrl, 300, 450);
        });

        var finalMarkup = "";
        CSRApp.getAllTestimonials(function (testimonialList) {

            testimonialList = CSRUtility.sortArray(testimonialList, "Id", false);

            if (isHomePage) {
                var counter = 0;
                $(testimonialList).each(function () {
                    var testimonial = this;
                    if (counter == noOfItems) { return false; }
                    if (testimonial.ShowOnHomePage && testimonial.Approved) {
                        var testimonialMarkup = "<div class='col-12 col-lg-3' ><blockquote>" + CSRUtility.substring(testimonial.Testimonial, 0, 200) + "</blockquote><cite>-" + testimonial.Author[0].userName + "</cite></div>";
                        finalMarkup += testimonialMarkup;
                        counter++;
                    }

                });

            }
            else {

                $(testimonialList).each(function () {
                    var testimonial = this;
                    if (testimonial.Approved) {
                        var testimonialMarkup = "<div class='col-12 col-lg-12' ><blockquote>" + testimonial.Testimonial + "</blockquote><cite> -" + testimonial.Author[0].userName + "</cite></div>";
                        finalMarkup += testimonialMarkup;
                    }
                });

            }

            $("div.csr-testimonies").html(finalMarkup);

        });


    };

    CSRApp.renderFeedbackPage = function () {

        $(document).ready(function () {
            var progId = parseInt(CSRUtility.getQueryString("progId"));
            $('[title=Program]').val(progId);
            $("[title=Program]").hide().parent().prepend($("[title=Program] option:selected")[0].innerText);
        });
    };

    CSRApp.renderNGOList = function () {

        var ngoMarkup = '<div class="csr-ngoimg" onclick="CSRApp.showNGOModal([ITEMINDEX])" >' +
            '<span class="spn_img" > <img src="[IMAGEURL]" alt="logo"></span>' +
            '</div>';

        var allMarkup = "";
        CSRApp.ngoList = [];
        CSRApp.getAllNGODetails(function (ngoList) {
            CSRApp.ngoList = ngoList; // storing in memory
            $(ngoList).each(function (index) {
                var ngoMarkupBuild = ngoMarkup;
                ngoMarkupBuild = ngoMarkupBuild.replace("[IMAGEURL]", this.ImageUrl);
                ngoMarkupBuild = ngoMarkupBuild.replace("[ITEMINDEX]", this.Id);
                allMarkup += ngoMarkupBuild;
            });

            $(".csr-ngolist").html(allMarkup);

        });


    }


    CSRApp.renderNGODetails = function () {

        var ngoId = CSRUtility.getQueryString("ngoId");

        CSRApp.getNGODetailsById(ngoId, function (ngoDetails) {

            CSRApp.currentNgoDetails = ngoDetails;
            $(".csr-ngo-title").html(ngoDetails.Title);
            $(".csr-ngo-desc").html(ngoDetails.Description);
            $(".csr-ngoimg img").attr("src", ngoDetails.ImageUrl);

        });

    }

    CSRApp.showNGOModal = function (ngoId) {

        var ngoUrl = CSRUtility.NGODetailsServerRelativeUrl + "?ngoId=" + ngoId + "&IsDlg=1";

        CSRUtility.showSPModal("NGO", ngoUrl, 400, 650);

    }

    CSRApp.renderHomePageSlider = function () {


        CSRApp.getHomePageSliderImages(function (imageDetails) {

            var active = "";
            var carouselItemMarkup = "<div class='carousel-item [ACTIVE]' ><img src='[IMAGEURL]' style='width:100%;height:400px;'/> </div>";
            var carouselIndicatorMarkup = "<li data-target='#csr-carousel' data-slide-to='[INDEX]' class='[ACTIVE]' ></li>";

            var carouselItemMarkupHTML = "";
            var carouselIndicatorsMarkupHTML = "";

            $(imageDetails).each(function (index) {

                var carouselItemBuild = carouselItemMarkup;
                var carouselIndicatorBuild = carouselIndicatorMarkup;

                if (index == 0) {
                    active = "active";
                }
                else {
                    active = "";
                }

                carouselItemBuild = carouselItemBuild.replace("[IMAGEURL]", this.ImageUrl);
                carouselItemBuild = carouselItemBuild.replace("[ACTIVE]", active);
                carouselItemMarkupHTML += carouselItemBuild;

                carouselIndicatorBuild = carouselIndicatorBuild.replace("[INDEX]", index);
                carouselIndicatorBuild = carouselIndicatorBuild.replace("[ACTIVE]", active);
                carouselIndicatorsMarkupHTML += carouselIndicatorBuild;

            });

            $("#csr-carousel .carousel-inner").html(carouselItemMarkupHTML);

            //make first active
            $("#csr-carousel .carousel-indicators").html(carouselIndicatorsMarkupHTML);


        });



    };

    CSRApp.renderMarkAttendance = function () {
        //get all programs and render in dropdown
        //set the name in dropdown
        //get the csr program by id
        var progId = parseInt(CSRUtility.getQueryString("progId"));

        var tableMarkup = "";

        CSRApp.getProgramDetails(progId, function (programDetails) {

            CSRApp.currentProgramDetails = programDetails;

            $("#csr-program-title").html(programDetails.Title);

            $("#csr-count").html("Registered : " + CSRApp.getSplittedValue(CSRApp.currentProgramDetails.Volunteers)
                + " | Attended : " + CSRApp.getSplittedValue(CSRApp.currentProgramDetails.VolunteersAttended));

            for (let b in programDetails.VolunteerDetails) {

                var volunteerDetail = programDetails.VolunteerDetails[b]
                if (!volunteerDetail.StartDate) { volunteerDetail.StartDate = "" }
                else {

                    volunteerDetail.StartDate = (new Date(volunteerDetail.StartDate)).format(CSRUtility.DateFormat)
                }
                if (!volunteerDetail.EndDate) { volunteerDetail.EndDate = "" }
                else {
                    volunteerDetail.EndDate = (new Date(volunteerDetail.EndDate)).format(CSRUtility.DateFormat)

                }


                //make attended markup
                var isAttended = volunteerDetail.Attended ? "checked" : "";
                var volunteerMarkup = "<tr><td>" + volunteerDetail.Username + "</td>"
                    + "<td>" + volunteerDetail.Userid + " </td>"
                    + "<td>" + volunteerDetail.StartDate + " </td>"
                    + "<td>" + volunteerDetail.EndDate + " </td>"
                    + "<td><input type='checkbox' value='" + volunteerDetail.Userid + "' name='csrAttendance' class='csr-checkbox csr-chkAttendance' " + isAttended + " > </td></tr>";
                tableMarkup += volunteerMarkup;


            }


            $("#csr-program-attendance tbody").html(tableMarkup);

            $(".csr-attendance-selectall").on("click", function () {
                var selectAll = this.checked;
                $(".csr-chkAttendance").each(function () {
                    this.checked = selectAll;
                })
            });
        });
        //

    };


    CSRApp.renderReport = function () {

        CSRApp.getReportsHomePage(function (reports) {

            $(".csr-report-title").html(reports[0].Title);
            $(".csr-report-desc").html(reports[0].Description);

            $(".csr-report-link").on("click", function () {
                var win = window.open(reports[0].FileUrl, '_blank');
                win.focus();
                return false;
            });


        });

    }


    CSRApp.renderGallery = function () {

        CSRApp.getPictureLibraryImages(CSRUtility.GalleryName, function (imageList) {
            var finalMarkup = "";
            $(imageList).each(function () {
                var imageUrl = this.ImageUrl;
                var title = this.Title;
                var itemMarkup = ' <div class="col-lg-3 col-md-4 col-xs-6 thumb"> ' +
                    '<a class="thumbnail" href="#" data-image-id="" data-toggle="modal" data-title="' + title + '" data-image="' + imageUrl + '" data-target="#image-gallery">' +
                    '<img class="img-thumbnail" src="' + imageUrl + '" alt="Another alt text">' +
                    '</a>' +
                    '</div>';

                finalMarkup += itemMarkup;
            });

            $(".csr-gallery .row").html(finalMarkup);
            CSRApp.galleryModalExtension();

        });

    }


    /******************DAL*********************/

    CSRApp.getProgramDetails = function (itemId, successCallback) {

        var includeFields = CSRUtility.IncludeFieldsProgram;
        CSRUtility.getItemByIdCurrentContext(CSRUtility.programsListName, itemId, includeFields, function (listItem) {

            var programDetails = {};

            programDetails = CSRApp.mapProgramDetails(listItem);

            successCallback(programDetails);

        });

    }

    CSRApp.mapProgramDetails = function (listItem) {
        var programDetails = {};
        programDetails.Id = listItem.get_item("ID");
        programDetails.Title = listItem.get_item("Title");
        programDetails.Description = listItem.get_item("ProgramDescription");
        programDetails.EventStartDate = listItem.get_item("EventDate");
        programDetails.EventEndDate = listItem.get_item("EndDate");
        programDetails.ProgramManager = CSRUtility.getUserFieldDetails(listItem, "Program_x0020_Manager");
        programDetails.NGO = CSRUtility.getLookupValue(listItem, "NGO");
        programDetails.NeedVolunteers = listItem.get_item("Need_x0020_Volunteers");
        programDetails.VolunteerDetails = JSON.parse(listItem.get_item("VolunteerDetails"));
        programDetails.Volunteers = listItem.get_item("Volunteers");
        programDetails.VolunteersAttended = listItem.get_item("VolunteersAttended");
        programDetails.Venue = listItem.get_item("Venue");
        programDetails.Location = listItem.get_item("ProgramLocation");
        programDetails.EmailPara = listItem.get_item("Email_x0020_Para") == null ? "" : listItem.get_item("Email_x0020_Para");
        programDetails.DaysToGo = CSRUtility.getDaysToGo(programDetails.EventStartDate);
        programDetails.HasStarted = CSRUtility.hasDatePassed(programDetails.EventStartDate);
        programDetails.HasEnded = CSRUtility.hasDatePassed(programDetails.EventEndDate);


        if (listItem.get_attachmentFiles().get_count() > 0) {
            var attachmentEnumerator = listItem.get_attachmentFiles().getEnumerator();
            attachmentEnumerator.moveNext();
            programDetails.ImageUrl = attachmentEnumerator.get_current().get_serverRelativeUrl();
        }
        else {
            programDetails.ImageUrl = CSRUtility.DefaultProgramImageUrl;
        }
        return programDetails;
    }

    //not needed will use OOTB form
    CSRApp.createProgramDetails = function (programDetails, successCallback) {

        //Code to update the details
        //var clientContext = CSRUtility.getCurrentClientContext();
        //var oList = clientContext.get_web().get_lists().getByTitle(CSRUtility.programsListName);
        //var oListItem = oList.getItemById(programDetails.Id);
        //Object.keys(programDetails).forEach(e => oListItem.set_item(e, programDetails[e]));
        //oListItem.update();
        //clientContext.executeQueryAsync(function () { successCallback(true) }, CSRUtility.errorCallback);

    }

    //not needed will use OOTB form
    CSRApp.updateProgramDetails = function (programDetails, successCallback) {

        //Code to update the details
        //var clientContext = CSRUtility.getCurrentClientContext();
        //var oList = clientContext.get_web().get_lists().getByTitle(CSRUtility.programsListName);
        //var oListItem = oList.getItemById(programDetails.Id);
        //Object.keys(programDetails).forEach(e => oListItem.set_item(e, programDetails[e]));
        //oListItem.update();
        //clientContext.executeQueryAsync(function () { successCallback(true) }, CSRUtility.errorCallback);


    }

    CSRApp.getAllProgramDetails = function (camlQuery, successCallback) {
        //CSRUtility.camlQueryAll
        var includeFields = CSRUtility.IncludeFieldsProgram;
        CSRUtility.getAllItemsCurrentContext(CSRUtility.programsListName, camlQuery, includeFields, function (collListItem) {

            var programDetailsList = [];

            var listItemEnumerator = collListItem.getEnumerator();

            while (listItemEnumerator.moveNext()) {
                var programDetails = {};
                var oListItem = listItemEnumerator.get_current();
                programDetails = CSRApp.mapProgramDetails(oListItem);
                programDetailsList.push(programDetails);
            }

            successCallback(programDetailsList);

        });
    }

    CSRApp.getAllActiveProgramDetails = function (successCallback) {

        var camlQuery = "<View><Query>" +
            "<Where>" +
            "<And>" +
            //  "<And>" +
            "<Geq><FieldRef Name='EventDate' /><Value  Type='DateTime'  IncludeTimeValue='FALSE' ><Today/></Value></Geq>" +
            //   "<Eq><FieldRef Name='RecurrenceType' /><Value  Type='Text'   >" + "None" + "</Value></Eq>" +
            // "</And>" +
            "<Eq><FieldRef Name=\"Need_x0020_Volunteers\"/><Value Type=\"Integer\" >" + 1 + "</Value></Eq>" +
            "</And>" +
            "</Where>" +
            "<OrderBy><FieldRef Name=\'ID\' Ascending='FALSE'/></OrderBy>" +
            "</Query></View>";
        CSRApp.getAllProgramDetails(camlQuery, successCallback);
    }

    CSRApp.getCurrentUserAllProgramDetails = function (successCallback) {

        var includeFields = CSRUtility.IncludeFieldsProgram;
        var currentUserEmail = _csrAppContext.CurrentUserId;
        var camlQuery = "<View><Query>" +
            "<Where>" +
            "<Contains><FieldRef Name=\"Volunteers\"/><Value Type=\"Text\">" + currentUserEmail + "</Value></Contains>" +
            "</Where>" +
            "<OrderBy><FieldRef Name=\'ID\' Ascending='FALSE'/></OrderBy>" +
            "</Query></View>";

        CSRUtility.getAllItemsCurrentContext(CSRUtility.programsListName, camlQuery, includeFields, function (collListItem) {

            var programDetailsList = [];

            var listItemEnumerator = collListItem.getEnumerator();

            while (listItemEnumerator.moveNext()) {
                var programDetails = {};
                var oListItem = listItemEnumerator.get_current();
                programDetails = CSRApp.mapProgramDetails(oListItem);
                programDetailsList.push(programDetails);
            }

            successCallback(programDetailsList);

        });
    }

    CSRApp.registerVolunteer = function (successCallback) {

        var success = false;
        var startDate = (new Date($("#csr-program-start-date").val()));// $("#dvStartDate").html(); 
        var endDate = (new Date($("#csr-program-end-date").val()));// $("#dvEndDate").html();

        var currentProgram = CSRApp.currentProgramDetails;

        var volunteerDetails = {};
        volunteerDetails.CurrentUserId = _csrAppContext.CurrentUserId;
        volunteerDetails.userDisplayName = _csrAppContext.userDisplayName;
        //CurrentUserId
        volunteerDetails.EmailId = _csrAppContext.currentUser.EmailId;
        volunteerDetails.startDate = startDate;
        volunteerDetails.endDate = endDate;
        volunteerDetails.InformManager = $(".csr-checkbox-manager")[0].checked;

        if (volunteerDetails.InformManager) {
            volunteerDetails.Manager = _csrAppContext.currentUser.Manager;
        }

        CSRApp.addVolunteerInProgram(volunteerDetails, true, successCallback);

        return success;
    };

    CSRApp.addVolunteerInProgram = function (volunteerDetails, sendMail, successCallback) {

        //volunteerDetails.CurrentUserId
        //userDisplayName
        //CurrentUserId
        //EmailId

        var currentProgram = CSRApp.currentProgramDetails;

        //getting the data again to handle concurrency
        CSRApp.getProgramDetails(currentProgram.Id, function (programDetails) {

            CSRApp.currentProgramDetails = programDetails;
            currentProgram = programDetails;

            var clientContext = CSRUtility.getCurrentClientContext();
            var oList = clientContext.get_web().get_lists().getByTitle(CSRUtility.programsListName);
            var oListItem = oList.getItemById(currentProgram.Id);

            if (currentProgram.Volunteers == null) {
                currentProgram.Volunteers = "";
            }
            else {
                currentProgram.Volunteers = CSRUtility.replaceAllOccurances(currentProgram.Volunteers, "," + volunteerDetails.CurrentUserId, ""); // to ensure no additional entries are added

            }

            if (currentProgram.VolunteersAttended == null) {
                currentProgram.VolunteersAttended = "";
            }
            else {
                currentProgram.VolunteersAttended = CSRUtility.replaceAllOccurances(currentProgram.VolunteersAttended, "," + volunteerDetails.CurrentUserId, ""); // to ensure no additional entries are added

            }

            var volunteers = currentProgram.Volunteers + "," + volunteerDetails.CurrentUserId; //handle null
            oListItem.set_item("Volunteers", volunteers);
            //update the volunteer details


            if (!currentProgram.VolunteerDetails) {
                currentProgram.VolunteerDetails = {};
            }
            currentProgram.VolunteerDetails[volunteerDetails.CurrentUserId] = {
                "Username": volunteerDetails.userDisplayName,
                "Userid": volunteerDetails.CurrentUserId,
                "EmailId": volunteerDetails.EmailId,
                "StartDate": volunteerDetails.startDate,
                "EndDate": volunteerDetails.endDate,
                "Attended": false,
                "InformManager": volunteerDetails.InformManager,
                "Manager": volunteerDetails.InformManager ? _csrAppContext.currentUser.Manager : ""

            };
            oListItem.set_item("VolunteerDetails", JSON.stringify(currentProgram.VolunteerDetails));
            oListItem.set_item("VolunteersAttended", currentProgram.VolunteersAttended);

            oListItem.update();
            clientContext.executeQueryAsync(function () {
                if (sendMail) {
                    CSRApp.addMailTrackerEntry(volunteerDetails.EmailId, "", currentProgram, CSRUtility.RegisterType, function () {
                        successCallback(true);
                    });
                }
                else {

                    successCallback(true);
                }
            });


        });


    }

    CSRApp.withdrawVolunteer = function (successCallback) {

        var success = false;
        var currentProgram = CSRApp.currentProgramDetails;

        CSRApp.getProgramDetails(currentProgram.Id, function (programDetails) {

            CSRApp.currentProgramDetails = programDetails;
            currentProgram = programDetails;


            var clientContext = CSRUtility.getCurrentClientContext();
            var oList = clientContext.get_web().get_lists().getByTitle(CSRUtility.programsListName);
            var oListItem = oList.getItemById(currentProgram.Id);

            var volunteers = currentProgram.Volunteers.replace("," + _csrAppContext.CurrentUserId, "");
            oListItem.set_item("Volunteers", volunteers);

            //update the volunteer details     
            delete currentProgram.VolunteerDetails[_csrAppContext.CurrentUserId];
            oListItem.set_item("VolunteerDetails", JSON.stringify(currentProgram.VolunteerDetails));

            oListItem.update();
            clientContext.executeQueryAsync(function () {
                //  successCallback(true);
                CSRApp.addMailTrackerEntry(_csrAppContext.currentUser.EmailId, "", currentProgram, CSRUtility.WithdrawType, function () {
                    successCallback(true);
                });
            }, CSRUtility.errorCallback);
        });

        return success;
    };

    CSRApp.markAttendance = function (programId) {
        //get selected check box
        var selectedVolunteers = [];
        var success = false;
        var currentProgram = CSRApp.currentProgramDetails;
        var clientContext = CSRUtility.getCurrentClientContext();
        var oList = clientContext.get_web().get_lists().getByTitle(CSRUtility.programsListName);
        var oListItem = oList.getItemById(currentProgram.Id);
        oListItem.set_item("VolunteersAttended", selectedVolunteers);
        //update the volunteer attended details
        oListItem.update();
        clientContext.executeQueryAsync(function () { successCallback(true) }, CSRUtility.errorCallback);

        return success;

    };

    CSRApp.addTestimonial = function () {
        var progId = parseInt(CSRUtility.getQueryString("progId"));
        //write code to add testimonial in testimonial list

        var testimony = $("#taTestimony").val();

        var ctx = new SP.ClientContext();
        var oList = ctx.get_web().get_lists().getByTitle(CSRUtility.TestimonialsListName);
        var createiteminfo = new SP.ListItemCreationInformation();
        var listItem = oList.addItem(createiteminfo);
        listItem.set_item('Testimonial', testimony);
        listItem.update();
        ctx.load(listItem);
        ctx.executeQueryAsync(function () {
            alert("Testimonial Submitted succesfully for moderation.");
            SP.UI.ModalDialog.commonModalDialogClose(SP.UI.DialogResult.Cancel);
            //  window.location = CSRUtility.SiteServerRelativeUrl;
        }, function (sender, args) {
            CSRUtility.errorCallback(sender, args, "Error occured addTestimonial");
        });

    };

    //not in use as ootb form is used
    CSRApp.addFeedback = function () {
        var progId = parseInt(CSRUtility.getQueryString("progId"));
        //write code to add testimonial in testimonial list


    };

    CSRApp.openRegisterWithdrawPage = function (progId) {

        CSRUtility.showSPModal("Register", CSRUtility.RegisterWithdrawServerRelativeUrl + "?progId=" + progId + "&IsDlg=1", 500, 450);

    }

    CSRApp.openViewProgramDetails = function (progId) {

        var redirectUrl = CSRUtility.ViewProgramDetailsServerRelativeUrl + "?progId=" + progId;
        window.location.href = redirectUrl;
        //CSRUtility.showSPModal("View Program", CSRUtility.ViewProgramDetailsServerRelativeUrl + "?progId=" + progId + "&IsDlg=1");

    }

    CSRApp.getAllNGODetails = function (successCallback) {

        CSRUtility.getAllItemsCurrentContext(CSRUtility.ngoListName, CSRUtility.camlQueryAll, CSRUtility.IncludeFieldsNGO,
            function (ngoListItemColl) {
                var listItemEnumerator = ngoListItemColl.getEnumerator();
                var ngoList = [];
                while (listItemEnumerator.moveNext()) {
                    var ngoDetails = {};
                    var listItem = listItemEnumerator.get_current();
                    ngoDetails.Id = listItem.get_item("ID");
                    ngoDetails.Title = listItem.get_item("Title");
                    ngoDetails.Description = listItem.get_item("Description");
                    ngoDetails.ImageUrl = CSRUtility.getAttachmentUrl(listItem);
                    ngoList.push(ngoDetails);
                }
                successCallback(ngoList);

            });
    };

    CSRApp.getNGODetailsById = function (itemId, successCallback) {


        CSRUtility.getItemByIdCurrentContext(CSRUtility.ngoListName, itemId, CSRUtility.IncludeFieldsNGO, function (listItem) {

            var ngoDetails = {};
            ngoDetails.Id = listItem.get_item("ID");
            ngoDetails.Title = listItem.get_item("Title");
            ngoDetails.Description = listItem.get_item("Description");
            ngoDetails.ImageUrl = CSRUtility.getAttachmentUrl(listItem);

            successCallback(ngoDetails);

        });
    };


    CSRApp.getAllTestimonials = function (successCallback) {

        CSRUtility.getAllItemsCurrentContext(CSRUtility.testimonialListName, CSRUtility.camlQueryAll, CSRUtility.IncludeFieldsTestimonial,
            function (listItemColl) {
                var listItemEnumerator = listItemColl.getEnumerator();
                var itemList = [];
                while (listItemEnumerator.moveNext()) {
                    var detail = {};
                    var listItem = listItemEnumerator.get_current();
                    detail.Id = listItem.get_item("ID");
                    detail.Title = listItem.get_item("Title");
                    detail.Testimonial = listItem.get_item("Testimonial");
                    detail.Approved = listItem.get_item("IsPublished");
                    detail.ShowOnHomePage = listItem.get_item("ShowOnHomePage");
                    detail.Author = CSRUtility.getUserFieldDetails(listItem, "Author");
                    itemList.push(detail);
                }
                successCallback(itemList);

            });
    };

    CSRApp.getReportsHomePage = function (successCallback) {

        var camlQuery = "<View><Query>" +
            "<Where>" +
            "<Eq><FieldRef Name=\"ShowonHomePage\"/><Value Type=\"Integer\" >" + 1 + "</Value></Eq>" +
            "</Where>" +
            "</Query></View>";

        CSRUtility.getAllItemsCurrentContext(CSRUtility.reportsListName, camlQuery, CSRUtility.IncludeFieldsReport,
            function (listItemColl) {
                var listItemEnumerator = listItemColl.getEnumerator();
                var itemList = [];
                while (listItemEnumerator.moveNext()) {
                    var detail = {};
                    var listItem = listItemEnumerator.get_current();
                    detail.Id = listItem.get_item("ID");
                    detail.Title = listItem.get_item("Title");
                    detail.FileUrl = listItem.get_item("EncodedAbsUrl");
                    detail.Description = listItem.get_item("Description0");
                    itemList.push(detail);
                }
                successCallback(itemList);

            });

    };


    CSRApp.getHomePageSliderImages = function (successCallback) {

        CSRUtility.getAllItemsCurrentContext(CSRUtility.HomePageSliderLibraryName, CSRUtility.camlQueryAll, CSRUtility.IncludeFieldsHomePageSlider,
            function (listItemColl) {
                var listItemEnumerator = listItemColl.getEnumerator();
                var homePageSliderList = [];
                while (listItemEnumerator.moveNext()) {
                    var homePageSliderImageDetails = {};
                    var listItem = listItemEnumerator.get_current();
                    homePageSliderImageDetails.Id = listItem.get_item("ID");
                    homePageSliderImageDetails.Title = listItem.get_item("Title");
                    homePageSliderImageDetails.ImageUrl = listItem.get_item("EncodedAbsUrl");
                    homePageSliderList.push(homePageSliderImageDetails);
                }
                successCallback(homePageSliderList);

            });

    };

    CSRApp.getPictureLibraryImages = function (pictureLibraryName, successCallback) {

        CSRUtility.getAllItemsCurrentContext(pictureLibraryName, CSRUtility.camlQueryAll, CSRUtility.IncludeFieldsHomePageSlider,
            function (listItemColl) {
                var listItemEnumerator = listItemColl.getEnumerator();
                var imageList = [];
                while (listItemEnumerator.moveNext()) {
                    var imageDetails = {};
                    var listItem = listItemEnumerator.get_current();
                    imageDetails.Id = listItem.get_item("ID");
                    imageDetails.Title = listItem.get_item("Title");
                    imageDetails.ImageUrl = listItem.get_item("EncodedAbsUrl");
                    imageList.push(imageDetails);
                }
                successCallback(imageList);

            });

    }


    CSRApp.updateProgramAttendance = function () {

        var currentProgram = CSRApp.currentProgramDetails;
        // var attendedVolunteerEmailIds = "";
        //get all the selected attendance
        $(".csr-chkAttendance").each(function () {
            var userId = this.value;

            if (currentProgram.VolunteersAttended == null) {
                currentProgram.VolunteersAttended = "";
            }

            if (this.checked) {
                if (currentProgram.VolunteersAttended.indexOf(userId) == -1) {
                    currentProgram.VolunteersAttended = String(currentProgram.VolunteersAttended) + "," + userId;
                }
                currentProgram.VolunteerDetails[userId].Attended = true;
            }
            else {
                ;
                currentProgram.VolunteersAttended = CSRUtility.replaceAllOccurances(currentProgram.VolunteersAttended, "," + userId, "");
                currentProgram.VolunteerDetails[userId].Attended = false;
            }
        });


        var clientContext = CSRUtility.getCurrentClientContext();
        var oList = clientContext.get_web().get_lists().getByTitle(CSRUtility.programsListName);
        var oListItem = oList.getItemById(currentProgram.Id);

        oListItem.set_item("VolunteersAttended", currentProgram.VolunteersAttended);
        oListItem.set_item("VolunteerDetails", JSON.stringify(currentProgram.VolunteerDetails));

        oListItem.update();
        clientContext.executeQueryAsync(function () {
            alert("Attendance updated successfully!!");
            window.location = window.location;
            //successCallback(true)
        }, CSRUtility.errorCallback);

    }


    CSRApp.galleryModalExtension = function () {

        var modalIdWA = $('#image-gallery');

        $(document)
            .ready(function () {

                loadGallery(true, 'a.thumbnail');

                //This function disables buttons when needed
                function disableButtons(counter_max, counter_current) {
                    $('#show-previous-image, #show-next-image')
                        .show();
                    if (counter_max === counter_current) {
                        $('#show-next-image')
                            .hide();
                    } else if (counter_current === 1) {
                        $('#show-previous-image')
                            .hide();
                    }
                }

                /**
                 *
                 * @param setIDs        Sets IDs when DOM is loaded. If using a PHP counter, set to false.
                 * @param setClickAttr  Sets the attribute for the click handler.
                 */

                function loadGallery(setIDs, setClickAttr) {
                    let current_image,
                        selector,
                        counter = 0;

                    $('#show-next-image, #show-previous-image')
                        .click(function () {
                            if ($(this)
                                .attr('id') === 'show-previous-image') {
                                current_image--;
                            } else {
                                current_image++;
                            }

                            selector = $('[data-image-id="' + current_image + '"]');
                            updateGallery(selector);
                        });

                    function updateGallery(selector) {
                        let $sel = selector;
                        current_image = $sel.data('image-id');
                        $('#image-gallery-title')
                            .text($sel.data('title'));
                        $('#image-gallery-image')
                            .attr('src', $sel.data('image'));
                        disableButtons(counter, $sel.data('image-id'));
                    }

                    if (setIDs == true) {
                        $('[data-image-id]')
                            .each(function () {
                                counter++;
                                $(this)
                                    .attr('data-image-id', counter);
                            });
                    }
                    $(setClickAttr)
                        .on('click', function () {
                            updateGallery($(this));
                        });
                }
            });

        // build key actions
        $(document)
            .keydown(function (e) {
                switch (e.which) {
                    case 37: // left
                        if ((modalIdWA.data('bs.modal') || {})._isShown && $('#show-previous-image').is(":visible")) {
                            $('#show-previous-image')
                                .click();
                        }
                        break;

                    case 39: // right
                        if ((modalIdWA.data('bs.modal') || {})._isShown && $('#show-next-image').is(":visible")) {
                            $('#show-next-image')
                                .click();
                        }
                        break;

                    default:
                        return; // exit this handler for other keys
                }
                e.preventDefault(); // prevent the default action (scroll / move caret)
            });

    }


    CSRApp.addMailTrackerEntry = function (toEmail, ccEmail, programDetails, mailType, successCallback) {


        CSRApp.getMailTemplate(mailType, function (template) {

            var progId = CSRUtility.getQueryString("progId");
            var viewProgramUrl = CSRUtility.ViewProgramDetailsServerRelativeUrl + "?progId=" + progId;

            template = CSRUtility.replaceAllOccurances(template, "{{ProgramName}}", programDetails.Title);
            template = CSRUtility.replaceAllOccurances(template, "{{ProgramManager}}", programDetails.ProgramManager[0].userName + "(" + programDetails.ProgramManager[0].email + ")");
            template = CSRUtility.replaceAllOccurances(template, "{{EventStartDate}}", programDetails.EventStartDate.format(CSRUtility.DateFormat));
            template = CSRUtility.replaceAllOccurances(template, "{{EventEndDate}}", programDetails.EventEndDate.format(CSRUtility.DateFormat));
            template = CSRUtility.replaceAllOccurances(template, "{{Venue}}", programDetails.Venue);
            template = CSRUtility.replaceAllOccurances(template, "{{Description}}", programDetails.Description);
            template = CSRUtility.replaceAllOccurances(template, "{{VolunteerName}}", _csrAppContext.currentUser.PrefferedName);
            template = CSRUtility.replaceAllOccurances(template, "{{ProgramLink}}", viewProgramUrl);
            template = CSRUtility.replaceAllOccurances(template, "{{EmailPara}}", programDetails.EmailPara);

            var subject = "";
            switch (mailType) {

                case CSRUtility.RegisterType:
                    subject = "CSR - " + programDetails.Title + " : Registration Confirmation";
                    break;
                case CSRUtility.WithdrawType:
                    subject = "CSR - " + programDetails.Title + " : Withdrawal Confirmation";
                    break;
                case CSRUtility.FeedbackType:
                    subject = "CSR - " + programDetails.Title + " : Feedback";
                    break;

            }


            var ctx = new SP.ClientContext();
            var oList = ctx.get_web().get_lists().getByTitle(CSRUtility.MailTrackerListName);
            var createiteminfo = new SP.ListItemCreationInformation();
            var listItem = oList.addItem(createiteminfo);
            listItem.set_item('To', toEmail);
            listItem.set_item('Cc', ccEmail);
            listItem.set_item('Subject', subject);
            listItem.set_item('Body', template);
            listItem.update();
            ctx.load(listItem);
            ctx.executeQueryAsync(function () {
                console.log("Mail tracked successfully");
                successCallback(true);

            }, function (sender, args) {
                CSRUtility.errorCallback(sender, args, "Error occured addMailTrackerEntry");
                successCallback(false);
            });

        });

    }

    CSRApp.getMailTemplate = function (mailType, successCallback) {

        var mailTemplateLocation = "";

        switch (mailType) {

            case CSRUtility.RegisterType:
                mailTemplateLocation = CSRUtility.SiteServerRelativeUrl + "/siteassets/html/EmailTemplates/registermailtemplate.html";
                break;
            case CSRUtility.WithdrawType:
                mailTemplateLocation = CSRUtility.SiteServerRelativeUrl + "/siteassets/html/EmailTemplates/WithdrawMailTemplate.html";
                break;
            case CSRUtility.FeedbackType:
                mailTemplateLocation = CSRUtility.SiteServerRelativeUrl + "/siteassets/html/EmailTemplates/FeedbackMailTemplate.html";
                break;

        }

        $.get(mailTemplateLocation, function (data, status) {
            //alert("Data: " + data + "\nStatus: " + status);
            successCallback(data);
        });

    }

    CSRApp.sendEmailForFeedback = function () {

        if (window.confirm("Are you sure you want to send feedback email?")) {

            //  $(".loading").show();
            var programDetails = CSRApp.currentProgramDetails;
            var attendedEmailIds = "";
            // programDetails.VolunteerDetails;

            var processingCounter = 0;
            for (let b in programDetails.VolunteerDetails) {

                var volunteerDetail = programDetails.VolunteerDetails[b];
                if (volunteerDetail.Attended) {
                    attendedEmailIds += volunteerDetail.EmailId + ",";

                    var toEmaild = volunteerDetail.EmailId;
                    var ccEmailId = "";
                    if (volunteerDetail.InformManager) {
                        // alert(volunteerDetail.Manager);
                        ccEmailId = volunteerDetail.Manager;
                    }

                    CSRApp.addMailTrackerEntry(toEmaild, ccEmailId, programDetails, CSRUtility.FeedbackType, function (status) {

                        processingCounter++;
                        CSRUtility.log(status);

                        if (processingCounter == Object.keys(programDetails.VolunteerDetails).length) {

                            $(".loading").hide();
                            alert("An email request has been added.It will be sent shortly");
                        }


                    });



                }
            }

            if (attendedEmailIds != "") {

                CSRUtility.log(attendedEmailIds);

            }
        }

    }

    CSRApp.exportVolunteerDetails = function () {


        var programDetails = CSRApp.currentProgramDetails;

        var volunteerInfo = [];
        for (let b in programDetails.VolunteerDetails) {

            var volunteerDetail = programDetails.VolunteerDetails[b];
            volunteerInfo.push([volunteerDetail.Username, volunteerDetail.EmailId, (new Date(volunteerDetail.StartDate)).format(CSRUtility.DateFormat), (new Date(volunteerDetail.EndDate)).format(CSRUtility.DateFormat)]);
        }

        var csv = 'Name,EmailId,StartDate,EndDate\n';
        volunteerInfo.forEach(function (row) {
            csv += row.join(',');
            csv += "\n";
        });

        console.log(csv);
        var hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
        hiddenElement.target = '_blank';
        hiddenElement.download = programDetails.Title + '_Volunteers.csv';
        hiddenElement.click();

    }


    CSRApp.addNewVolunteer = function () {

        $("#csr-addnewvolunteer").modal({ backdrop: 'static' });
        $('#csr-addnewvolunteer').on('hidden.bs.modal', function (e) {
            window.location = window.location;
        })

    }

    CSRApp.validateVolunteer = function () {

        var userId = $("#csr-empId").val();

        if (userId != "") {

            CSRUtility.getCurrentUserProfilePropertiesFor(userId, function (userProperties) {

                var userDetails = CSRUtility.mapUserProfileProperties(userProperties);
                $(".csr-volunteer-details").html("User Name : " + userDetails.PrefferedName + " Email: " + userDetails.EmailId);
                CSRApp.validatedUser = userDetails;
                $("#csr-btn-submitVolunteer").show();
            });
        }


    }


    CSRApp.submitNewVolunteer = function () {

        var userDetails = CSRApp.validatedUser;
        var currentProgram = CSRApp.currentProgramDetails;

        var volunteerDetails = {};
        volunteerDetails.CurrentUserId = userDetails.UserId;
        volunteerDetails.userDisplayName = userDetails.PrefferedName;
        //CurrentUserId
        volunteerDetails.EmailId = userDetails.EmailId;
        volunteerDetails.startDate = currentProgram.EventStartDate;
        volunteerDetails.endDate = currentProgram.EventEndDate;
        volunteerDetails.InformManager = false;

        CSRApp.addVolunteerInProgram(volunteerDetails, false, function (status) {
            if (status) {
                alert("Volunteer Added Successfully!");
                $(".csr-volunteer-details").html("");
                $("#csr-empId").val("");
                $("#csr-btn-submitVolunteer").hide();
                //  $('#csr-addnewvolunteer').modal('toggle');
            }
        });

    }


    CSRApp.checkIfFeedbackSubmitted = function (successCallback) {
        var currentProgram = CSRApp.currentProgramDetails;

        var camlQuery = "<View><Query>" +
            "<Where>" +
            "<And>" +
            "<Eq><FieldRef Name=\"Author\"  LookupId='TRUE' /><Value Type=\"Integer\" >" + _spPageContextInfo.userId + "</Value></Eq>" +
            "<Eq><FieldRef Name=\"Program\"  LookupId='TRUE' /><Value Type=\"Integer\" >" + currentProgram.Id + "</Value></Eq>" +
            "</And>" +
            "</Where>" +
            "<OrderBy><FieldRef Name=\'ID\' Ascending='FALSE'/></OrderBy>" +
            "</Query></View>";


        CSRUtility.getAllItemsCurrentContext(CSRUtility.feedbackListName, camlQuery, CSRUtility.IncludeFieldsFeedback,
            function (listItemColl) {
                var listItemEnumerator = listItemColl.getEnumerator();
                var itemList = [];
                while (listItemEnumerator.moveNext()) {
                    var detail = {};
                    var listItem = listItemEnumerator.get_current();
                    detail.Id = listItem.get_item("ID");
                    detail.Title = listItem.get_item("Title");
                    itemList.push(detail);
                }
                var isSubmitted = false;
                if (itemList.length > 0) { isSubmitted = true; }

                successCallback(isSubmitted);
            });


    }

    CSRApp.fetchMonthReport = function () {

        var month = $("#csr-report-month").val();
        var year = $("#csr-report-year-tab2").val();

        var startDateMonthWise = new Date(year, month, 01, 00, 00, 00, 0);
        var endDateMonthWise = new Date(year, parseInt(month) + 1, 01, 00, 00, 00, 0);

        //TabularView and Graphical View for Month selected
        CSRApp.getReportData(startDateMonthWise, endDateMonthWise, function (programList) {

            if (programList.length == 0) { alert("No records found!!") }

            var html = "";
            var monthlyData = {};
            monthlyData.Labels = [];
            monthlyData.Registered = [];
            monthlyData.Attended = [];
            monthlyData.Feedback = [];
            $(programList).each(function () {
                var volunteerCount = CSRApp.getSplittedValue(this.Volunteers);
                var volunteerAttendedCount = CSRApp.getSplittedValue(this.VolunteersAttended);
                monthlyData.Labels.push(this.Title);
                monthlyData.Registered.push(volunteerCount);
                monthlyData.Attended.push(volunteerAttendedCount);
                monthlyData.Feedback.push(0);
                html += "<tr><td>" + this.Title + "</td>" +
                    "<td>" + volunteerCount + "</td>" +
                    "<td>" + volunteerAttendedCount + "</td></tr>";

            });

            $("#csr-report-table tbody").html(html);

            CSRApp.configureChart("monthly", null, monthlyData);




        });



    }

    CSRApp.fetchYearReport = function () {

        //    var month = $("#csr-report-month").val();
        var year = $("#csr-report-year-tab1").val();

        var startDateYearWise = new Date(year, 0, 01, 00, 00, 00, 0);
        var endDateYearWise = new Date(parseInt(year) + 1, 0, 01, 00, 00, 00, 0);
        //Yearwise view in graph
        var yearlyArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        CSRApp.getReportData(startDateYearWise, endDateYearWise, function (programList) {

            $(programList).each(function () {

                var month = this.EventStartDate.getMonth();
                yearlyArray[month] = yearlyArray[month] + 1;
                console.log(yearlyArray);

            });

            CSRApp.configureChart("yearly", yearlyArray, null);



        });
    }

    CSRApp.configureChart = function (chartType, yearlyData, monthlyData) {

        if (chartType == "yearly") {

            var ctx = document.getElementById('csr-program-chart').getContext('2d');

            for (let b in Chart.instances) { Chart.instances[b].destroy() }

            var chartYearly = new Chart(ctx, {
                // The type of chart we want to create
                type: 'bar',

                // The data for our dataset
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [{
                        label: 'No of Programs',
                        backgroundColor: '#e67e22',
                        borderColor: '#e67e22',
                        data: yearlyData
                    }]
                },

                // Configuration options go here
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                stepSize: 1,
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });
        }
        else {

            var ctx = document.getElementById('csr-program-count').getContext('2d');
            for (let b in Chart.instances) { Chart.instances[b].destroy() }
            var chartMonthly = new Chart(ctx, {
                // The type of chart we want to create
                type: 'bar',

                // The data for our dataset
                data: {
                    labels: monthlyData.Labels,
                    datasets: [{
                        label: 'Registered',
                        backgroundColor: '#17a2b8',
                        borderColor: '#17a2b8',
                        data: monthlyData.Registered
                    },
                    {
                        label: 'Attended',
                        backgroundColor: '#ffc107',
                        borderColor: '#ffc107',
                        data: monthlyData.Attended
                    }
                    ]
                },

                // Configuration options go here
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                stepSize: 1,
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });

        }



    }


    CSRApp.getReportData = function (startDate, endDate, successCallback) {


        var camlQuery = "<View><Query>" +
            "<Where>" +
            "<And><And>" +
            "<Geq><FieldRef Name='EventDate' /><Value  Type='DateTime'  IncludeTimeValue='FALSE' >" + startDate.format(CSRUtility.SPDateFormat) + "</Value></Geq>" +
            "<Lt><FieldRef Name='EventDate' /><Value  Type='DateTime'  IncludeTimeValue='FALSE' >" + endDate.format(CSRUtility.SPDateFormat) + "</Value></Lt>" +
            "</And>" +
            "<Eq><FieldRef Name=\"Need_x0020_Volunteers\"/><Value Type=\"Integer\" >" + 1 + "</Value></Eq>" +
            "</And>" +
            // "<Eq><FieldRef Name=\"RecurrenceType\"/><Value Type=\"Text\" >" + "None" + "</Value></Eq>" +
            //"</And>" +
            "</Where>" +
            "<OrderBy><FieldRef Name=\'ID\' Ascending='FALSE'/></OrderBy>" +
            "</Query></View>";
        CSRApp.getAllProgramDetails(camlQuery, function (programList) {

            successCallback(programList);

        });

    }


    CSRApp.getSplittedValue = function (value) {

        var length = 0;
        var arr = CSRUtility.trim(value, ",").split(",");
        if (arr.length == 1) {
            if (arr[0] == "") { length = 0; } else { length = arr.length; }
        }
        else {
            length = arr.length;
        }
        return length;
    }


})(window.CSRApp = window.CSRApp || {});