"use strict";
window.helpbox = window.helpbox || {};

helpbox.layout = {
    toggleVisibility: function () {
        document.getElementById("chatbox").classList.toggle("hidden");
        document.getElementById("popup").classList.toggle("hidden");
    },

};

helpbox.ajax = {
    populateWithVideo: function () {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let resp = this.responseText;
                let doc = document.getElementById("main");
                var helpboxHTML = document.createElement('div');
                helpboxHTML.setAttribute('name', "help-box");
                helpboxHTML.setAttribute('id', 'helpbox-container');
                helpboxHTML.innerHTML = resp;
                doc.appendChild(helpboxHTML);
            }
        };
        xhttp.open("GET", "helpbox.html", true);
        xhttp.send();
    }
};

helpbox.pop = function () {
    helpbox.ajax.populateWithVideo();
};

helpbox.init = function () {
    helpbox.ajax.populateWithVideo();
    document.addEventListener('click', function (e) {
        if (e.target && e.target.id == "chatbox" || e.target.id == "close-popup") {
            helpbox.layout.toggleVisibility();
        }
    });

};


var funcCalled = 0;
(function () {
    if (document.addEventListener) {
        document.addEventListener("DOMContentLoaded", function () {
            helpbox.init();
        }, !1);
    } else {
        if (document.all && !window.opera) {
            document.write('<script type="text/javascript" id="contentLoadTest" defer="defer" src="javascript:void(0)"><\/script>'), document.getElementById("contentLoadTest").onreadystatechange = function () {
                "complete" == this.readyState && helpbox.init();
            }
        } else {
            if (/Safari/i.test(navigator.userAgent)) {
                var a = setInterval(function () {
                    /loaded|complete/.test(document.readyState) && (clearInterval(a), helpbox.init())
                }, 10)
            } else {
                window.onload = function () {
                    setTimeout("if (!funcCalled) helpbox.init()", 0);
                };
            }
        }
    }
    return;
})();