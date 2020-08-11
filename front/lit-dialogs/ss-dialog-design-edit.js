import { LitElement, html } from 'lit-element';
import './ss-dialog.scss';
import './ss-dialog-design-edit.scss';
import SSLoader from '../lit-components/loader';
import $ from "jquery";

class SsDialogEditDesign extends LitElement {
    static get properties() {
        return {
            message: { String },
            visible: { String },
            design: { Object },
        };
    }

    constructor() {
        super();
        this.message = "";
        this.visible = "";
        this.OnSaveCallback = ()=>{ let d=$.Deferred(); d.resolve(); return d;}
        this.LoadedSTLData = null;
        this.STLUploadToken = null;
    }

    render() {
        return html`
            <div class="modal ${this.visible}">
                <div class="modal-dialog">
                    <div class="modal-header">
                        <h2>Modifica modello</h2>
                        <a href="#" @click="${this.OnClose}" class="btn-close close" aria-hidden="true">×</a>
                    </div>
                    <div class="modal-body">
                        <form class="pure-form pure-form-aligned">
                            <fieldset>
                                <div class="pure-control-group">
                                    <label for="aligned-name">Titolo del Modello</label>
                                    <input type="text" name="Title" placeholder="Title" value="${this.design.Title}" class="pure-input-1-2"/>
                                    <span class="pure-form-message-inline">Questo campo è obbligatorio.</span>
                                </div>
                                <div class="pure-control-group">
                                    <div class="stl-contanier" >
                                        <div @click="${this.OnUploadSTL}">
                                            <a href="#" @click="${this.OnUploadSTL}">Clicca qui per caricare un file STL</a>
                                        </div>                                        
                                    </div>
                                </div>
                            </fieldset>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <a href="#" @click="${this.Close}" class="pure-button close">Annulla</a>
                        <a href="#" @click="${this.OnSave}" class="pure-button pure-button-primary ok">Salva</a>                        
                    </div>
                </div>
            </div>
        `;
    }

    createRenderRoot() {
        return this;
    }

    connectedCallback() {
        super.connectedCallback()
        setTimeout(()=>{this.visible = "visible";},20);

        window.router.push();
        $(window).one('popstate',() => { this.OnBack() });

        if (this.design != null && Types.ToString(this.design.StlURL)!="") {
            let viewer = $("<ss-stl-viewer>");
            viewer.attr("stl_url",this.design.StlURL);
            setTimeout(()=>{
                $(this).find(".stl-contanier").append(viewer);
            },100);
        }
    }

    SetIfChanged(oData, FieldName, NewValue, oInitial) {
        if (NewValue != oInitial[FieldName])
            oData[FieldName] = NewValue;
    }

    OnBack() {
        $(this).remove();
    }

    Close() {
        window.history.back();
    }

    OnSave(evt) {
        evt.preventDefault();
        let ModifiedData = { };

        this.SetIfChanged(ModifiedData,"Title", $(this).find("[name='Title']").val(), this.design);
        this.SetIfChanged(ModifiedData,"STLUploadToken", this.STLUploadToken, this.design);

        if (Object.keys(ModifiedData).length > 0) {
            ModifiedData.ID = this.design.ID;

            let loader = SSLoader.Show($(this).find(".modal-dialog"));
            this.OnSaveCallback(ModifiedData)
                .done(() => {
                    this.Close();
                })
                .fail(() => {
                    console.error("Errore nel salvataggio dei dati");
                })
                .always(()=> {
                    loader.Destroy();
                })
        }
        else
            this.Close();
    }

    OnUploadSTL(evt) {
        evt.preventDefault();

        let ctlFile = $("<input type='file' style='display:none' />");
        $("body").append(ctlFile);
        ctlFile.click();
        ctlFile.on('change',()=>{
            this.LoadedSTLData = ctlFile[0].files[0];

            this.LoadedSTLData.arrayBuffer().then((buffer) => {
                let viewer = $("<ss-stl-viewer>");
                viewer[0].STLData = buffer;
                $(this).find(".stl-contanier").append(viewer);
            });

        });

        // function DoUpload() {
        //
        //     var Blob = $('#file')[0].files[0];
        //
        //     $.post(SERVER + "/api/webinar/GetUploadAuth",
        //         { ContentType: Blob.type, Size: Blob.size })
        //         .done(function (Data) {
        //
        //             var Params = {};
        //             Params.UploadURL = Data.UploadURL;
        //             Params.UploadToken = Data.Token;
        //             Params.Headers = {
        //                 Authorization: "Bearer " + Data.Token,
        //                 XAmzContentSHA256: "",
        //                 XAmzDate: "",
        //             };
        //
        //             var Uploader = new BlobUploader(Params, $('#file')[0].files[0]);
        //
        //             Uploader.on("progress", function (ProgressPercent, UploadedAmount, TotalAmount) {
        //                 $('#progress').attr('max', TotalAmount);
        //                 $('#progress').attr('value', UploadedAmount);
        //                 $("#UPLOAD_STATS").show();
        //                 $("#UPLOADED_AMOUNT").text(Uploader.FormatMediaSize(UploadedAmount) + " (" + parseInt(progress.toFixed(2) * 100) + "%)");
        //                 $("#FILE_SIZE").text(Uploader.FormatMediaSize(TotalAmount));
        //             });
        //
        //             Uploader.Start()
        //                 .done(function (UploadToken) {
        //                     FinalizeUpload(UploadToken);
        //                 })
        //                 .fail(function (ErrorMessage) {
        //                     alert(ErrorMessage);
        //                 })
        //                 .always(function () {
        //                     $("#UPLOAD_STATS").hide();
        //                 });
        //         });
        // }
        //
        //
        // function FinalizeUpload(UploadToken) {
        //     $.post(SERVER + "/api/imageprocessor/upload_finalize",
        //         {
        //             "API_KEY": "efg24fsfgweg",
        //             "UploadToken": UploadToken,
        //             "OriginalKey": "original/CID002A2D/post/PID000001/cover.jpg",
        //             "CropData": JSON.stringify({ Key: "public/CID002A2D/post/PID000001/cover.jpg", X: 10, Y: 10, W: 2000, H: 1000, Quality: 95 }),
        //             "ResizeData": JSON.stringify({ Key: "public/CID002A2D/post/PID000001/lr/cover.jpg", W: 640, Quality: 95 }),
        //         })
        //         .done(function (Data) {
        //             $("#ORIGINAL").attr("src", Data.OriginalURL);
        //             $("#CROPPED").attr("src", Data.CroppedURL);
        //             $("#RESIZED").attr("src", Data.ResizedURL);
        //
        //             $("#IMAGE_CONTAINER").show();
        //             $("#ORIGINAL").show();
        //             $("#CROPPED").show();
        //             $("#RESIZED").show();
        //         });
        // }
    }

    static Show(oData, fnSaveCallBack) {
        let dlg = $("<ss-dialog-edit-design>");
        dlg[0].OnSaveCallback = fnSaveCallBack;
        dlg[0].design = oData;

        $("body").append(dlg);
    }
}

customElements.define('ss-dialog-edit-design', SsDialogEditDesign);

export default SsDialogEditDesign;
window.SsDialogEditDesign = SsDialogEditDesign;
