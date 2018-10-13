import { Component, ViewChild, ElementRef, HostListener } from '@angular/core';
import * as THREE from 'three';
import { MeshExt } from '../../models/MeshExt';
import { HttpClient } from '@angular/common/http';
import { Group } from 'three';
import { AudioManager } from '../../models/AudioManager'
import { Sky } from '../../models/Sky'

@Component({
  selector: 'app-audio-visualizer',
  templateUrl: './audio-visualizer.component.html',
  styleUrls: ['./audio-visualizer.component.css']
})
export class AudioVisualizerComponent {
  @ViewChild('rendererContainer') rendererContainer: ElementRef;

  renderWidth = window.innerWidth * 0.8;
  renderHeight = window.innerHeight * 0.995;

  renderer = new THREE.WebGLRenderer();
  scene = null;
  camera = null;
  mesh: MeshExt = null;
  title = 'AUDIO';
  uploadedFiles: any[] = [];
  youtubeURL = "";
  
  // TEST ZONE
  isRendererLoading: boolean = true;
  audioManager = new AudioManager();

  
  particlesGeometry = new THREE.Geometry();
  particleMotionSpeed: number = 2;
  particleSystem : Group;

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2(-100, -100);
  mouseNormalized = new THREE.Vector2(-100, -100);
  previousMouseX = 0;
  previousMouseY = 0;
  deltaX = 0;
  deltaY = 0;
  private mouseDown: boolean = false;
  //

  // -----Handlers-----
  eventHandlers = {
    
  windowResizeHandler: (event) => {
    this.camera.aspect = this.renderWidth / this.renderHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( window.innerWidth * 0.8, window.innerHeight* 0.995)
  },

  mouseUpHandler: (event) => {
    this.mouseDown = false;
    //this.deltaX = 0;
   // this.deltaY = 0;
  },

  mouseDownHandler: (event) => {
    this.mouseDown = true;
  },

  mouseMoveHandler: (e) => {
    e.preventDefault();
    this.previousMouseX = this.mouse.x;
    this.previousMouseY = this.mouse.y;
    this.mouse.x = e.offsetX;
    this.mouse.y = e.offsetY;
    this.mouseNormalized.x = ( e.offsetX / this.renderWidth ) * 2 - 1;
    this.mouseNormalized.y = - ( e.offsetY / this.renderHeight ) * 2 + 1;
    this.deltaX = this.mouse.x - this.previousMouseX;
    this.deltaY = this.mouse.y - this.previousMouseY;
    if (this.mouseDown) {
     // this.camera.rotation.y -= (this.deltaX * 0.005);
      //this.camera.rotation.x -= (this.deltaY * 0.005);
      this.mesh.rotation.y += (this.deltaX * 0.005);
    }
  }
}
// ------------------

  constructor(private http: HttpClient) {

  
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(75, this.renderWidth / this.renderHeight, 0.1, 25000);
    this.camera.position.set(100, -400, 2000);

    var light = this.renderMethods.lightSetup();
    this.scene.add(light);

    this.renderMethods.createBlockMesh();

    this.renderMethods.createParticles();
    this.audioMethods.initAudio();


    
    // let sky = new Sky();
    // sky.scale.setScalar(500);
    // this.scene.add(sky);
    // // Add Sun Helper
    // let sunSphere = new THREE.Mesh(
    //   new THREE.SphereGeometry(500, 16, 8),
    //   new THREE.MeshBasicMaterial({ color: this.COLORS.LIME })
    // );
    // sunSphere.position.z = - 3000;
    // //sunSphere.visible = false;
    // this.scene.add(sunSphere);


    // Load the background texture
    var texture = new THREE.TextureLoader().load("assets/images/background.jpg", () => {
      var backgroundMesh = new MeshExt(
        new THREE.PlaneGeometry(20000, 20000, 0),
        new THREE.MeshBasicMaterial({
          map: texture
        }));
  
      backgroundMesh.position.z = -5000;
  
      // Create your background scene
      this.scene.add(backgroundMesh);
      this.isRendererLoading = false;
    }, 
    ()=> {

    }, 
    ()=> {
      this.isRendererLoading = false;
    });
  
  }

  ngAfterViewInit() {
    this.renderer.setSize(this.renderWidth, this.renderHeight);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);
    this.renderMethods.animate();
  }


