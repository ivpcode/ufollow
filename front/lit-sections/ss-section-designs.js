import { LitElement, html } from 'lit-element';
import "./ss-section-designs.scss";
import $ from "jquery";
import EmptyFolder from '../images/empty-folder.svg';
import ErrorFolder from '../images/error-folder.svg';
import Types from "../types";
import SSLoader from "../lit-components/loader";

class SsSectionDesigns extends LitElement {
    static get properties() {
        return {
            status: { String },
        };
    }

    constructor() {
        super();
        this.jqContainer = $("");
    }

    render() {
        return html`
            <div class="row-container">SsDialogEditDesign
                <div class="stl-header-row">
                    <div>Nome File <i class="icon-up-open"></i></div>
                    <div></div>
                    <div>Data Creazione</div>
                    <div>Dimensioni</div>
                    <div><button class="pure-button" @click="${this.OnNew}">Nuovo</button></div>
                </div>
            </div>
            ${this.status=='EMPTY' ? html`
                <div class="placeholder empty">
                    <img src="${EmptyFolder}" />
                    <h3>Non hai modelli in archivio</h3>
                    <a class="pure-button pure-button-primary outline" @click="${this.OnNew}">Creane uno ora</a>
                </div>`:``}
            ${this.status=='ERROR' ? html`
                <div class="placeholder error">
                    <img src="${ErrorFolder}" />
                    <h3>Non sono riuscito a caricare i modelli dall'archivio</h3>
                    <a class="pure-button pure-button-primary outline" @click="${this.connectedCallback}">Riprova</a>
                </div>`:``}            
        `;
    }

    createRenderRoot() {
        return this;
    }

    connectedCallback() {
        super.connectedCallback()
        this.status = "OK";
        let w = SSLoader.Show();
        let vDesigns = this.DataLoad()
            .done((vDesigns) => {
                this.jqContainer = $(this).find(".row-container");
                if (vDesigns.length == 0) {
                    this.status = "EMPTY";
                    return;
                }
                for (let i = 0; i < vDesigns.length; i++) {
                    let el = this.CreateOrUpdateElement(vDesigns[i]);
                    el[0].OnEdit = (obj) => {
                        this.DataEdit(obj.design_id);
                    };
                    el[0].OnDelete = (obj) => {
                        alert("OnDelete " + obj.design_id);
                    }
                    el[0].OnDuplicate = (obj) => {
                        alert("OnDuplicate " + obj.design_id);
                    }
                }
            })
            .fail(() => {
                this.status = "ERROR";
            })
            .always(()=>{
                setTimeout(()=>{w.Destroy();},50);
            });
    }

    CreateOrUpdateElement(oData) {
        let jqEl = $(this).find("[design_id='"+oData.ID+"']");
        if (jqEl.length == 0) {
            jqEl = $("<ss-design-element>");
            this.jqContainer.append(jqEl);
        }

        jqEl.attr("design_id",oData.ID);
        jqEl.attr("image",Types.ToString(oData.ImageURL));
        jqEl.attr("title",oData.Title);
        jqEl.attr("prints_counts",oData.PrintsCount);
        jqEl.attr("date_creation",oData.CreationDateTime);
        jqEl.attr("size",oData.Size);

        return jqEl;
    }

    OnNew() {
        this.DataEdit(-1);
    }

    DataLoad() {
        return DoIO("/api/solidshape/v1/designs/list",{});
    }

    DataEdit(DesignID) {
        let w = SSLoader.Show();
        DoIO("/api/solidshape/v1/designs/get", {"ID": DesignID})
            .done((oDesign) => {
                SsDialogEditDesign.Show(oDesign, (oEditedDesign) => {
                    // Filla i campi da salvare per l'edited design
                    let d = DoIO("/api/solidshape/v1/designs/save", oEditedDesign);
                    d.done((oSaved) => {
                        this.CreateOrUpdateElement(oSaved);
                    })
                    return d;
                });
            })
            .always(()=>{ w.Destroy() });

    }

}

customElements.define('ss-section-designs', SsSectionDesigns);