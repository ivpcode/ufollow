import { LitElement, html } from 'lit-element';
import "./loader.scss";
import $ from "jquery";

class SSLoader extends LitElement {
    static get properties() {
        return {

        };
    }

    constructor() {
        super();
    }

    render() {
        return html`
            <div class="boxes">
                <div class="box">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
                <div class="box">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
                <div class="box">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
                <div class="box">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div>            
        `;
    }

    createRenderRoot() {
        return this;
    }

    static Show(jqContainer) {
        if (jqContainer == null)
            jqContainer = $("body");

        $("ss-loader").remove();
        let loader = $("<ss-loader>");
        jqContainer.prepend(loader);

        return loader[0];
    }

    Destroy() {
        $(this).remove();
    }
}

customElements.define('ss-loader', SSLoader);

export default SSLoader;