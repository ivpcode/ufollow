import * as THREE from 'three';
import { OrbitControls }  from '../OrbitControls';
var STLLoader = require('three-stl-loader')(THREE)
import {html, LitElement} from "lit-element";
import $ from "jquery";


class SsStlViewer extends LitElement {
    static get properties() {
        return {
            stl_url: { String },
        };
    }

    constructor() {
        super();
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.STLData = null;
        this.stl_url = null;
    }

    render() {
        return html`
            <div class="viewer-container">
            </div>            
        `;
    }

    createRenderRoot() {
        return this;
    }

    connectedCallback() {
        this.scene = new THREE.Scene();
        this.scene.add( new THREE.AmbientLight( 0x999999 ) );

        this.camera = new THREE.PerspectiveCamera( 35, $(this).width() / $(this).height(), 1, 500 );

        // Z is up for objects intended to be 3D printed.

        this.camera.up.set( 0, 0, 1 );
        this.camera.position.set( 0, -9, 6 );

        this.camera.add( new THREE.PointLight( 0xffffff, 0.8 ) );

        this.scene.add( this.camera );

        var grid = new THREE.GridHelper( 20, 50, 0xffffff, 0x555555 );
        grid.rotateOnAxis( new THREE.Vector3( 1, 0, 0 ), 90 * ( Math.PI/180 ) );
        this.scene.add( grid );

        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.renderer.setClearColor( 0x999999 );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( $(this).width(), $(this).height() );
        $(this).append( this.renderer.domElement);

        let loader = new STLLoader();

        let material = new THREE.MeshPhongMaterial( { color: 0x0e2045, specular: 0x111111, shininess: 200 } );


        let fnRenderData = (geometry) =>{
            let mesh = new THREE.Mesh( geometry, material );

            mesh.position.set( 0, 0, 0 );
            mesh.rotation.set( 0, 0, 0 );
            mesh.scale.set( .1, .1, .1 );

            mesh.castShadow = true;
            mesh.receiveShadow = true;

            this.scene.add( mesh );
            this.Render3D();
        };

        if (this.STLData != null) {
            let geometry = loader.parse(this.STLData);
            setTimeout(()=>{fnRenderData(geometry);}, 50);
        }
        else
            loader.load( this.stl_url,  fnRenderData);

        let controls = new OrbitControls( this.camera, this.renderer.domElement );
        controls.addEventListener( 'change', ()=>{this.Render3D()} );
        controls.target.set( 0, 1.2, 2 );
        controls.update();
        window.addEventListener( 'resize', ()=>{ this.OnResize() }, false );

    }

    OnResize() {
        console.log("$(this).width(): "+$(this).width() +" - $(this).height(): "+$(this).height());
        this.camera.aspect = $(this).width() / $(this).height();
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( $(this).width(), $(this).height() );

        this.Render3D();
    }

    Render3D() {

        this.renderer.render( this.scene, this.camera );

    }

}

customElements.define('ss-stl-viewer', SsStlViewer);