import $ from "jquery";

import './router';

import './lit-components/loader';
import SSCtxMenu from "./lit-components/ss-context-menu";
import './lit-components/ss-design-row';
import './lit-components/ss-stl-viewer';
import './lit-components/ss-remote-video-viewer';

import './lit-dialogs/ss-dialog-yes-no';
import './lit-dialogs/ss-dialog-design-edit';


import "./lit-sections/ss-section-menu";
import "./lit-sections/ss-section-designs";
import "./lit-sections/ss-section-gcode-viewer";
import './lit-sections/ss-section-printer-status';



$(document).ready(()=>{
   let SKEY = localStorage.getItem("SKEY");
   if (SKEY != null && SKEY!=""){
       DoIO("/api/solidshape/v1/init",{})
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
    $(".row1 .user").click((evt)=>{
        SSCtxMenu.Show($(evt.target).parent(),["Account", "Logout"], (item) => {
            if (item == "Account") {
            }
            else if (item == "Logout") {
                localStorage.setItem("SKEY","");
                window.location.href = "/login.html";
            }
        });
    });
});

window.router = new SSRouter({
    mode: 'history',
    root: '/'
});

window.router

    // .add(/models\/(.*)/, (id) => {
    //     alert(`models: ${id}`);
    // })
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
        $("#CONTENT").html("<ss-section-menu>")
        $("#SECTION_TITLE").text("Pannello di controllo");
        $("#SECTION_SUB_TITLE").text("Seleziona una funzionalità");
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
        url: "https://www.solidshape.it"+Method,
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