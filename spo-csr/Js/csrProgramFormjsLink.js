
var csrFormJsLink = csrFormJsLink || {};




csrFormJsLink.createRecurringProgramEvent = function () {

    var status = false;
    var recurringType = $("select[title='RecurrenceType']").val();
    var startDate = getDateField("Start Time Required Field");
    var endDate = getDateField("End Time Required Field");//new Date("11/25/2019");
    switch (recurringType) {

        case "Daily":
            status = csrFormJsLink.createDailyRecurring(startDate, endDate);
            break;
        case "Weekly":
            status = csrFormJsLink.createWeeklyRecurring(startDate, endDate);
            break;
        case "Monthly":
            status = csrFormJsLink.createMontlyRecurring(startDate, endDate);
            break;
        case "None":
            status = true;
            break;
    }

    return status;
}


csrFormJsLink.validateForm = function () {

    var programDetails = csrFormJsLink.getFormValues();
    var isValid = true;

    if (programDetails.Title == "") {

        isValid = false;
    }
    if (programDetails.ProgramDescription == "") {

        isValid = false;
    }

    if (programDetails.ForLocation == "") {

        isValid = false;
    }

    if (programDetails.StartTime > programDetails.EndTime) {
        isValid = false;

    }

    if (programDetails.ProgramManager == "") {
        isValid = false;
    }

    return isValid;
}

csrFormJsLink.getFormValues = function () {


    var programDetails = {};
    programDetails.NGO = $("select[title='NGO']").val();
    programDetails.Title = $("input[title='Title Required Field']").val();
    programDetails.ProgramDescription = $("textarea[title='Program Description Required Field']").val();
    programDetails.ForLocation = $("select[title='For Location Required Field']").val();
    programDetails.Venue = $("textarea[title='Venue']").val();

    programDetails.NeedVolunteers = $('input[type=checkbox]').is(":checked");
    programDetails.EmailPara = $("textarea[title='Email Para']").val();
    programDetails.StartTime = getDateField("Start Time Required Field");
    programDetails.EndTime = getDateField("End Time Required Field");

    programDetails.ProgramManager = pickerValues;


    return programDetails;

}

//Daily . Monthly  **  --done
// Form  : Dates, People picker **
// Edit form disable
//Test
// Validation: Blank validations 
//remove master item in list views



csrFormJsLink.createWeeklyRecurring = function (startDate, endDate) {
    var programDates = [];

    var noOfWeeks = csrFormJsLink.getWeekDifference(startDate, endDate);

    //first iteration
    var firstdate = {};
    firstdate.StartDate = startDate;
    endDate.setDate(startDate.getDate());
    endDate.setMonth(startDate.getMonth());
    endDate.setYear(startDate.getYear());
    firstdate.EndDate = endDate;
    programDates.push(firstdate);


    var currSD = new Date(startDate);
    var currED = new Date(endDate);
    for (var i = 0; i < noOfWeeks; i++) {

        currSD = new Date(currSD);
        currED = new Date(currED);

        var date = {};//1,8, 15
        currSD.setDate(currSD.getDate() + (7));
        date.StartDate = currSD;
        currED.setDate(currSD.getDate());
        currED.setMonth(currSD.getMonth());
        currED.setYear(currSD.getYear());
        date.EndDate = currED;
        programDates.push(date);

    }
    csrFormJsLink.createRecurringSPItem(programDates);

}


csrFormJsLink.createDailyRecurring = function (startDate, endDate) {


    var programDates = [];
    var noOfDays = csrFormJsLink.getDaysDifference(startDate, endDate);

    //first iteration
    var date = {};
    date.StartDate = startDate;
    endDate.setDate(startDate.getDate());
    endDate.setMonth(startDate.getMonth());
    endDate.setYear(startDate.getYear());
    date.EndDate = endDate;
    programDates.push(date);

    var currSD = new Date(startDate);
    var currED = new Date(endDate);

    for (var i = 0; i < noOfDays; i++) {

        currSD = new Date(currSD);
        currED = new Date(currED);

        var date = {};
        currSD.setDate(currSD.getDate() + 1);
        date.StartDate = currSD;
        currED.setDate(currSD.getDate());
        currED.setMonth(currSD.getMonth());
        currED.setYear(currSD.getYear());
        date.EndDate = currED;
        programDates.push(date);

    }
    csrFormJsLink.createRecurringSPItem(programDates);

}

