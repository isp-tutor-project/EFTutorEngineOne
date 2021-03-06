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

import { CEFSceneCueEvent } from "../events/CEFSceneCueEvent";

import { CSceneGraph } 		from "./CSceneGraph";
import { CSceneChoiceSet } 	from "./CSceneChoiceSet";

import { TTutorContainer }  from "../thermite/TTutorContainer";
import { TScene }           from "../thermite/TScene";

import { CONST }            from "../util/CONST";

import AbstractSoundInstance  	= createjs.AbstractSoundInstance ;
import EventDispatcher 	        = createjs.EventDispatcher;
import { CUtil } from "../util/CUtil";



export class CSceneTrack extends EventDispatcher 
{
	protected tutorDoc:IEFTutorDoc;		
    private _parent:CSceneGraph;
    private _name:string;
	private _enqueue:boolean;

    private hostScene:TScene;    
    private sceneName:string;    
    private hostModule:string;
    private ownerModule:string;
    private voice:string;
    private language:string;
    

	private _type:string;
	private _autostep:boolean;
    private _stepdelay:number;
	private _isgroup:boolean;

    private _autoPlayTimer:CEFTimer;
    private _autoPlayHandler:Function;

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

    private templateRef:any;
    private _ontologyKey:Array<string>;
    private _ontologyRef:string;
    private _ontologyPath:string;

    private segments:Array<segment>;    
    private timedSet:Array<timedEvents>;
    private templates: any;    

    private _asyncTrimTimer:CEFTimer;
    private _trimHandler:Function;

    private _asyncPlayTimer:CEFTimer;
    private _playHandler:Function;
    private _soundCount:number;

    private _asyncCueTimer:CEFTimer;
    private _cueTimers:Array<CEFTimer>;

    private RX_DELIMITERS:RegExp = /[_|]/g;
    private RX_SSML:RegExp       = /<[^>]*>([^<]*)/g;             // SSML tag filter - $1 returns nontag portion
    private RX_DOT:RegExp        = /(\.[\s+\r+])/g;               // period filter - $1 returns nontag portion


    private assetPath:string      = "";
    private newSounds:Array<any>  = [];


