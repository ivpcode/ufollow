import { LitElement, html } from 'lit-element';
import "./image-uploader.scss";
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css'; // optional for styling

class IVPImageUploader extends LitElement {
    static get properties() {
        return {
            src: { type: String },
            status: { type: String },
            is_vertical: { type: Boolean }
        };
    }

    constructor() {
        super();
        this.src = "/images/missing_image_placeholder.svg";
        this.status = "UPLOADING";
        this.is_vertical = false;
    }

    render() {

        return html`
            ${this.status=="COMPLETE"?html`
                <a href="javascript:void" @click="${this.OnRemove}" data-tippy-content="Elimina l'immagine">
                    <svg class="lnr lnr-cross-circle"><use xlink:href="#lnr-cross-circle"></use></svg>
                </a>`:``}
            <img src="${this.src}" @load="${this.OnImageLoaded}" />
            ${this.status=="UPLOADING"?html`
                <div class="progress"></div>`:``}
        `;
    }

    createRenderRoot() {
        return this;
    }

    connectedCallback() {
        super.connectedCallback();
    }

    firstUpdated() {
        tippy("[data-tippy-content]");
        this.SetUploadPercent(0);
        let percent = 0;
        let hint = setInterval(()=>{
            percent += 5;
            this.SetUploadPercent(percent);
            if (percent >= 100) {
                clearInterval(hint);
            }
        },100)
    }

    disconnectedCallback() {

    }

    SetUploadPercent(Percent) {
        $(this).find(".progress").css("width",Percent+"%");
        if (Percent >= 100)
            this.status = "COMPLETE"
    }

    OnRemove() {
        setTimeout(()=>{ $(this).remove(); },10);
    }

    OnImageLoaded(evt) {
        let ratio = evt.currentTarget.naturalHeight / evt.currentTarget.naturalWidth;
        this.is_vertical = ratio > 1;
    }
}

customElements.define('ivp-image-uploader', IVPImageUploader);

export default IVPImageUploader;
