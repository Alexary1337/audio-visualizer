
export class AudioManager  {
    analyser: AnalyserNode;
    context: AudioContext;
    audioBuffer: AudioBuffer;
    sourceNode: AudioBufferSourceNode;

    startedAt: number;
    pausedAt: number;
    paused: boolean;
    isPlaying: boolean;

    // References to auido visualizer UI component
    playButtonDisabled: boolean = true;
    isSongLoading: boolean = false;
    songLoadingStatus: string = "";


    constructor() {
        this.isPlaying = false;
    }

    public initializeAudioFromSample(filePath: string) {
        this.context = new AudioContext();
        this.setupAudioNodes();
        this.fillAudioBuffer(filePath);
    };

    public initializeAudioFromLoader(files) {
        this.isSongLoading = true;


    //     this.context = new AudioContext();
    //     this.setupAudioNodes();

    //   fetch("http://localhost:3000/songs?ytlnk=https://www.youtube.com/watch?v=3EyMDGpB0Y8").then( (response) =>{
    //     var reader = response.body.getReader();
    //     this.read(reader);
    // });







        if(files.length === 0){
            return;
        }
        this.context = new AudioContext();
        this.setupAudioNodes();
        var fileReader  = new FileReader();
        fileReader.readAsArrayBuffer(files[0]);
        var url = URL.createObjectURL(files[0]); 
        
        var request = new XMLHttpRequest();
           
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        
        request.onprogress = (pr) => {
            this.songLoadingStatus = Math.round(pr.loaded/pr.total * 100) + "% loaded";
            console.log(Math.round(pr.loaded/pr.total * 100) + "% loaded");
        };

        // When loaded decode the data
        request.onload = () => {
            // decode the data
            this.context.decodeAudioData(request.response, (buffer) => {
            // when the audio is decoded play the sound
            this.audioBuffer = buffer;

            this.isSongLoading = false;
            this.playButtonDisabled = false;
            //on error
            }, function(e) {
                console.log(e);
            });
        };
        request.send();
        
    };

    public initializeAudioFromYtUrl(url) {
        this.isSongLoading = true;

        this.context = new AudioContext();
        this.setupAudioNodes();
        
        var request = new XMLHttpRequest();        
        request.open('GET', `http://localhost:3000/songs?ytlnk=${url}`, true);
        request.responseType = 'arraybuffer';
    

        request.onprogress = (pr) => {
            var asd =request.response;

            this.songLoadingStatus = Math.round(pr.loaded/pr.total * 100) + "% loaded";
            console.log(Math.round(pr.loaded/pr.total * 100) + "% loaded");
        };

        // When loaded decode the data
        request.onload = () => {
            // decode the data
            this.context.decodeAudioData(request.response, (buffer) => {
            // when the audio is decoded play the sound
            this.audioBuffer = buffer;

            this.isSongLoading = false;
            this.playButtonDisabled = false;
            //on error
            }, function(e) {
                console.log(e);
            });
        };
        request.send();
        
    };

    private setupAudioNodes() {
        // setup a analyser
        this.analyser = this.context.createAnalyser();
        // create a buffer source node
        this.sourceNode = this.context.createBufferSource();	
        //connect source to analyser as link
        this.sourceNode.connect(this.analyser);
        // and connect source to destination
        this.sourceNode.connect(this.context.destination);
    };

    private fillAudioBuffer(filePath: string){

        let request = new XMLHttpRequest();
  
        request.open('GET', filePath, true);
        request.responseType = 'arraybuffer';
  
        // When loaded decode the data
        request.onload = () => {
          // decode the data
          this.context.decodeAudioData(request.response, (buffer) => {
            // when the audio is decoded play the sound
            this.audioBuffer = buffer;

            this.playButtonDisabled = false;
            //on error
          }, function (e) {
            console.log(e);
          });
        };
        request.send();
      };

      public play(){
        if (!this.isPlaying) {
            this.setupAudioNodes();
            this.sourceNode.buffer = this.audioBuffer;
            this.paused = false;
            this.isPlaying = true;
            if (this.pausedAt) {
              this.startedAt = Date.now() - this.pausedAt;
              this.sourceNode.start(0, this.pausedAt / 1000);
            }
            else {
              this.startedAt = Date.now();
              this.sourceNode.start(0);
            }
          }
      };

      public pause(){
        if (this.isPlaying) {
            this.sourceNode.stop(0);
            this.pausedAt = Date.now() - this.startedAt;
            this.paused = true;
            this.isPlaying = false;
          }
      };

      public restart(){
        if (!this.isPlaying) {
            this.setupAudioNodes();
            this.sourceNode.buffer = this.audioBuffer;
            this.paused = false;
            this.isPlaying = true;
           
            this.startedAt = Date.now();
            this.sourceNode.start(0);
          }
      };







    // NOT USED YET
    audioStack = [];
    nextTime = 0;

tempasd: boolean = false;

    read(reader) {

        return reader.read().then(({ value, done }) => {
            if (done) {
                console.log('done');
                return;
            } else {
                if (this.tempasd) {
                    console.log(value.buffer);
                    this.context.decodeAudioData(value.buffer, (buffer) => {
                        this.audioStack.push(buffer);
                        if (this.audioStack.length) {
                            this.scheduleBuffers();
                        }
                    }, function (err) {
                        console.log("err(decodeAudioData): " + err);
                    });
                }
                else this.tempasd = true;
            }
            this.read(reader)
        });
    }

    scheduleBuffers() {
        while (this.audioStack.length) {
            var buffer = this.audioStack.shift();
            var source = this.context.createBufferSource();
            source.buffer = buffer;
            source.connect(this.context.destination);
            if (this.nextTime == 0)
                this.nextTime = this.context.currentTime + 0.01;  /// add 50ms latency to work well across systems - tune this if you like
            source.start(this.nextTime);
            this.nextTime += source.buffer.duration; // Make the next buffer wait the length of the last buffer before being played
        };
    }
    
}