updateVisualization () {     
	// get the average, bincount is fftsize / 2
	if (this.audioManager.isPlaying) {
		var array = new Uint8Array(this.audioManager.analyser.frequencyBinCount);
		this.audioManager.analyser.getByteFrequencyData(array);

		this.drawBars(array);
	}
}

drawBars (array) {
	var bass = Math.floor(array[1]); //1Hz Frequenz 
  this.renderMethods.doVisualization(bass);
}


  audioMethods = {
    initAudio:() => {
    },
    loadSample:() => {
      this.audioManager.initializeAudioFromSample('assets/audio/track.mp3');
    },
    playAudio: () => {
      if (!this.audioManager.playButtonDisabled && !this.audioManager.isPlaying) {
        this.audioManager.play();
      }
    },
    pauseAudio: () => {
      if (!this.audioManager.playButtonDisabled && this.audioManager.isPlaying) {
        this.audioManager.pause();
      }    
    },
    restartAudio: () => {
      if (!this.audioManager.playButtonDisabled && !this.audioManager.isPlaying) {
        this.audioManager.restart();
      }  
    },  

    loadAudioFromFiles:(files) => {
      this.audioManager.initializeAudioFromLoader(files);
    },

    downloadAudioFromYoutube:() => {
      if (this.youtubeURL != ""){
        this.audioManager.initializeAudioFromYtUrl(this.youtubeURL);
      }
    },
 
  }

  renderMethods = {

    animate: () => {
      window.requestAnimationFrame(() => this.renderMethods.animate());         
      this.renderMethods.render();  
    },

    render: () => {
      this.updateVisualization();  
      this.renderer.render(this.scene, this.camera);
    },
  
    lightSetup: (): THREE.Light => {
      const ambient = new THREE.AmbientLight(0x444444);
      this.scene.add(ambient);
      const light = new THREE.SpotLight(0xffffff);
      light.position.set(0, 1500, 1000);
      return light;
    },

    createParticles:() => {
      var material = new THREE.SpriteMaterial( {
        map: new THREE.CanvasTexture( this.renderMethods.generateSprite() ),
        blending: THREE.AdditiveBlending
      } );
      this.particleSystem = new Group();

      for ( var i = 0; i < 2000; i++ ) {
        let particle = new THREE.Sprite( material );

				particle.position.set( Math.random() * 5000 - 2500, Math.random() * 5000- 3000, Math.random() * 5000- 2500 );
        particle.scale.x = particle.scale.y = Math.random() * 32 + 16;
        
        this.particleSystem.add(particle);
      }
      this.scene.add(this.particleSystem);
    },

     generateSprite:() => {
      var canvas = document.createElement( 'canvas' );
      canvas.width = 16;
      canvas.height = 16;
      var context = canvas.getContext( '2d' );
      var gradient = context.createRadialGradient( canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2 );
      gradient.addColorStop( 0, 'rgba(255,255,255,1)' );
      gradient.addColorStop( 0.2, 'rgba(0,255,255,1)' );
      gradient.addColorStop( 0.4, 'rgba(0,0,64,1)' );
      gradient.addColorStop( 1, 'rgba(0,0,0,1)' );
      context.fillStyle = gradient;
      context.fillRect( 0, 0, canvas.width, canvas.height );
      return canvas;
    },
  
     createBlockMesh:() => {
      const material3 = new THREE.MeshStandardMaterial();
      const geometry = new THREE.BoxGeometry(900,400,0);
      this.mesh = new MeshExt(geometry, material3);
      this.scene.add(this.mesh);
    },

    doVisualization: (bass: number) => {

      // Mesh scaling
      if (bass > 230) {
        if (this.mesh.scale.x < 1.05) {
          this.mesh.scale.x *= 1.005;
          this.mesh.scale.y *= 1.005;
          this.mesh.scale.z *= 1.005;
        }
      }
      else {
        if (this.mesh.scale.x > 1) {
          this.mesh.scale.x *= 0.995;
          this.mesh.scale.y *= 0.995;
          this.mesh.scale.z *= 0.995;
        }
      }

      // Mesh rotation
      this.meshRotationSettings.meshRotationSpeed = this.meshRotationSettings.mapRotationSpeed(bass);
      if (this.meshRotationSettings.rotationWay == 0) {
        this.mesh.rotation.z += (this.meshRotationSettings.meshRotationSpeed * 0.005);
        if (this.mesh.rotation.z >= this.meshRotationSettings.meshRotationUpperLimit) this.meshRotationSettings.rotationWay = 1;
      } else {
        this.mesh.rotation.z -= (this.meshRotationSettings.meshRotationSpeed * 0.005);
        if (this.mesh.rotation.z <= this.meshRotationSettings.meshRotationLowerLimit) this.meshRotationSettings.rotationWay = 0;
      }

      // Particle system shaking
      if (bass > 240) {
          this.particleSystem.position.x += Math.random() * 10 - 5;
          this.particleSystem.position.y += Math.random() * 10 - 5;
          this.particleSystem.position.z += Math.random() * 10 - 5;
      }

      // Particle system rotation
      this.particleSystem.rotation.y += 0.003;

    }
  }

    meshRotationSettings = {
    meshRotationSpeed: 2,
    meshRotationUpperLimit: 0.05,
    meshRotationLowerLimit: -0.05,
    rotationWay: 0,

    mapRotationSpeed: (value: number) : number =>{
        if (value <= 90) {
          this.meshRotationSettings.meshRotationUpperLimit = 0.01;
          this.meshRotationSettings.meshRotationLowerLimit = -0.01;
          this.particleMotionSpeed = 2;
          this.COLORS.limeInARow++;
          if ( this.COLORS.limeInARow == 3){
          this.meshRotationSettings.nullifyCounters();
          this.mesh.material.emissive.setHex(this.COLORS.LIME);
          }
          return 0.5;
        } else if(value <= 150){
          this.meshRotationSettings.meshRotationUpperLimit = 0.02;
          this.meshRotationSettings.meshRotationLowerLimit = -0.02;
          this.particleMotionSpeed = 3;
          this.COLORS.greenInARow++;
          if ( this.COLORS.greenInARow == 3){
          this.meshRotationSettings.nullifyCounters();
          this.mesh.material.emissive.setHex(this.COLORS.GREEN);
          }
          return 1;
        }
        else if(value <= 190){
          this.meshRotationSettings.meshRotationUpperLimit = 0.04;
          this.meshRotationSettings.meshRotationLowerLimit = -0.04;
          this.particleMotionSpeed = 4;
          this.COLORS.yellowInARow++;
          if ( this.COLORS.yellowInARow == 3){
          this.meshRotationSettings.nullifyCounters();
          this.mesh.material.emissive.setHex(this.COLORS.YELLOW);
          }         
          return 2;
        }
        else if(value <= 225){
          this.meshRotationSettings.meshRotationUpperLimit = 0.08;
          this.meshRotationSettings.meshRotationLowerLimit = -0.08;
          this.particleMotionSpeed = 7;
          this.COLORS.redInARow++;
          if ( this.COLORS.redInARow == 3){
          this.meshRotationSettings.nullifyCounters();
          this.mesh.material.emissive.setHex(this.COLORS.RED);
          }   
          return 4;
        }
        else {
          this.meshRotationSettings.meshRotationUpperLimit = 0.12;
          this.meshRotationSettings.meshRotationLowerLimit = -0.12;
          this.particleMotionSpeed = 10;
          this.COLORS.darkRedInARow++;
          if ( this.COLORS.darkRedInARow == 3){
          this.meshRotationSettings.nullifyCounters();
          this.mesh.material.emissive.setHex(this.COLORS.DARKRED);
          }
          return 6;
        }
    },

    nullifyCounters: () => {
      this.COLORS.limeInARow = 0;
      this.COLORS.greenInARow = 0;
      this.COLORS.yellowInARow = 0;
      this.COLORS.redInARow = 0;
      this.COLORS.darkRedInARow = 0;
    }
  }

  COLORS = {
    DARKRED: 0x800000,
    darkRedInARow: 0,

    RED: 0xFF0000,
    redInARow: 0,

    YELLOW: 0xFFFF00,
    yellowInARow: 0,

    GREEN: 0x008000,
    greenInARow: 0,

    LIME: 0x00FF00,
    limeInARow: 0,
  }
  
}
