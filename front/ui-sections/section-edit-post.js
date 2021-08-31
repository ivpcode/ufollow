import { LitElement, html } from 'lit-element';
import "./section-edit-post.scss";

import MediumEditor from "medium-editor"
import "../node_modules/medium-editor/dist/css/medium-editor.min.css";
import "../node_modules/medium-editor/dist/css/themes/default.min.css";
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css'; // optional for styling
import sanitizeHtml from "sanitize-html"

import IVPLoader from "../ui-components/loader";
import IVPImageUploader from "../ui-components/image-uploader";
import {Sortable} from "@shopify/draggable";



class SectionEditPost extends LitElement {
    static get properties() {
        return {
            status: { String },
        };
    }

    constructor() {
        super();
        this.jqContainer = $("");
        this.Editor = null;
        this.hUpdateMedia = null;
    }

    render() {
        if (this.status == "LOADING")
            return html``;

        return html`
            <div class="section-header">
                <a class="navigation-title" href="javascript:void(0)" onclick="window.router.back();">
                    <svg class="lnr lnr-arrow-left"><use xlink:href="#lnr-arrow-left"></use></svg>
                    <span>NUOVO POST</span>
                </a>
                <div>
                    <button class="pure-button pure-button-primary">Pubblica</button>
                </div>
            </div>            
            <div class="media hidden">  
                <a class="add-media" href="#" @click="${this.AddImages}">+</a>
                <input type="file" multiple style="display:none" accept="image/*"/>
            </div>
            <div class="text">
                <div placeholder="Scrivi qualcosa" class="editor"></div>
            </div>     
            <div class="actions">
                <a href="#" @click="${this.AddImages}" data-tippy-content="Aggiungi Immagine"><svg class="lnr lnr-picture"><use xlink:href="#lnr-picture"></use></svg></a>
                <a href="#" @click="${this.AddVideo}" data-tippy-content="Aggiungi Video"><svg class="lnr lnr-film-play"><use xlink:href="#lnr-film-play"></use></svg></a>
                <a href="#" @click="${this.RecordVideo}" data-tippy-content="Registra ed aggiungi video"><svg class="lnr lnr-camera-video"><use xlink:href="#lnr-camera-video"></use></svg></a>                                
            </div>       
            <div class="preview">
                <ivp-post mode="PREVIEW"></ivp-post>
            </div>                
        `;
    }

    createRenderRoot() {
        return this;
    }

    connectedCallback() {
        super.connectedCallback()
    }

    firstUpdated() {
        super.firstUpdated()
        this.Editor = new MediumEditor(".editor",{
            placeholder: {
                text: 'Scrivi qui il testo del tuo post',
                hideOnClick: true
            },
            toolbar: {
                buttons: ['bold', 'italic', 'underline', 'anchor'],
            }
        });

        let ht = null;
        this.Editor.subscribe('editableInput',  (event, editable) => {
            // Do some work
            clearTimeout(ht);
            ht = setTimeout(()=>{
                this.PreviewUpdateText();
            },800);
        });

        tippy("[data-tippy-content]");

        const sortable = new Sortable($(this).find(".media")[0], {
            draggable: 'ivp-image-uploader',
        });

        sortable.on('sortable:sorted', () => {
            clearTimeout(this.hUpdateMedia);
            this.hUpdateMedia = setTimeout(()=>{
                this.PreviewUpdateMedia();
            },500);

		});
		
		setTimeout(()=>{
			this.Editor.selectElement(document.querySelector('.medium-editor-element'))
		},500)
    }

    PreviewUpdateText() {
        let text = this.Editor.getContent();
        text = text.replace(/<p>/g,"");
        text = text.replace(/<\/p>/g,"<br>");
        text = text.trim();
        text = text.substring(0,text.length-4); // rimuove il <br> alla fine
        text = sanitizeHtml(text, {
            allowedTags: [ 'b', 'i', 'em', 'strong', 'u', 'a',  'br' ],
            allowedAttributes: {
                'a': [ 'href' ]
            },
        });

        console.log(text);
        $(this).find(".preview ivp-post").attr("text",text);
    }

    PreviewUpdateMedia() {
        let vImages = [];
        $(this).find(".media ivp-image-uploader").each((i,el)=>{
            if ($(el).hasClass("draggable-mirror") == false &&
                $(el).hasClass("draggable--original") == false )
                vImages.push(el.src);
        })
        $(this).find("ivp-post")[0].images =vImages;
    }

    AddImages() {
        let input = $(this).find(".media input");
        input.attr("multiple","true");
        input.attr("accept","image/*");
        input.off().on("change",(event)=>{
           let files = event.target.files;
           for(let i=0;i<files.length;i++) {
               let reader = new FileReader();

               let img = new IVPImageUploader();
               reader.onload = (evt) => {
                   img.src = evt.target.result;
                   $(img).attr("src",evt.target.result);
                   $(this).find(".media .add-media").before(img);
                   $(this).find(".media").removeClass("hidden");

                   this.PreviewUpdateMedia();
               };
               reader.readAsDataURL(files[i]);
           }
        });
        input.click();
    }

    AddVideo() {
        let input = $(this).find(".media input");
        input.removeAttr("multiple","true");
        input.attr("accept","video/*");
        input.off().on("change",(event)=>{
            let file = event.target.files[0];
            let fileUrl = window.URL.createObjectURL(file);
        });
        input.click();
    }

    RecordVideo() {

    }
}

customElements.define('section-edit-post', SectionEditPost);

IVPRouter.Register(/posts\/new/, () => {
    $("#CONTENT").html("<section-edit-post class='section'></section-edit-post>");
})
