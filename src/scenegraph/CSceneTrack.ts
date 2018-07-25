//*********************************************************************************
//
//  Copyright(c) 2008,2018 Kevin Willows. All Rights Reserved
//
//	License: Proprietary
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//  THE SOFTWARE.
//
//*********************************************************************************

//** Imports

import { IEFTutorDoc } 		from "../core/IEFTutorDoc";
import { CEFTimer }         from "../core/CEFTimer";

import { segment,
         timedEvents,
         segmentVal,
         cuePoint} 	        from "./IAudioTypes";

import { CSceneGraph } 		from "./CSceneGraph";
import { CSceneChoiceSet } 	from "./CSceneChoiceSet";

import { TTutorContainer }  from "../thermite/TTutorContainer";
import { TScene }           from "../thermite/TScene";

import { CONST }            from "../util/CONST";

import AbstractSoundInstance  	= createjs.AbstractSoundInstance ;
import EventDispatcher 	        = createjs.EventDispatcher;
import { CEFSceneCueEvent } from "../events/CEFSceneCueEvent";



export class CSceneTrack extends EventDispatcher 
{
	protected tutorDoc:IEFTutorDoc;		
    private _parent:CSceneGraph;
    private _name:string;

    private hostScene:TScene;    
    private sceneName:string;    
    private hostModule:string;
    private voice:string;
    private language:string;
    

	private _type:string;
	private _autostep:boolean;
    
	private _odds:Array<number>;
	private _chosen:boolean = false; 
    
	private _choiceset:CSceneChoiceSet;		
	private _trackname:string;
	private _actionname:string;
    
	private _features:string;

	private _pid:string;			// GUID for stocastic object
	private _cycle:number;			// recycle distance for looping
	private _prob:Array<any>;		// Array of probabliities for given PID 

    private segSequence:Array<segmentVal>;

    private segNdx:number       = 0;
    private trackLoaded:boolean = false;
    private hasAudio:boolean    = false;
    private isPlaying:boolean   = false;
    private isPaused:boolean    = false;
    private trackAudio:AbstractSoundInstance;

    // These elements are assigned from moduleData scene track declarations.
    // 
    private html:string;
    private baseName:string;
    private text:string;
    private cueSet:string;

    private segments:Array<segment>;    
    private timedSet:Array<timedEvents>;
    private templates: any;    

    private _asyncPlayTimer:CEFTimer;
    private _playHandler:Function;

    private _asyncCueTimer:CEFTimer;
    private _cueTimers:Array<CEFTimer>;

	
	constructor(_tutorDoc:IEFTutorDoc, factory:any, parent:CSceneGraph)
	{			
        super();

        this.tutorDoc    = _tutorDoc;        
        this._parent     = parent;
         
        this.hostScene   = parent.sceneInstance;
        this.sceneName   = this.hostScene.name;
        this.hostModule  = this.hostScene.hostModule;
        this.language    = this.tutorDoc.language;
        this.voice       = this.tutorDoc.voice;
        this.segSequence = [];
		
		if(factory.choiceset != undefined)
		{
            this._type      = CONST.SCENE_CHOICESET;	
            this._name      = factory.choiceset;
			this._choiceset	= CSceneChoiceSet.factory(_tutorDoc, this._parent, factory.choiceset, this._parent._graphFactory.CChoiceSets[factory.choiceset]);
		}
		
		else if(factory.trackname != undefined)
		{
			this._type      = CONST.SCENE_TRACK;				
            this._name      = factory.trackname;
			this._trackname	= factory.trackname;
		}

		else if(factory.actionname != undefined)
		{
			this._type       = CONST.SCENE_ACTION;				
            this._name       = factory.actionname;
			this._actionname = factory.actionname;
		}

        this._autostep  = factory.autostep || false;        
        this._odds      = factory.odds;
		this._features 	= factory.features || "";
		
		// Handle Stocastic Features
		
		if(factory.$P != undefined)
		{				
			this._pid   = factory.pid;
			this._prob  = factory.$P.split('|');
			this._cycle = Number(factory.cycle);
		}
    }
    

