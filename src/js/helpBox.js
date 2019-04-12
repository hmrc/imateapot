"use strict";
var showMain = function() {
    document.getElementById("chatbox").classList.toggle("hidden");
    document.getElementById("popup").classList.toggle("hidden");

};

var init = function() {
    document.getElementById("chatbox").addEventListener("click", showMain);
    document.getElementById("close-popup").addEventListener("click", showMain);
};

var funcCalled = 0;
(function () {
    if (document.addEventListener) {
        document.addEventListener("DOMContentLoaded", function () {
            init();
        }, !1);
    } else {
        if (document.all && !window.opera) {
            document.write('<script type="text/javascript" id="contentLoadTest" defer="defer" src="javascript:void(0)"><\/script>'), document.getElementById("contentLoadTest").onreadystatechange = function () {
                "complete" == this.readyState && init();
            }
        } else {
            if (/Safari/i.test(navigator.userAgent)) {
                var a = setInterval(function () {
                    /loaded|complete/.test(document.readyState) && (clearInterval(a), init())
                }, 10)
            } else {
                window.onload = function () {
                    setTimeout("if (!funcCalled) init()", 0);
                };
            }
        }
    }
    return;
})();