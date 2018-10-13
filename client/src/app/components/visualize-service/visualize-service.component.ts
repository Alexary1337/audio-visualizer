import { Component, ViewChild, ElementRef, HostListener } from '@angular/core';
import * as THREE from 'three';
import { MeshExt } from '../../models/MeshExt';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-visualize-service',
  templateUrl: './visualize-service.component.html',
  styleUrls: ['./visualize-service.component.css']
})
export class VisualizeServiceComponent {
  @ViewChild('rendererContainer') rendererContainer: ElementRef;

  renderWidth = window.innerWidth * 0.99;
  renderHeight = window.innerHeight * 0.9;

  renderer = new THREE.WebGLRenderer();
  scene = null;
  camera = null;
  mesh = null;
  title = 'Angular 6 + WebGL Demo';

  // TEST ZONE

  downloadAudioResponse: IDownloadAudioResponeModel;

  visualizationData: number[];
  audioData: number[];
  isRunning: boolean = false;
  audio = new Audio();
  visualizationsPerSecond: number = 0;

  particlesGeometry = new THREE.Geometry();
  particleMotionSpeed: number = 2;

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2(-100, -100);
  mouseNormalized = new THREE.Vector2(-100, -100);


  previousMouseX = 0;
  previousMouseY = 0;
  deltaX = 0;
  deltaY = 0;
  private mouseDown: boolean = false;
  //

  // -----LISTENERS-----

  @HostListener('window:resize', ['$event'])
  onWindowResize(event) {
    this.camera.aspect = this.renderWidth / this.renderHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( window.innerWidth* 0.99, window.innerHeight  * 0.9)
  }

  @HostListener('mouseup')
  onMouseup() {
    this.mouseDown = false;
  }

  @HostListener('mousedown', ['$event'])
  onMousedown(event) {
    this.mouseDown = true;
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(e) {
    e.preventDefault();
    this.previousMouseX = this.mouse.x;
    this.previousMouseY = this.mouse.y;
    this.mouse.x = e.offsetX;
    this.mouse.y = e.offsetY;
    this.mouseNormalized.x = ( e.offsetX / this.renderWidth ) * 2 - 1;
    this.mouseNormalized.y = - ( e.offsetY / this.renderHeight ) * 2 + 1;
    this.deltaX = this.mouse.x - this.previousMouseX;
    this.deltaY = this.mouse.y - this.previousMouseY;
  }
// ------------------

  constructor(private http: HttpClient) {

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(75, this.renderWidth / this.renderHeight, 0.1, 5000);
    this.camera.position.set(100, -400, 2000);

    var light = this.renderMethods.lightSetup();
    this.scene.add(light);

    this.mesh = this.renderMethods.createBlockMesh();
    this.scene.add(this.mesh);

    this.renderMethods.initParticles();

    this.audioData = [];
    this.getAudio();  
  }

  ngAfterViewInit() {
    this.renderer.setSize(this.renderWidth, this.renderHeight);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);
    this.renderMethods.animate();
  }

  getAudio(){
    this.http.get<IDownloadAudioResponeModel>("http://localhost:61198/api/core/downloadaudio").subscribe(data =>{
      let respone = <IDownloadAudioResponeModel>{AudioDataBytes: [], AudioDataEncoded: data.AudioDataEncoded,VisualizationData:data.VisualizationData};
      this.downloadAudioResponse = respone;

      // Correct received bytes for audio data
      let bin = atob(data.AudioDataEncoded);
      for (let i = 0; i < bin.length; i++) {
        this.downloadAudioResponse.AudioDataBytes.push(bin.charCodeAt(i));
      }
      this.downloadAudioResponse.AudioDataEncoded = null;

    }, error => {
      console.log(error)
    });
   
  }

  audioMethods = {
    playAudio: () => {
      let blobik = new Blob([new Uint8Array(this.downloadAudioResponse.AudioDataBytes), { type: 'audio/mpeg' }]);
      var sojdet = URL.createObjectURL(blobik);
      this.audio.src = sojdet;
      this.audio.load();
      this.audio.play().then(() => {
        this.visualizationsPerSecond = (this.downloadAudioResponse.VisualizationData.length / this.audio.duration) | 0;
        this.isRunning = true;
      });
    },
    pauseAudio: () => {
      if (!this.audio.paused) {
        this.audio.pause();
        this.isRunning = false;
      } 
    },
    resumeAudio: () => {
      if (this.audio.paused) {
        this.audio.play();
      } 
    },
    testp: () => {
      
    },

  }