	public resolve() : CSceneTrack
	{
        let sceneTrack:CSceneTrack = null;

        switch(this._type) {
            case CONST.SCENE_ACTION:
                sceneTrack = this;
                break;

            case CONST.SCENE_TRACK:
                sceneTrack = this;
                this.registerTrack();
                break;
                
                // TODO: Check feasability of having recursive choicesets
                // e.g. sceneTrack = sceneTrack.resolve();
                // 
            case CONST.SCENE_CHOICESET:
                sceneTrack = this._choiceset.choose();
                sceneTrack.resolve();
                break;
        }

		return sceneTrack;
    }
    

    /**
     * Attach the moduleData track declaration to this object.
     * 
     * Audio track naming:
     * /ISP_TUTOR/<moduleName>/EFaudio/EFassets/<Lang>/<sceneName>/<<trackName>_s<segmentid>_v<voiceId>>.mp3
     */
    public registerTrack() {
 
        let assetPath = [this.hostModule] + CONST.TRACKASSETS_FILEPATH + this.language + "/" + this.sceneName + "/";
        let sounds = [];

        if(this._type === CONST.SCENE_TRACK) {

            Object.assign(this, this.tutorDoc.moduleData[this.hostModule][CONST.TRACK_DATA][this.sceneName].tracks[this._trackname][this.language]);

            for(let segment of this.segments) {

                let template:string = segment.templateVar;
                
                switch(template) {

                    case CONST.NOVAR:
                        // NOOP - we use the template  __novar value itself - i.e. the segment is not a template
                        break;

                    default:
                        template = this.hostScene.$resolveTemplate(template);
                        break;
                }

                // Use the value "__novar" or the resolved template value to determine the Value to use 
                // for this iteration
                // 
                let segvalue:segmentVal = segment[template] as segmentVal;

                console.log("Processing segment: " + segvalue.id + " =>" + segvalue.SSML);

                sounds.push({src: this._trackname + CONST.SEGMENT_PREFIX + segvalue.id + CONST.VOICE_PREFIX + this.voice + CONST.TYPE_MP3 , id: segvalue.id})

                this.segSequence.push(segvalue);                
            }
        }

        // If this track has audio then queue it to load
        // 
        if(sounds.length > 0) {
            createjs.Sound.on("fileload", this.onTrackLoaded, this);
            createjs.Sound.registerSounds(sounds, assetPath);

            this.hasAudio = true;
        }
    }

    
    public onTrackLoaded(event:any) {
        this.trackLoaded = true;
        console.log("Track Loaded: " + event.id + ": " + event.src);
    }



    // Behaviors

    public playTrack() {

        // If a stop occurs before the track loads we don't want it to start playing 
        // until there is an explicit start request.
        // 
        if(this.isPlaying) {

            let segment:segmentVal= this.segSequence[this.segNdx];

            if(this.trackLoaded) {

                if(this._asyncPlayTimer) {
                    this._asyncPlayTimer.stop();        
                    this._asyncPlayTimer.off(CONST.TIMER, this._playHandler);
                    this._asyncPlayTimer = null;
                }
                                
                var props = new createjs.PlayPropsConfig().set({interrupt: createjs.Sound.INTERRUPT_ANY, 
                                                                volume: segment.volume})

                this.trackAudio = createjs.Sound.play(segment.id, props); 

                if(segment.trim) {
                    this._asyncPlayTimer  = new CEFTimer(segment.duration - segment.trim);

                    this._playHandler = this._asyncPlayTimer.on(CONST.TIMER, this.segmentComplete, this);
                    this._asyncPlayTimer.start();        
                }
                else {
                    this.trackAudio.on("complete", this.segmentComplete, this);
                }

                // Fire the start cue point
                //
                this.hostScene.$cuePoints(this._name, CONST.START_CUEPOINT);
            }
            else {
                // TODO: setup retry of track loading if this fails for some defined 
                // period.
                // 
                if(!this._asyncPlayTimer) {
                    this._asyncPlayTimer  = new CEFTimer(0);

                    this._playHandler = this._asyncPlayTimer.on(CONST.TIMER, this.playTrack, this);
                    this._asyncPlayTimer.start();        
                }
            }
            this.setCuePoints(segment);
        }
    }

