import { LitElement, html } from 'lit-element';
import "./ss-context-menu.scss";
import $ from "jquery";

class SSCtxMenu extends LitElement {
    static get properties() {
        return {
            items: { type: Array },
        };
    }

    constructor() {
        super();
        this.items = [ ];
    }

    render() {
        return html`
            <ul>
                ${this.items.map(i => html`<li name="${i}" @click=${this.OnClickItem}>${i}</li>`)}
            </ul>         
        `;
    }

    createRenderRoot() {
        return this;
    }

    connectedCallback() {
        super.connectedCallback()
        setTimeout(()=> {
            $("body").click(this.OnClickOutside);
        },100);
    }

    disconnectedCallback() {
        $("body").unbind("click",this.OnClickOutside);
    }

    OnClickOutside() {
        $("body").unbind("click",this.OnClickOutside);
        $("ss-ctx-menu").remove();
    }

    OnClickItem(evt) {
        let ItemName = $(evt.target).attr("name");
        let myEvent = new CustomEvent('item-selected', { detail: ItemName, bubbles: true, composed: true });
        this.dispatchEvent(myEvent);
    }

    static Show(jqParent,vItems,ItemSelectCallback) {
        let isSon = jqParent.find("ss-ctx-menu").length>0;
        $("ss-ctx-menu").remove();
        if (isSon == true)
            return;

        jqParent.css("position","relative");
        let ctx = $("<ss-ctx-menu>");
        ctx.on("item-selected",function(evt){ ItemSelectCallback(evt.detail); });
        ctx.attr("items",JSON.stringify((vItems)));
        jqParent.append(ctx)
    }
}

customElements.define('ss-ctx-menu', SSCtxMenu);

export default SSCtxMenu;