    private static  lastLoaded:string = "";


    
	constructor(_tutorDoc:IEFTutorDoc, factory:any, parent:CSceneGraph)
	{			
        super();

        this.tutorDoc    = _tutorDoc;        
        this._parent     = parent;
         
        this.hostScene   = parent.sceneInstance;
        this.sceneName   = this.hostScene.name;
        this.hostModule  = this.hostScene.hostModule;
        this.ownerModule = this.hostScene.ownerModule;
        this.language    = this.tutorDoc.language;
        this.voice       = this.tutorDoc.voice;
    
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

        if(factory.enqueue === false) {
            console.log("rtest");
        }

		this._enqueue   = typeof factory.enqueue == "undefined"? true:factory.enqueue;			
        this._autostep  = factory.autostep  || false;        
        this._stepdelay = factory.stepdelay || 0.0;        
        this._odds      = factory.odds;
        this._features 	= factory.features  || "";
        this._isgroup   = factory.isgroup   || false;
		
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
    

    public get isHistoric() : boolean {

        return this._enqueue;
    }

    public get isGroup() : boolean {

        return this._isgroup;
    }

    public get isAutoStep() : boolean {

        return this._autostep;
    }


    public resolveSegmentKey(selector:string, templateRef:any) :string {

        // Allow null templateRef so we can have fully resolved selectors without
        // a reference.  i.e. This is to simplify the ontology syntax
        // 
        if(templateRef) {

            //  Use the prescribed selector or the default if present
            // 
            let ontologyRef:string = templateRef[selector] || templateRef["*"];

            // If there is no Ontology Key check if it needs one.  If the selector is not
            // ambiguous i.e. has no '?' elements then it will resolve ok. Otherwise set error
            // 
            if(!ontologyRef) {
                if(selector.includes("?"))
                    console.error("SCENETRACK: ERROR: missing Template Reference for:" + selector);
            }
            else {
                this._ontologyRef = this.hostScene.resolveRawSelector(ontologyRef, null);

                if(!this._ontologyRef) {
                    console.error("SCENETRACK: Error: missing Ontology Value:" + ontologyRef);
                }
            }
        }

        this.hostScene.resolveRawSelector(selector, this._ontologyRef);

        return this.hostScene.ontologyPath;
    }


    /**
     * Attach the moduleData track declaration to this object.
     * 
     * Audio track naming:
     * /ISP_TUTOR/<moduleName>/EFaudio/EFassets/<Lang>/<sceneName>/<<trackName>_s<segmentid>_v<voiceId>>.mp3
     */
    public registerTrack() {

        // This is required -- the HTML loader only sends loaded events for non-cached sounds
        // 
        createjs.Sound.removeAllSounds();

        this.assetPath = [this.hostModule] + CONST.TRACKASSETS_FILEPATH + this.language + "/";
        this.newSounds = [];
        let segvalue:segmentVal;
        let SSML:string    = "";
        let TrackID:string = CUtil.getTimer().toString();

        this.segSequence = [];

        // if(this._type === CONST.SCENE_TRACK) {
        try {

            Object.assign(this, this.tutorDoc.moduleData[this.hostModule][CONST.TRACK_DATA][this.sceneName].tracks[this._trackname][this.language]);

            for(let segment of this.segments) {

                let selector:string     = segment.templateVar;
                // TODO: make selector type context sensitive
                let selectorType:string = CONST.TRACK_SELECTOR;
                
                switch(selector) {

                    case CONST.NOVAR:
                        // Use the value "__novar" or the "default" resolved template value to determine the Value to use 
                        // for this iteration. novar means there is no template to resolve and the text to speak is a literal string.
                        // 
                        segvalue = segment[selector] as segmentVal;
                        SSML    += segvalue.SSML + " ";

                        segvalue.filepath = this.sceneName + "/" + this._trackname + CONST.SEGMENT_PREFIX + segvalue.fileid + CONST.VOICE_PREFIX + this.voice + CONST.TYPE_MP3;
                        break;

                    default:
                        // Resolve the ontologyKey defined for the track segment - i.e. deref the variable that contains the
                        // ontology key for this track segment.
                        // 
                        // NOTE: we call the resolver in the context of this scenetrack - so it's ontologyKey is set not the hostScene
                        // 
                        this._ontologyPath = this.resolveSegmentKey(selector, this.templateRef);
                        
                        // Use the delimiter-stripped Selector reference to determine the Value to use 
                        // for this iteration. This is to mirror how the audio builder generates template
                        // segment names
                        // 
                        let selectorTag = this._ontologyPath.replace(this.RX_DELIMITERS, "");

                        segvalue = segment[selectorTag] as segmentVal;
                        SSML    += segvalue.SSML + " ";

                        if(segvalue) {
                            segvalue.filepath = CONST.COMMONAUDIO + selectorTag + CONST.VOICE_PREFIX + this.voice + CONST.TYPE_MP3;
                        }
                        else {
                            console.log("ERROR: Missing ontology selector TAG: " + selectorTag);
                        }
                        break;
                }

                console.log("SCENEGRAPH: Loading: " + this._trackname + segvalue.fileid + " => " + segvalue.SSML);

                this.newSounds.push({src:segvalue.filepath, id:segvalue.fileid})

                this.segSequence.push(segvalue);                
            }

            // If this track has audio then queue it to load
            // 
            if(this.newSounds.length > 0) {

                // Preferentially use Speech-Synthesis over native-media over HTML-audio
                // 
                if(EFLoadManager.nativeSpeech) {

                    var noTags = SSML.replace(this.RX_SSML, '$1');
                        noTags = noTags.replace(this.RX_DOT, '$1\n ');

                    EFLoadManager.nativeSpeech.registerSpeech(noTags, TrackID);    
                    
                    this.hasAudio    = true;
                    this.trackLoaded = true;
                }

                else if(EFLoadManager.nativeAudio) {

                    EFLoadManager.nativeAudio.clearAllSounds();    

                    this.newSounds.forEach(sound => {
                        EFLoadManager.nativeAudio.registerSounds(sound.src, sound.id, this.assetPath);    
                    });                    
                    this.hasAudio    = true;
                    this.trackLoaded = true;
                }

                else {

                    this._soundCount = this.newSounds.length;

                    createjs.Sound.on("fileload", this.onTrackLoaded, this);
                    createjs.Sound.registerSounds(this.newSounds, this.assetPath);

                    this.hasAudio    = true;
                    this.trackLoaded = false;
                }
            }
        }
        catch(err) {
            console.error("SCENETRACK: ERROR: " + err);
        }
    }

    
    public onTrackLoaded(event:any) {

        this._soundCount--;

        console.log("SCENETRACK: Segment Loaded: " + event.id + ": " + event.src);

        if(!this._soundCount) {
            this.trackLoaded = true;
            console.log("SCENETRACK: Track Loaded: ");
        }
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

                    console.log("SCENEGRAPH: Async Play: " + this._trackname + segment.fileid + " => " + segment.SSML);
                }
                else {
                    console.log("SCENEGRAPH: Loaded Play: " + this._trackname + segment.fileid + " => " + segment.SSML);
                }

                if(EFLoadManager.nativeSpeech) {

                    // Use the native completion event
                    // 
                    EFLoadManager.trackOwner = this;
                    EFLoadManager.trackEvent = this.speechComplete;                    

                    EFLoadManager.nativeSpeech.playTrack(); 
                }
                else if(EFLoadManager.nativeAudio) {

                    EFLoadManager.nativeAudio.play(segment.fileid); 

                    // TODO: Need to test how to do this so we don't get both the Native completion event and the 
                    //       timer completion event. Causes repeats when the segNdx overruns in segmentComplete
                    // 
                    // // If we are trimming the segment we use the published duration to time the segment completion event
                    // // and we ignore the event from the Java Domain
                    // // 
                    // if(segment.trim) {
                    //     EFLoadManager.trackOwner = null;
                    //     EFLoadManager.trackEvent = null;
    
                    //     this._asyncTrimTimer  = new CEFTimer(segment.duration + segment.trim);

                    //     this._trimHandler = this._asyncTrimTimer.on(CONST.TIMER, this.segmentComplete, this);
                    //     this._asyncTrimTimer.start();        
                    // }
                    // // Under normal circumstances we let the Java-domain event drive the completion of the segment
                    // // 
                    // else {
                    //     EFLoadManager.trackOwner = this;
                    //     EFLoadManager.trackEvent = this.segmentComplete;
                    // }

                        // Temporary fix - just use native completion
                        EFLoadManager.trackOwner = this;
                        EFLoadManager.trackEvent = this.segmentComplete;
                }
                else {

                    var props = new createjs.PlayPropsConfig().set({interrupt: createjs.Sound.INTERRUPT_ANY, volume: segment.volume});

                    this.trackAudio = this.segSequence[this.segNdx].track = createjs.Sound.play(segment.fileid, props); 

                    if(this.trackAudio.playState === CONST.PLAY_FAILED) {

                        console.log("SCENEGRAPH: Play Failed: " + this._trackname + segment.fileid + " => " + segment.SSML);
                        alert("Track Play Failed: " + this._trackname + segment.fileid + " => " + segment.SSML);            
                    }

                    if(segment.trim) {
                        this._asyncTrimTimer  = new CEFTimer(segment.duration + segment.trim);

                        this._trimHandler = this._asyncTrimTimer.on(CONST.TIMER, this.segmentComplete, this);
                        this._asyncTrimTimer.start();        
                    }
                    else {
                        this.trackAudio.on("complete", this.segmentComplete, this);
                    }
                }

                // Fire the start cue point
                // TODO use doCuePoints in TScene
                //
                this.hostScene.$cuePoints(this._name, CONST.START_CUEPOINT);
                this.hostScene.$updateNav();

                // Set and start any inline cue points
                // 
                this.setCuePoints(segment);
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
        }
    }

    private setCuePoints(segment:segmentVal) {

        this._cueTimers = new Array<CEFTimer>();

        for (let cue of segment.cues) {

            console.log("SCENETRACK: Configure cue: " + cue.name);
            
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

    
    public ensureFireCues() {

        if(this._cueTimers) {
            
            this._cueTimers.forEach(timer => {

                timer.stop();
            });

            this._cueTimers.forEach(timer => {

                this.dispatchEvent(timer.publicEvent);

                let index = this._cueTimers.indexOf(timer);
                this._cueTimers.splice(index,1);                
            });
        }
    }

    // public cleanTrack() {

    //     // Release resources
    //     this.newSounds.forEach(sound => {

    //         createjs.Sound.removeSound(sound, this.assetPath);            
    //     });

    //     this.newSounds = [];
    //     this.assetPath = "";
    // }


    // KEYPOINT: 
    // This will play the next segment or if segments are exhausted 
    // it will auto step to the next track or just stop and wait for
    // user input.
    private segmentComplete(event:Event) {

        if(this._asyncTrimTimer) {
            this._asyncTrimTimer.stop();        
            this._asyncTrimTimer.off(CONST.TIMER, this._trimHandler);
            this._asyncTrimTimer = null;

            console.log("SCENETRACK: Async Track Segment Completion: " + this._name);
        }
        else {
            console.log("SCENETRACK: Normal Track Segment Completion: " + this._name);
        }

        this.segNdx++;

        if(this.segNdx < this.segSequence.length) {

            this.playTrack();
        }
        else {
            // Fire the end cuepoint - test for autoplay - rewind the segment index for reuse
            // 
            this.segNdx = 0;

            this.speechComplete(null);
        }
    }


    // KEYPOINT: 
    // Used as cleanup for mp3 playback and for nativespeech 
    //
    private speechComplete(event:Event) {

        // TODO use doCuePoints in TScene
        this.hostScene.$cuePoints(this._name, CONST.END_CUEPOINT);
        this.hostScene.$updateNav();
        this.autoStep();
    }


    // Play next track or just wait for user input
    // 
    public autoStep() {

        if(this._autostep) {

            if(this._stepdelay && this._stepdelay > 0) {

                this._autoPlayTimer   = new CEFTimer(this._stepdelay); 
                this._autoPlayHandler = this._autoPlayTimer.on(CONST.TIMER, this._asyncAutoPlay, this);
                this._autoPlayTimer.start();
            }
            else this.hostScene.nextTrack("$autoPlay");
        }
    }
    private _asyncAutoPlay(evt:Event) : void
	{			
		this.killAutoPlayTimer();	
        this.hostScene.nextTrack("$asyncAutoPlay");
	}
	private killAutoPlayTimer() {

		if(this._autoPlayTimer) {
			this._autoPlayTimer.stop();
			this._autoPlayTimer.off(CONST.TIMER, this._autoPlayHandler);
			this._autoPlayTimer = null;
		}
	}


    public play() {

		// Ensure any autoplays are dead 
		// 		
		this.killAutoPlayTimer();

        switch(this._type) {

            // KEYPOINT: 
            // This will execute the named scene action it will auto step to the 
            // next track or just stop and wait for user input.
            // 
            case CONST.SCENE_ACTION:

                this.hostScene.$nodeAction(this._actionname);
                this.hostScene.$updateNav();        
                this.autoStep();
                break;


            case CONST.SCENE_TRACK:

                if(!this.isPlaying) {
                    if(this.hasAudio) {
    
                        this.isPaused  = false;
                        this.isPlaying = true;
                        this.playTrack();
                    }
                    else {
                        console.log("SCENETRACK: Null audio track:)");

                        this.autoStep();
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

        // Ensure any autoplays are dead 
		// 		
        this.killAutoPlayTimer();                
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
