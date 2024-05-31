import * as THREE from 'three';
import Figure from './figure';

const perspective = 800;

export default class Scene {
  constructor() {
    this.ct = document.getElementById('stage');
    this.$items = document.querySelectorAll('.tile__figure');

    this.W = window.innerWidth;
    this.H = window.innerHeight;
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.ct,
      alpha: true,
    })
    this.renderer.setSize(this.W, this.H);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.initLights();
    this.initCamera();
    this.figures = [];

    this.$items.forEach($el => {
      this.figures.push(new Figure(this.scene, $el));
    })

    window.addEventListener('resize', this.onResize.bind(this));

    this.update();
  }
  initLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    this.scene.add(ambientLight);
  }
  initCamera() {
    const fov = (180 * (2 * Math.atan(window.innerHeight / 2 / perspective))) / Math.PI;
    this.camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 1, 1000);
    this.camera.position.set(0, 0, perspective);
  }
  onResize() {
    this.W = window.innerWidth;
    this.H = window.innerHeight;
    this.camera.aspect = this.W / this.H;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.W, this.H);

    this.figures.forEach(figure => {
      figure.getSizes();
      figure.mesh.position.set(figure.offset.x, figure.offset.y, 0);
      figure.mesh.scale.set(figure.sizes.x, figure.sizes.y, 1);
    })
  }
  update() {
    requestAnimationFrame(this.update.bind(this));
    this.figures.forEach((figure) => {
      figure.update();
    })
    this.renderer.render(this.scene, this.camera);
  }
}