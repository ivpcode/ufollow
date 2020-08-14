import { LitElement, html } from 'lit-element';
import "./context-menu.scss";
import $ from "jquery";

class IVPCtxMenu extends LitElement {
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
                ${this.items.map((i) => {
                    if (i.Name == "separator")
                        return html`<li class="separator"><div class="line"></div></li>`
                    else
                        return html`<li name="${i.Name}" @click=${this.OnClickItem}>${i.Text}</li>`
                })}
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
        $("ivp-ctx-menu").remove();
    }

    OnClickItem(evt) {
        let ItemName = $(evt.target).attr("name");
        let myEvent = new CustomEvent('item-selected', { detail: ItemName, bubbles: true, composed: true });
        this.dispatchEvent(myEvent);
    }

    static Show(jqParent,vItems,ItemSelectCallback) {
        let isSon = jqParent.find("ivp-ctx-menu").length>0;
        $("ivp-ctx-menu").remove();
        if (isSon == true)
            return;

        jqParent.css("position","relative");
        let ctx = $("<ivp-ctx-menu>");
        ctx.on("item-selected",function(evt){ ItemSelectCallback(evt.detail); });
        ctx.attr("items",JSON.stringify((vItems)));
        jqParent.append(ctx)
    }
}

customElements.define('ivp-ctx-menu', IVPCtxMenu);

export default IVPCtxMenu;