csrFormJsLink.createMontlyRecurring = function (startDate, endDate) {


    var programDates = [];
    var noOfMonths = csrFormJsLink.getMonthDifference(startDate, endDate);

    //first iteration
    var date = {};
    date.StartDate = startDate;
    endDate.setDate(startDate.getDate());
    endDate.setMonth(startDate.getMonth());
    endDate.setYear(startDate.getYear());
    date.EndDate = endDate;
    programDates.push(date);


    var currSD = new Date(startDate);
    var currED = new Date(endDate);

    for (var i = 0; i < noOfMonths; i++) {

        currSD = new Date(currSD);
        currED = new Date(currED);

        var date = {};
        currSD.setMonth(currSD.getMonth() + (1));
        date.StartDate = currSD;
        currED.setDate(currSD.getDate());
        currED.setMonth(currSD.getMonth());
        currED.setYear(currSD.getYear());
        date.EndDate = currED;
        programDates.push(date);
    }

    csrFormJsLink.createRecurringSPItem(programDates);
}



csrFormJsLink.createRecurringSPItem = function (programDates) {

    var programDetails = csrFormJsLink.getFormValues();

    var clientContext = new SP.ClientContext(_spPageContextInfo.webAbsoluteUrl);
    var oList = clientContext.get_web().get_lists().getByTitle(CSRUtility.programsListName);

    $(programDates).each(function () {


        var createiteminfo = new SP.ListItemCreationInformation();
        ListItem = oList.addItem(createiteminfo);
        ListItem.set_item('NGO', programDetails.NGO);
        ListItem.set_item('Title', programDetails.Title);
        ListItem.set_item('ProgramDescription', programDetails.ProgramDescription);
        ListItem.set_item('EventDate', this.StartDate);
        ListItem.set_item('EndDate', this.EndDate);
        ListItem.set_item('RecurrenceType', "None");//Only the parent item will be set with the value
        ListItem.set_item('ProgramLocation', programDetails.ForLocation);
        ListItem.set_item('Venue', programDetails.Venue);
        //   this.ListItem.set_item('Program_x0020_Manager', programDetails.ProgramManager);
        ListItem.set_item('Email_x0020_Para', programDetails.EmailPara);
        //  this.ListItem.set_item('Need_x0020_Volunteers', programDetails.NeedVolunteers);


        ListItem.update();
        clientContext.load(ListItem);
    });

    clientContext.executeQueryAsync(function () { alert('success') }, function (sender, args) { alert('failure'); console.log(args); });


}



/**************************Date Functions***************************/
csrFormJsLink.getWeekDifference = function (dtFrom, dtTo) {

    var diff = (dtTo.getTime() - dtFrom.getTime()) / 1000;
    diff /= (60 * 60 * 24 * 7);
    return Math.abs(Math.round(diff));
}


csrFormJsLink.getMonthDifference = function (dateFrom, dateTo) {

    return dateTo.getMonth() - dateFrom.getMonth() +
        (12 * (dateTo.getFullYear() - dateFrom.getFullYear()))
}


csrFormJsLink.getDaysDifference = function (dtFrom, dtTo) {

    // Take the difference between the dates and divide by milliseconds per day.
    // Round to nearest whole number to deal with DST.
    return Math.round((dtTo - dtFrom) / (1000 * 60 * 60 * 24));
}




window.onload = function () {
    $.getScript("/_layouts/15/clientpeoplepicker.js");
}


function PreSaveAction() {
    alert("here");
    if (csrFormJsLink.validateForm()) {
        csrFormJsLink.createRecurringProgramEvent();
    }
    else {
        return true;
    }


    return true;
}




function stringToDate(_date, _format, _delimiter) {
    var formatLowerCase = _format.toLowerCase();
    var formatItems = formatLowerCase.split(_delimiter);
    var dateItems = _date.split(_delimiter);
    var monthIndex = formatItems.indexOf("mm");
    var dayIndex = formatItems.indexOf("dd");
    var yearIndex = formatItems.indexOf("yyyy");
    var month = parseInt(dateItems[monthIndex]);
    month -= 1;
    var formatedDate = new Date(dateItems[yearIndex], month, dateItems[dayIndex]);
    return formatedDate;
}


function getDateField(field) {
    var date = $(":input[title='" + field + "']").val(); //retrieves date from date text box which is in mm/dd/yyyy format
    date = stringToDate(date, "dd-MM-yyyy", "-");
    var d = new Date(date);
    var month = d.getMonth() + 1; //adding 1 as January starts at 0
    var day = d.getDate();
    var year = d.getFullYear();
    //appending 0 for single digit date ad month
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    var dateID = $(":input[title='" + field + "']").attr("id");
    var dateHours = $(":input[id='" + dateID + "Hours" + "']").val();
    var Meri = dateHours.split(' ')[1];
    dateHours = dateHours.split(' ')[0];
    //converting it into 24 hour format
    if (Meri == "PM" && dateHours < 12)
        dateHours = parseInt(dateHours) + 12;
    else if (Meri == "AM" && dateHours == 12)
        dateHours = parseInt(dateHours) - 12;
    var dateMinutes = $(":input[id='" + dateID + "Minutes" + "']").val();
    var requiredDate = new Date(year, month - 1, day, dateHours, dateMinutes, 0);
    return requiredDate;
}