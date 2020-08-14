import { LitElement, html } from 'lit-element';
import "./section-home.scss";
import Types from "../libs/types";
import IVPLoader from "../ui-components/loader";
import $ from "jquery";

class SectionHome extends LitElement {
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
        if (this.status == "LOADING")
            return html``;

        return html`
            <div class="section-header">
                <div class="tab-menu">
                    <div class="active">HOME</div>
                </div>
                <div><svg class="lnr lnr-magnifier"><use xlink:href="#lnr-magnifier"></use></svg></div>
            </div>            
            <div class="pure-g">
                <div class="pure-u-1-1 pure-u-md-5-8">
                    <ivp-post
                        user_name="Prez Ivan"
                        user_url="/ivanprez"
                        user_thumbnail_url="https://pbs.twimg.com/profile_images/505025452327448576/ohWm7eK8_400x400.jpeg"
                        images='["https://www.touringclub.it/sites/default/files/styles/gallery_full/public/immagini_georiferite/anterselva.png?itok=YeJBCJnP"]'
                        publish_timestamp="2020-06-22T12:00:00Z"
                        likes_count="12"
                    ></ivp-post>
                </div>
                <div class="pure-u-1-1 pure-u-md-3-8">
    
                </div>
            </div>     
        `;
    }

    createRenderRoot() {
        return this;
    }

    connectedCallback() {
        super.connectedCallback()
        this.status = "LOADING";
        let w = IVPLoader.Show();
        let vDesigns = this.DataLoad()
            .done((vDesigns) => {
                this.status = "OK";
            })
            .fail(() => {
                this.status = "ERROR";
            })
            .always(()=>{
                setTimeout(()=>{w.Destroy();},50);
            });
    }



    DataLoad() {
        let d = $.Deferred();
        setTimeout(()=>{ d.resolve()},500);
        return d;
    }
}

customElements.define('section-home', SectionHome);

IVPRouter.Register("", () => {
    $("#CONTENT").html("<section-home  class='section'>");
})