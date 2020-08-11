import $ from "jquery";

import './libs/router';

import './ui-components/loader';
import './ui-components/post';
import IVPCtxMenu from "./ui-components/context-menu";

import './ui-components/main-menu';
import './ui-dialogs/ss-dialog-yes-no';


// import "./ui-sections/ss-section-menu";
// import "./ui-sections/ss-section-designs";
// import "./ui-sections/ss-section-gcode-viewer";
// import './ui-sections/ss-section-printer-status';



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

window.router = new SSRouter({
    mode: 'history',
    root: '/'
});

window.router

    .add(/models/, () => {
        $("#CONTENT").html("<ss-section-designs>");
        $("#SECTION_TITLE").text("Elenco modelli");
        $("#SECTION_SUB_TITLE").text("Carica o modifica i modelli in archivio");

    })
    .add(/printer\/status/, (id) => {
        $("#CONTENT").html("<ss-section-printer-status>");
        $("#SECTION_TITLE").text("Stato stampante");
        $("#SECTION_SUB_TITLE").text("Carica o modifica i modelli in archivio");
    })
    .add(/gcode\/view/, () => {
        $("#CONTENT").html("<ss-section-gcode-viewer>");
        $("#SECTION_TITLE").text("Visualizzatore di GCode");
        $("#SECTION_SUB_TITLE").text("Incolla il codice GCode e visualizzalo in 3D");
    })

    .add(/delete\/(.*)/, (id) => {
        SsDialogYesNo.Show("Test yes no",()=>{ });
    })

    .add(/view/, (id) => {
        let view = $("<ss-stl-viewer>");
        $("body").append(view);
    })

    .add('', () => {

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