  renderMethods = {

    animate: () => {
      // delay 1/60 of second = aprox. 60 fps
   //   setTimeout( ()=> {
        window.requestAnimationFrame(() => this.renderMethods.animate());
    //  }, 1000 / 60 );
         
      this.renderMethods.render();  
    },

    render: () => {

      if (!this.audio.paused && !this.audio.ended)
      {
        this.renderMethods.doVisualization();        
      }
      this.renderMethods.updateParticles();
      
      if (this.mouseDown) {
        this.mesh.rotation.y += (this.deltaX * 0.005);
  
        // if (this.mesh.isMouseHovered) {
        //   this.mesh.position.x = this.mouse.x;
        // }
  
      }
      // this.raycaster.setFromCamera(this.mouseNormalized, this.camera);
      // var intersections = this.raycaster.intersectObjects([this.mesh]);
      // if (intersections.length) {
      //   for (var i = 0; i < intersections.length; i++) {
      //     var inter = intersections[i].object;
      //     if (this.mesh.id == inter.id) {
      //       if (!this.mesh.isMouseHovered) {
      //         this.mesh.material.emissive.setHex(1337);
      //         this.mesh.isMouseHovered = true;
      //       }
      //     }
      //   }
      // }
      // else {
      //   this.mesh.material.emissive.setHex(0);
      //   this.mesh.isMouseHovered = false;
      // }
  
      this.renderer.render(this.scene, this.camera);
    },
  
    lightSetup: (): THREE.Light => {
      const ambient = new THREE.AmbientLight(0x444444);
      this.scene.add(ambient);
      const light = new THREE.SpotLight(0xffffff);
      light.position.set(0, 1500, 1000);
      return light;
    },

    initParticles: () => {
      
      var material = new THREE.PointCloudMaterial({
        size: 20,
        color: 0xffffcc
      });
    
      var x, y, z;
  
      for (let index = 0; index < 900; index++) {
        x = (Math.random() * 3000) - 1500;
        y = (Math.random() * 3000) - 1500;
        z = -1000;
      
        this.particlesGeometry.vertices.push(new THREE.Vector3(x, y, z));
        
      }
       
      var pointCloud = new THREE.PointCloud(this.particlesGeometry, material);
      this.scene.add(pointCloud);

    },

    updateParticles:() => {
      this.particlesGeometry.vertices.forEach(particle => {
        var dX, dY, dZ;
        dX = Math.random() * this.particleMotionSpeed - this.particleMotionSpeed/2;
        dY = Math.random() * this.particleMotionSpeed - this.particleMotionSpeed/2;
    
        particle.add(new THREE.Vector3(dX, dY, dZ));
});

    
      this.particlesGeometry.verticesNeedUpdate = true;
    },
  
     createBlockMesh(): MeshExt {
      const material3 = new THREE.MeshStandardMaterial();
      const geometry = new THREE.BoxGeometry(900,400,0);
      return new MeshExt(geometry, material3);
    },

    doVisualization: () => {
        let currentIndex = (this.visualizationsPerSecond * this.audio.currentTime) | 0;
        this.meshRotationSettings.meshRotationSpeed = this.meshRotationSettings.mapRotationSpeed(this.downloadAudioResponse.VisualizationData[currentIndex]);
        if (this.meshRotationSettings.rotationWay == 0) {
          this.mesh.rotation.z += (this.meshRotationSettings.meshRotationSpeed * 0.005);
          if (this.mesh.rotation.z >= this.meshRotationSettings.meshRotationUpperLimit) this.meshRotationSettings.rotationWay = 1;
        } else {
          this.mesh.rotation.z -= (this.meshRotationSettings.meshRotationSpeed * 0.005);
          if (this.mesh.rotation.z <= this.meshRotationSettings.meshRotationLowerLimit) this.meshRotationSettings.rotationWay = 0;
        }
    }
  }

  meshRotationSettings = {
    meshRotationSpeed: 2,
    meshRotationUpperLimit: 0.05,
    meshRotationLowerLimit: -0.05,
    rotationWay: 0,

    mapRotationSpeed: (value: number) : number =>{
        if (value <= 0.6) {
          this.meshRotationSettings.meshRotationUpperLimit = 0.01;
          this.meshRotationSettings.meshRotationLowerLimit = -0.01;
          this.particleMotionSpeed = 2;
          this.COLORS.limeInARow++;
          if ( this.COLORS.limeInARow == 3){
          this.meshRotationSettings.nullifyCounters();
          this.mesh.material.emissive.setHex(this.COLORS.LIME);
          }
          return 0.5;
        } else if(value <= 0.7){
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
        else if(value <= 0.8){
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
        else if(value <= 0.9){
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
        else if(value <= 1){
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
