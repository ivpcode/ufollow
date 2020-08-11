import { LitElement, html } from 'lit-element';
import './ss-dialog.scss';
import $ from "jquery";

class SsDialogYesNo extends LitElement {
    static get properties() {
        return {
            message: { String },
            visible: { String }
        };
    }

    constructor() {
        super();
        this.message = "";
        this.visible = "";
        this.OnYesCallback = ()=>{}
    }

    render() {
        return html`
            <div class="modal ${this.visible}">
                <div class="modal-dialog">
                    <div class="modal-header">
                        <h2>Attenzione</h2>
                        <a href="#" @click="${this.OnClose}" class="btn-close close" aria-hidden="true">×</a>
                    </div>
                    <div class="modal-body">
                        Eliminare l'elemento selezionato?
                    </div>
                    <div class="modal-footer">
                        <a href="#" @click="${this.OnYes}" class="btn ok">Si</a>
                        <a href="#" @click="${this.OnClose}" class="btn close">No</a>
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
    }

    Close() {
        window.history.back();
        $(this).remove();
    }

    OnClose() {
        this.Close();
    }

    OnYes() {

        if (this.OnYesCallback != null)
            this.OnYesCallback();

        this.Close();
    }

    static Show(Message, fnYesCallBack) {
        let dlg = $("<ss-dialog-yes-no>");
        dlg.attr("message",Message);
        dlg[0].OnYesCallback = fnYesCallBack;
        $("body").append(dlg);
    }
}

customElements.define('ss-dialog-yes-no', SsDialogYesNo);

export default SsDialogYesNo;
window.SsDialogYesNo = SsDialogYesNo;