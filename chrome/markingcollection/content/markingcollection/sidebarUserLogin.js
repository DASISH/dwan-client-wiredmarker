var UserLogin = {
    checkUserLogin: function() {
        var user = annotationProxy.getLoggedInInfo(function(result) {
            // TODO: Do we need to refine the status code checks?

            // user is logged in
            if (result.status === 200) {

                /*
                 value = "You are logged in as " + user.dislayName + ".";
                 var loginInfo = document.getElementById("loginInfo");
                 var newLabel = document.createElement("label");
                 newLabel.setAttribute("value", value);
                 newLabel.setAttribute("id", "loggedIn");
                 loginInfo.appendChild(newLabel);
                 */
                var loginStatus = document.getElementById("loginStatus");
                loginStatus.setAttribute("class", "loggedIn");
                loginStatus.setAttribute("value", result.user.dislayName);

                // Hide login button
                document.getElementById("loginButton").hidden = true;
                document.getElementById("logoutButton").hidden = false;



                // user is not logged in
            } else if (result.status === 401) {
                document.getElementById("loginButton").hidden = false;
                document.getElementById("logoutButton").hidden = true;

                // Label element with status information
                var loginStatus = document.getElementById("loginStatus");
                var value = "Please sign in to the DASISH annotation server.";
                loginStatus.setAttribute("value", value);
                loginStatus.setAttribute("class", "notLoggedIn");
                // TODO: Flexible width style or other solution?
                loginStatus.setAttribute("width", "300");

                // Button for login into backend
                var loginButton = document.getElementById("loginButton");
                loginButton.setAttribute("label", "Login");
                loginButton.setAttribute("class", "loginButton");
                loginButton.setAttribute("width", "300");

            } else { // server connection timeout, server error 500+, or other
                document.getElementById("loginButton").hidden = false;
                document.getElementById("logoutButton").hidden = true;

                // Label element with status information
                var loginStatus = document.getElementById("loginStatus");
                var value = "Please sign in to the DASISH annotation server.";
                loginStatus.setAttribute("value", value);
                loginStatus.setAttribute("class", "notLoggedIn");
                // TODO: Flexible width style or other solution?
                loginStatus.setAttribute("width", "300");

                // Button for login into backend
                var loginButton = document.getElementById("loginButton");
                loginButton.setAttribute("label", "Login");
                loginButton.setAttribute("class", "loginButton");
                loginButton.setAttribute("width", "300");
                // TODO: Refine alert. Maybe some type of XUL window? Should the server admin mail address be given?
                alert("There might be some trouble with the server connection for " + annotationFramework.getBackend() + ". Please try again later or ask your server administrator for assistance.");
            }
        });
    },
    openPopup: function() {
        var target = document.getElementById("loginInfo"); // description element id in sidebar.xul
        var wURL = annotationFramework.getBackend() + "/api/authentication/login";
        $(target).popupWindow({
            windowURL: wURL,
            windowName: 'DWAN Login Window',
            height: 550,
            width: 640,
            scrollbars: 1,
            resizable: 1,
            centerScreen: 1,
            location: 1,
            status: 1,
            menubar: 1,
            toolbar: 1
        });
    }
};