    private setCuePoints(segment:segmentVal) {

        this._cueTimers = new Array<CEFTimer>();

        for (let cue of segment.cues) {

            console.log("Configure cue: " + cue.name);
            
            this._cueTimers.push(CEFTimer.startTimer(cue.relTime, 
                                                     this.cueHandler, 
                                                     this,
                                                     new CustomEvent(CEFSceneCueEvent.CUEPOINT,
                                                         { detail:{ id:cue.name, track:this._name}})));
        }
    }

    private cueHandler(evt:Event, _timer:CEFTimer) {

        this.dispatchEvent(evt);
        
        _timer.stop();

        let index = this._cueTimers.indexOf(_timer);
        this._cueTimers.splice(index,1);
    }

    
    // KEYPOINT: 
    // This will play the next segment or if segments are exhausted 
    // it will auto step to the next track or just stop and wait for
    // user input.
    private segmentComplete(event:Event) {

        this.segNdx++;

        if(this.segNdx < this.segSequence.length) {
            this.playTrack();
        }
        else {
            // Fire the end cuepoint
            // 
            this.hostScene.$cuePoints(this._name, CONST.END_CUEPOINT);

            if(this._autostep) {
                this.hostScene.nextTrack();
            }
        }
    }


    public play() {
        
        switch(this._type) {
            // KEYPOINT: 
            // This will execute the named scene action it will auto step to the 
            // next track or just stop and wait for user input.
            case CONST.SCENE_ACTION:
                this.hostScene.$nodeAction(this._actionname);

                if(this._autostep) {
                    this.hostScene.nextTrack();
                }
                break;

            case CONST.SCENE_TRACK:
                if(!this.isPlaying) {
                    if(this.hasAudio) {
    
                        this.isPaused  = false;
                        this.isPlaying = true;
                        this.playTrack();
                    }
                    else {
                        console.log("something funny going on with the audio :)");
                    }
                }
                break;
                
            case CONST.SCENE_CHOICESET:
                // NB: this should never happen
                break;
        }
    }


    public pause() {

        this.isPlaying = false;
        this.isPaused  = true;

        // createJS pause mechanism
        this.trackAudio.paused = true;

    }


    public stop() {

        this.isPlaying = false;

        createjs.Sound.stop(); 
    }


    public gotoAndStop(time:number) {

    }


    public bindPlay(container:TTutorContainer) {

		
		if(this.tutorDoc.tutorContainer) this.tutorDoc.tutorContainer.playAddThis(this);
		this.play();
    }



    public get trackID() : string {

		return this._name;
    }

    
	public testPFeature() : boolean
	{
		let iter:number = this._parent.queryPFeature(this._pid, this._prob.length, this._cycle);			
		let rand:number = Math.random();
		
		// It's important to be < not <= because if we have 0 prob we never want it to fire.
		
		return (rand < this._prob[iter]);
	}
	
	
	public get hasPFeature() : boolean
	{
		return (this._pid != null);
	}
		
	
	public get type() : string
	{
		return this._type;
	}		
			
	public set features(newFTR:string)
	{
		this._features = newFTR;	
	}		
	
	public get features() : string
	{
		return this._features;
	}		
	
	public get trackName() : string
	{
		return this._trackname;
	}		
	
	public get actionName() : string
	{
		return this._actionname;
    }		
    

	/**
	 * ChoiceSet Support methods
     * 
	 */
	public getOdds(ndx:number) : number
	{
		let result:number;
		
		if(this._chosen) result = 0;  
				else result = this._odds[ndx];
			
		return result;
	}		
	
	public get count() : number
	{
		return this._odds.length;
	}
	
	public replace() : void
	{
		this._chosen = false;
	}
	
	public choose() : void
	{
		this._chosen = true;
	}


}
