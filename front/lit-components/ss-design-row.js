import { LitElement, html } from 'lit-element';
import "./ss-design-row.scss";
import SSCtxMenu from "./ss-context-menu";
import $ from "jquery";
import img from "../images/menu-dots.svg";
import placeholder from "../images/placeholder.svg";
import Types from "../types";

class SSDesignElement extends LitElement {
    static get properties() {
        return {
            design_id: { type: String },
            image: { type: String },
            title: { type: String },
            prints_counts: { type: Number },
            date_creation: { type: Date },
            size: { type: Number },
        };
    }

    constructor() {
        super();
        this.design_id = "";
        this.image = "";
        this.title = "";
        this.prints_counts = 0;
        this.date_creation = null;
        this.size = 0;
        this.OnEdit = (obj)=> { };
        this.OnDelete = (obj)=> { };
        this.OnDuplicate = (obj)=> { };
    }

    render() {
        return html`
            <div class="thumbnail">
                <img src="${Types.ToString(this.image)==""? placeholder : this.image}">
            </div>
            <div class="title">
                <a @click=${this.OnClickItem} href="${this.design_id}" >${this.title}</a>
                <div>${this.prints_counts} Print Files</div>
            </div>
            <div class="date">
               ${Types.Timestamp.Prettify(this.date_creation)}
            </div>
            <div class="size">
                ${this.size}Kb
            </div>
            <div class="actions">
                <div>
                    <img src="${img}" height="4px" @click=${this.OnShowCtxMenu}/>
                </div>
            </div>     
        `;
    }

    createRenderRoot() {
        return this;
    }

    OnShowCtxMenu(evt) {
        console.log(evt)
        SSCtxMenu.Show($(evt.target).parent(),["Edit", "Duplicate", "Delete"], (item) => {
            if (item == "Edit")
                return this.OnEdit(this);
            else if (item == "Delete")
                return this.OnDelete(this);
            else if (item == "Delete")
                return this.OnDuplicate(this);
        });
    }

    OnClickItem(evt) {
        let id = $(evt.currentTarget).attr('href');
        this.OnEdit(this);
        evt.preventDefault();
    }
}

customElements.define('ss-design-element', SSDesignElement);