import * as THREE from 'three';
import gsap from 'gsap';

import vertexShader from '../shaders/vertex.glsl';
import gooeyShader from '../shaders/fragment.glsl';

const shaders = {
  gooey: gooeyShader,
}

export default class Figure {
  constructor(scene, $el) {
    this.scene = scene;
    this.$els = {
      el: $el,
      img: $el.querySelector('img')
    }

    this.loader = new THREE.TextureLoader();

    this.image = this.loader.load(this.$els.img.src, () => {
      this.start();
    })
    this.hover = this.loader.load(this.$els.img.dataset.hover);
    this.$els.img.style.opacity = 0;

    this.sizes = new THREE.Vector2(0, 0);
    this.offset = new THREE.Vector2(0, 0);

    this.mouse = new THREE.Vector2(0, 0);
    window.addEventListener('mousemove', (ev) => { this.onMouseMove(ev) });

    this.$els.el.addEventListener('mouseenter', this.onMouseEnter.bind(this));
    this.$els.el.addEventListener('mouseleave', this.onMouseLeave.bind(this));
  }
  start() {
    this.getSizes();
    this.createMesh();
    this.update();
  }
  getSizes() {
    const { width, height, top, left } = this.$els.img.getBoundingClientRect();
    this.sizes.set(width, height);
    this.offset.set(left - window.innerWidth/2 + width/2, -top + window.innerHeight/2 - height/2);
  }
  createMesh() {
    this.effect = this.$els.img.dataset.effect;
    this.fragmentShader = shaders[this.effect];

    this.uniforms = {
      u_image: { value: this.image },
      u_imagehover: { value: this.hover },
      u_mouse: { value: this.mouse },
      u_progressHover: { value: 0},
      u_time: { value: 0 },
      u_res: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    }

    this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: vertexShader,
      fragmentShader: this.fragmentShader,
      defines: {
        PR: window.devicePixelRatio.toFixed(1)
      }
    })
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.set(this.offset.x, this.offset.y, 0);
    this.mesh.scale.set(this.sizes.x, this.sizes.y, 1);
    this.scene.add(this.mesh);
  }
  onMouseMove(event) {
    gsap.to(this.mouse, 0.5, {
      x: (event.clientX / window.innerWidth) * 2 -1,
      y: -(event.clientY / window.innerHeight) * 2 +1,
    })
  }
  onMouseEnter() {
    this.isHovering = true;
    gsap.to(this.uniforms.u_progressHover, 0.5, {
      value: 1,
      ease: 'power2.out',
    })
  }
  onMouseLeave() {
    gsap.to(this.uniforms.u_progressHover, 0.5, {
      value: 0,
      ease: 'power2.out',
      onComplete: () => {
        this.isHovering = false;
      }
    })
  }
  update() {
    if (!this.isHovering) return;

    this.uniforms.u_time.value += 0.01;
  }
}
