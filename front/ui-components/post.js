import {html, LitElement} from "lit-element";
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js'

import Types from "../libs/types"
import IVPCtxMenu from "./context-menu";

import "./post.scss"

class IVPPost extends LitElement {
    static get properties() {
        return {
            user_name: { type: String },
            user_url: { type: String },
            user_thumbnail_url: { type: String },
            text: { type: String },
            images: { type: Array },
            publish_timestamp: { type: String },
            likes_count: { type: Number },
            mode: { type: String },
            CurrentMediaIndex: { type: Number }
        };
    }

    constructor() {
        super();

        this.user_name = "User Name";
        this.user_url = "@user_url";
        this.user_thumbnail_url = "/images/missing_image_placeholder.svg";
        this.text = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book."
        this.images = ["/images/missing_image_placeholder.svg"];
        this.publish_timestamp = new Date();
        this.likes_count = 0;

        this.ImageContainerWidth = 600;
        this.mode = "";
        this.CurrentMediaIndex = 0;
    }

    render() {
        let path = window.location.pathname;

        let LikesLabel = "";
        if (this.likes_count>0)
            LikesLabel = `${this.likes_count} mi piace`;

        let Text = html`${unsafeHTML(this.text)}`;
        let content = html`
            <div class="head">
                <div class="user-data">
                    <div class="thumbnail-container" style="background-image: url(${this.user_thumbnail_url})"></div>
                    <div>
                        <a class="user-name" href="${this.user_url}">${this.user_name}</a>
                        <a class="user-url" href="${this.user_url}">${this.user_url}</a>
                    </div>
                </div>
                ${this.mode=="PREVIEW"?``:html`
                <div class="menu">
                    <span>${Types.Timestamp.Prettify(new Date(this.publish_timestamp))}</span>
                    <!-- img src="/images/context_menu.svg"-->
                    <div class="context-menu-icon">
                        <div @click="${this.OnContextMenu}">
                            <div></div><div></div><div></div>
                        </div>
                    </div>                  
                </div>`}
            </div> 
            <div class="body">
                <p>${Text}</p>
                <div class="image-container">
                    <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
                    ${this.CurrentMediaIndex==0?html``:html`<a href="javascript:void(0)"  class="arrow left"><svg class="lnr lnr-chevron-left"><use xlink:href="#lnr-chevron-left"></use></svg></a>`}
                    ${this.CurrentMediaIndex>=this.images.length-1?html``:html`<a href="javascript:void(0)" class="arrow right"><svg class="lnr lnr-chevron-right"><use xlink:href="#lnr-chevron-right"></use></svg></a>`}
                </div>
            </div>   
            ${this.mode=="PREVIEW"?``:html`  
            <div class="actions">
                <a href="#">
                    <svg class="lnr lnr-heart"><use xlink:href="#lnr-heart"></use></svg>
                    <span>${LikesLabel}</span>
                </a>
                <a href="#" >
                    <svg class="lnr lnr-bubble"><use xlink:href="#lnr-bubble"></use></svg>
                </a>
                <a href="#" style="align-self: flex-end">
                    <svg class="lnr lnr-bookmark"><use xlink:href="#lnr-bookmark"></use></svg>
                </a>
            </div>  
            <div class="comments">                
            </div>   
            `}                                       
        `;

        return  content;
    }

    createRenderRoot() {
        return this;
    }

    firstUpdated() {
        super.firstUpdated();

        let ImageContainer = this.getElementsByClassName("image-container");
        console.log (ImageContainer[0].clientWidth);
        this.ImageContainerWidth = ImageContainer[0].clientWidth;
        $(ImageContainer[0]).css("height", (this.ImageContainerWidth*1.05) +"px");
        this.update();
    }

    updated(changedProperties) {
        if (changedProperties.has("images") == true) {
            this.CurrentMediaIndex = 0;
            this.LoadImage();
        }
        if (changedProperties.has("CurrentMediaIndex") == true) {
            this.LoadImage();
        }

        $(this).find(".arrow").off().click((evt)=>{ this.ChangeImage($(evt.currentTarget).hasClass("right"))});
    }

    disconnectedCallback() {

    }

    LoadImage() {
        let oImg = new Image();
        oImg.onload = ()=>{
            let ImageContainer = this.getElementsByClassName("image-container");
            console.log (ImageContainer[0].clientWidth);
            this.ImageContainerWidth = ImageContainer[0].clientWidth;
            let sizing = "horz";
            if (oImg.naturalHeight / oImg.naturalWidth > ImageContainer[0].clientHeight / ImageContainer[0].clientWidth)
                sizing = "vert";

            oImg.classList.add(sizing);
            $(ImageContainer[0]).find(".lds-ellipsis").remove();
            $(ImageContainer[0]).find("img").remove();
            setTimeout(()=> {oImg.setAttribute("style","opacity:1"); },50);
            ImageContainer[0].appendChild(oImg);
        }
        oImg.src = this.images[this.CurrentMediaIndex];
    }

    ChangeImage(bNext) {
        if (bNext == true && this.CurrentMediaIndex<this.images.length) {
            this.CurrentMediaIndex += 1;
        }
        else if (this.CurrentMediaIndex > 0) {
            this.CurrentMediaIndex -= 1;
        }
        return this.LoadImage()
    }

    OnItemClicked(evt) {
        let item = $(evt.currentTarget);
        evt.preventDefault();

        router.navigate(item.attr("href"));
        this.update();
    }

    OnContextMenu(evt ) {
        let Parent = $(evt.currentTarget);
        IVPCtxMenu.Show(Parent,[
            { Name: "share", Text:"Condividi"},
            { Name: "edit", Text:"Modifica"},
            { Name: "stats", Text:"Statistiche"},
            { Name: "separator"},
            { Name: "delete", Text:"Elimina"},
        ],(SelectedItemName)=>{
            switch(SelectedItemName)
            {
                case "share":
                    this.Share();
                    break;
                case "edit":
                    this.Edit();
                    break;
                case "stats":
                    this.ShowStats();
                    break;
                case "delete":
                    this.Delete();
                    break;
            }
        })
    }

    Share() {
        console.log("Share")
    }

    Edit() {
        console.log("Edit")
    }

    ShowStats() {
        console.log("ShowStats")
    }

    Delete() {
        console.log("Delete")
    }
}

customElements.define('ivp-post', IVPPost);

export default IVPPost;
