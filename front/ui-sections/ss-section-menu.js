import { LitElement, html, css } from 'lit-element';
import "./ss-section-menu.scss";
import $ from "jquery";
import designer_tools from "../images/flat-icons/SVG/designer-tools.svg";
import printer from "../images/flat-icons/SVG/3d-printer.svg";
import gcode from "../images/flat-icons/SVG/3d-programming.svg";
import history from "../images/flat-icons/SVG/project-processing.svg";

class SsSectionMenu extends LitElement {
    static get properties() {
        return {

        };
    }

    constructor() {
        super();

    }

    render() {
        return html`
            <div class="pure-g">
                <div class="pure-u-1-1 pure-u-sm-1-2 pure-u-md-1-3 pure-u-lg-1-4 pure-u-xl-1-6" >
                    <a class="choice" @click=${this.OnClickItem} href="/models">
                        <img src="${designer_tools}" />
                        <p>Elenco Modelli</p>
                    </a>                    
                </div>
                <div class="pure-u-1-1 pure-u-sm-1-2 pure-u-md-1-3 pure-u-lg-1-4 pure-u-xl-1-6">
                    <a class="choice" @click=${this.OnClickItem} href="/printer/status">
                        <img src="${printer}" />
                        <p>Gestione Stampante</p>
                    </a>                    
                </div>
                <div class="pure-u-1-1 pure-u-sm-1-2 pure-u-md-1-3 pure-u-lg-1-4 pure-u-xl-1-6">
                    <a class="choice" @click=${this.OnClickItem}  href="/gcode/view">
                        <img src="${gcode}" />
                        <p>Visualizzatore G-Code</p>
                    </a>                    
                </div>          
                <div class="pure-u-1-1 pure-u-sm-1-2 pure-u-md-1-3 pure-u-lg-1-4 pure-u-xl-1-6">
                    <a class="choice" @click=${this.OnClickItem} >
                        <img src="${history}" />
                        <p>Storico stampe</p>
                    </a>                    
                </div>                         
            </div>
        `;
    }

    createRenderRoot() {
        return this;
    }

    connectedCallback() {
        super.connectedCallback()

        $("body ss-loader").remove();
    }

    OnClickItem(evt) {
        let url = $(evt.currentTarget).attr('href');
        window.router.navigate(url);
        evt.preventDefault();
    }
}

customElements.define('ss-section-menu', SsSectionMenu);