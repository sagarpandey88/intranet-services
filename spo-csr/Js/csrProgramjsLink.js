// Create a namespace for our functions so we don't collide with anything else 
var csrJsLink = csrJsLink || {};

// Create a function for customizing the Field Rendering of our fields 
csrJsLink.CustomizeFieldRendering = function () {
    var fieldJsLinkOverride = {};
    fieldJsLinkOverride.Templates = {};
    fieldJsLinkOverride.OnPreRender = function (ctx) {
        for (var x = 0; x < ctx.ListSchema.Field.length; x++) {
            ctx.ListSchema.Field[x].AllowGridEditing = false;
        }
    };
    fieldJsLinkOverride.Templates.Fields =
        {

            'Action':
                {
                    'View': csrJsLink.GetActionTemplate
                }
        };

    // Register the rendering template
    SPClientTemplates.TemplateManager.RegisterTemplateOverrides(fieldJsLinkOverride);
};

// Create a function for getting the Priority Field Icon value (called from the first method) 
csrJsLink.GetActionTemplate = function (ctx) {

    var action = ctx.CurrentItem.Action;
    var id = ctx.CurrentItem.ID;
    var action = "csrJsLink.redirectToManage(" + id + ")";

    var test = "<button type =button onclick=" + action + "> View</button >";
    return test;

};


csrJsLink.redirectToManage = function (id) {

    window.location = CSRUtility.ViewProgramDetailsServerRelativeUrl + "?progId=" + id;
    return false;
}


SP.SOD.executeFunc("clienttemplates.js", "SPClientTemplates", function () {

    csrJsLink.CustomizeFieldRendering();

})
