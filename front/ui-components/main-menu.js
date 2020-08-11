import { LitElement, html } from 'lit-element';
import "./main-menu.scss";
import '../libs/router';

class IVPMainMenu extends LitElement {
    static get properties() {
        return {
            active: { type: String },
        };
    }

    constructor() {
        super();
        this.active = "home";
        setInterval(()=>{ this.update();},100);
    }

    render() {
        let path = window.location.pathname;

        return html`
            <a href="/" @click="${this.OnItemClicked}"><svg class="home lnr lnr-home ${path=='/'?'active':''}"><use xlink:href="#lnr-home"></use></svg></a>
            <a href="/notifies" @click="${this.OnItemClicked}"><svg class="notifies lnr lnr-alarm ${path.startsWith('/notifies')?'active':''}"><use xlink:href="#lnr-alarm"></use></svg></a>
            <a href="/posts/new" @click="${this.OnItemClicked}"><svg class="new-post lnr lnr-plus-circle ${path.startsWith('/posts')?'active':''}"><use xlink:href="#lnr-plus-circle"></use></svg></a>
            <a href="/messages" @click="${this.OnItemClicked}"><svg class="messages lnr lnr-bubble ${path.startsWith('/messages')?'active':''}"><use xlink:href="#lnr-bubble"></use></svg></a>
            <a href="/user" @click="${this.OnItemClicked}"><svg class="user lnr lnr-user ${path.startsWith('/user')?'active':''}"><use xlink:href="#lnr-user"></use></svg></a>       
        `;
    }

    createRenderRoot() {
        return this;
    }

    connectedCallback() {
        super.connectedCallback();
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

customElements.define('ivp-main-menu', IVPMainMenu);

export default IVPMainMenu;
