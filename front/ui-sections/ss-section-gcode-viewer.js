import * as THREE from 'three';
import { OrbitControls }  from '../OrbitControls';
import { GCodeLoader } from '../GCodeLoader';
import {html, LitElement} from "lit-element";
import $ from "jquery";


class SsSectionGCodeViewer extends LitElement {
    static get properties() {
        return {

        };
    }

    constructor() {
        super();
        this.camera = null;
        this.scene = null;
        this.renderer = null;
        this.container = null;
    }

    render() {
        return html`
            <div class="gcode-container">

            </div>
        `;
    }

    createRenderRoot() {
        return this;
    }

    connectedCallback() {
        super.connectedCallback()

        $("body ss-loader").remove();
        $("body").prepend("<ss-loader></ss-loader>");
        setTimeout(()=> {
            this.container = $(".gcode-container");
            this.camera = new THREE.PerspectiveCamera(60, this.container.parent().width() / this.container.parent().height(), 1, 1000);
            this.camera.position.set(0, 0, 70);
            this.scene = new THREE.Scene();
            let loader = new GCodeLoader();
            loader.load('/boomerangv4.ncc', (object) => { //'https://threejs.org/examples/models/gcode/benchy.gcode'
                this.scene.add(object);
                this.OnRender3D();
                $("ss-loader").fadeOut();
            });
            this.renderer = new THREE.WebGLRenderer();
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(this.container.parent().width(), this.container.parent().height());
            this.container.append(this.renderer.domElement);
            let controls = new OrbitControls(this.camera, this.renderer.domElement);
            controls.addEventListener('change', () => {
                this.OnRender3D()
            }); // use if there is no animation loop
            controls.minDistance = 10;
            controls.maxDistance = 100;
            window.addEventListener('resize', () => {
                this.OnResize()
            }, false);
        },500);
    }

    OnResize() {
        this.camera.aspect = this.container.parent().width() / this.container.parent().height();
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( this.container.parent().width(), this.container.parent().height() );
        this.OnRender3D();
    }

    OnRender3D() {
        this.renderer.render( this.scene, this.camera );
    }
}

customElements.define('ss-section-gcode-viewer', SsSectionGCodeViewer);