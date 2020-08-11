import { LitElement, html } from 'lit-element';
import './ss-section-printer-status.scss';
import SSLoader from "../lit-components/loader";


class SsSectionPrinterStatus extends LitElement {
    static get properties() {
        return {
        };
    }

    constructor() {
        super();

    }

    render() {
        return html`            
            <ss-remote-video-viewer></ss-remote-video-viewer>
            <div class="buttons-wrapper hidden">
                <button class="button-error pure-button">Interrompi stampa</button>
            </div>
        `;
    }

    createRenderRoot() {
        return this;
    }

    connectedCallback() {
        super.connectedCallback()


        setTimeout(() => {
            let w = SSLoader.Show($(this));
            $(this).find("ss-remote-video-viewer").on("ConnectionSuccess", () => {
                w.Destroy();
                $(this).find(".buttons-wrapper").removeClass("hidden");
            })
        },500);
    }
}

customElements.define('ss-section-printer-status', SsSectionPrinterStatus);

