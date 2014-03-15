var UserLogin = {
    checkUserLogin: function() {
        // var user = annotationProxy.getLoggedInInfo();
        // alert("THIS is: " + user.dislayName + " with email: " + user.eMail);
        var user = false;

        if (user !== false) {
            value = "You are logged in as " + user.dislayName + ".";
            var loginInfo = document.getElementById("loginInfo");
            var newLabel = document.createElement("label");
            newLabel.setAttribute("value", value);
            newLabel.setAttribute("class", "loggedIn");
            loginInfo.appendChild(newLabel);
        } else {
            value = "Please sign in to the DASISH annotation server.";
            var loginInfo = document.getElementById("loginInfo");
            var newLabel = document.createElement("label");
            newLabel.setAttribute("value", value);
            newLabel.setAttribute("class", "loginLabel");

            newLabel.setAttribute("onclick", "UserLogin.openPopup()");


            loginInfo.appendChild(newLabel);
        }
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

