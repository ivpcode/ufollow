import $ from "jquery";

import './libs/router';

import './ui-components/loader';
import './ui-components/post';
import './ui-components/image-uploader';

import IVPCtxMenu from "./ui-components/context-menu";

import './ui-components/main-menu';
import './ui-dialogs/ss-dialog-yes-no';


import "./ui-sections/section-home";
import "./ui-sections/section-edit-post";



$(document).ready(()=>{
    $("body").removeClass("hidden");
    return;
   let SKEY = localStorage.getItem("SKEY");
   if (SKEY != null && SKEY!=""){
       DoIO("/api/v1/init",{})
           .done(()=>{
               $("body").removeClass("hidden");
           })
           .fail(()=>{
               localStorage.setItem("SKEY","");
               window.location.href = "/login.html";
           })
   }
   else
       window.location.href = "/login.html";
});

$(document).ready(()=>{

});



function DoIO(Method, Data, _Timeout, PercentCallBack) {
    if (_Timeout == null)
        _Timeout = 20000;

    $.ajaxSetup({ timeout: _Timeout });
    $.ajaxSetup({ cache: false });

    var DeferredOp = $.Deferred();

    // codifica tutti i parametri
    var _Data = {};
    if (Data == null)
        Data = {};

    $.each(Data, function (index, value) {
        if (value != null && typeof value != 'undefined')
            _Data[index] = encodeURIComponent(value);
    });
    let SKEY = localStorage.getItem("SKEY");
    $.ajax({
        xhr: function () {
            // Usato questo trick per avere il progress (percentuale) di caricamento
            var xhr = new window.XMLHttpRequest();
            if (PercentCallBack != null) {
                xhr.upload.addEventListener("progress", function (evt) {
                    if (evt.lengthComputable) {
                        var percentComplete = (evt.loaded / evt.total);
                        PercentCallBack(percentComplete);
                    }
                }, false);
            }
            return xhr;
        },
        url: "https://www.ufollow.it"+Method,
        method: "post",
        data: _Data,
        timeout: _Timeout,
        dataType: "json",
        cache: false,
        beforeSend: (request) => {
            request.setRequestHeader("Authorization", "Bearer " + SKEY);
        },
    })
        .done((result, textStatus, jqXHR) => {
            DeferredOp.resolve(result);
        })
        .fail((jqXHR, textStatus, errorThrown) => {
            DeferredOp.reject(errorThrown, jqXHR.status, jqXHR);
            console.error("DataProvider.DoIO - failed - Method: " + Method + " - Error: " + errorThrown);
        });

    return DeferredOp;
}
window.DoIO = DoIO;