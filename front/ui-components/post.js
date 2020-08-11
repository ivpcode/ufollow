import {html, LitElement} from "lit-element";
import Types from "../libs/types"

import "./post.scss"

class IVPPost extends LitElement {
    static get properties() {
        return {
            user_name: { type: String },
            user_url: { type: String },
            user_thumbnail_url: { type: String },
            text: { type: String },
            images: { type: String },
            publish_timestamp: { type: String },
            likes_count: { type: Number },
        };
    }

    constructor() {
        super();

        this.user_name = "User Name";
        this.user_url = "@user_url";
        this.user_thumbnail_url = "/images/missing_image_placeholder.svg";
        this.text = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book."
        this.images = [{
            src: "/images/missing_image_placeholder.svg",
            width: 600,
            height: 495,
        }];
        this.publish_timestamp = new Date();
        this.likes_count = 0;
    }

    render() {
        let path = window.location.pathname;

        let imgHeight = this.images[0].height;
        if (imgHeight > 350)
            imgHeight = 350;

        let LikesLabel = "";
        if (this.likes_count>0)
            LikesLabel = `${this.likes_count} mi piace`;

        return html`
            <div class="head">
                <div class="user-data">
                    <div class="thumbnail-container" style="background-image: url(${this.user_thumbnail_url})"></div>
                    <div>
                        <a class="user-name" href="${this.user_url}">${this.user_name}</a>
                        <a class="user-url" href="${this.user_url}">${this.user_url}</a>
                    </div>
                </div>
                <div>
                    ${Types.Timestamp.Prettify(new Date(this.publish_timestamp))}
                    <img src="/images/context_menu.svg">
                </div>
            </div> 
            <div class="body">
                <p>${this.text}</p>
                <div class="image-container" style="height:${imgHeight};">
                    <img src="${this.images[0].src}" />
                </div>
            </div>     
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
        `;
    }

    createRenderRoot() {
        return this;
    }

    connectedCallback() {
        super.connectedCallback();

        setTimeout(()=>{
            let ImageContainer = this.getElementsByClassName("image-container");
            console.log (ImageContainer[0].offsetWidth);
        },50);

    }

    disconnectedCallback() {
    }

    OnItemClicked(evt) {
        let item = $(evt.currentTarget);
        evt.preventDefault();

        router.navigate(item.attr("href"));
        this.update();
    }
}

customElements.define('ivp-post', IVPPost);

export default IVPPost;
