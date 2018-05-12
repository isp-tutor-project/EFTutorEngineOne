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

import { TRoot } 				from "../thermite/TRoot";
import { TSceneBase } 			from "../thermite/TSceneBase";

import { CEFNavigator } 		from "../core/CEFNavigator";
import { CEFTimer } 			from "../core/CEFTimer";

import { CEFNavEvent } 			from "../events/CEFNavEvent";
import { CAnimationGraph } 		from "../animationgraph/CAnimationGraph";
import { CTutorGraphNavigator } from "../tutorgraph/CTutorGraphNavigator";

import { CEFTimerEvent } 		from "../events/CEFTimerEvent";
import { CEFSceneCueEvent } 	from "../events/CEFSceneCueEvent";
import { CEFCommandEvent } 		from "../events/CEFCommandEvent";
import { CEFScriptEvent } 		from "../events/CEFScriptEvent";
import { CEFActionEvent } 		from "../events/CEFActionEvent";
import { CEFEvent } 			from "../events/CEFEvent";


import { CONST }        	    from "../util/CONST";
import { CUtil } 				from "../util/CUtil";


import MovieClip     		  = createjs.MovieClip;
import DisplayObject 		  = createjs.DisplayObject;
import DisplayObjectContainer = createjs.Container;




/**
* ...
*/
export class TScene extends TSceneBase
{	
	public Saudio1:TRoot;		
	public audioStartTimer:CEFTimer;
	
	public static readonly DEFAULT_MONITOR_INTERVAL:Number = 3000;
	
	protected _timer:CEFTimer;
	protected _interval:Number = TScene.DEFAULT_MONITOR_INTERVAL;

	
	//## Mod aug 22 2013 - KT updates are single shot per scene 
	
	protected ktUpdated:boolean = false;
	
	
	//##Mod Jan 29 2013 - Support for actiontrack Sequences 
	
	private seqID:string;						
	private seqTrack:any;						
	private seqIndex:number;

	//## MOD Aug 31 2013 - actiontrack AnimationGraph support
	
	private animationGraph:CAnimationGraph = null;		
	
	
	
	/**
	 * 
	 */
	constructor() 
	{
		super();
		this.init4();
	}
	
	
	/*  ###########  START CREATEJS SUBCLASS SUPPORT ##########  */
	/* ######################################################### */

	public TSceneInitialize() {

        this.TSceneBaseInitialize.call(this);
        this.init4();
    }

    public initialize() {

        this.TSceneBaseInitialize.call(this);		
        this.init4();
    }

    private init4() {

		this.traceMode = true;
		
		//*************** Polymorphic Control Naming
		//
		this.initControlNames();
		
		this.audioStartTimer = new CEFTimer(10, 1);
		this.audioStartTimer.reset();
		this.audioStartTimer.stop();
		// this.audioStartTimer.addEventListener("timer", this.playHandler);		//** TODO */

		if(this.traceMode) CUtil.trace("TScene:Constructor");					
    }

	/* ######################################################### */
	/*  ###########  END CREATEJS SUBCLASS SUPPORT ###########   */


	
	public Destructor() : void
	{
		// this.audioStartTimer.removeEventListener("timer", this.playHandler);		//** TODO */
		this.tutorDoc.tutorContainer.removeEventListener(CONST.WOZREPLAY, this.sceneReplay);					
		
		this.disConnectAudio(this.Saudio1);
		
		super.Destructor();
	}
	
	
//****** Overridable Behaviors

//*** REWIND PLAY Management		

	/**
	 * polymorphic scene reset initialization
	*/
	public rewindScene() : void
	{
		// Parse the Tutor.config for create procedures for this scene 
	
		try {
			// Execute the rewind procedures for this scene instance
			// see notes on sceneExt Code - tutor Supplimentary code
			// 
			this.$rewind();
			
			// Support for demo scene-initialization
			// 
			this.$demoinit();
		}		
		catch(error) {

			CUtil.trace("Error in onCreate script: " + this.onCreateScript);
		}
	}
	
	
	/**
	 * Initiate the action/audio sequence - 
	 * @param	evt
	 */
	public sceneReplay(evt:Event) : void 
	{
		if(this.traceMode) CUtil.trace("sceneReplay: " + evt);
		
		// do XML based reset
		
		this.rewindScene();
		
		//## Mod Feb 07 2013 - added to support actionsequence replay functionality 
		// restart the ActionTrack sequence
		// 
		try {
			this.$preenter();
		}
		catch(error) {
			CUtil.trace("sceneReplay preenter error on scene: " + this.name + " - " + error);
		}
		
		// Use the timer to do an asynchronous start of the actionTrack
		
		this.audioStartTimer.reset();			
		this.audioStartTimer.start();	
	}		

	
	/**
	 * Initiate the action/audio sequence - 
	 * @param	evt
	 */
	public scenePlay() : void 
	{
		// Use the timer to do an asynchronous start of the actionTrack
		
		this.audioStartTimer.reset();			
		this.audioStartTimer.start();	
	}		

	
	/**
	 * Initiate the action/audio sequence - 
	 * @param	evt
	 */
	public playHandler(evt:CEFTimerEvent) : void 
	{
		if(this.traceMode) CUtil.trace("TScene timerHandler: " + evt);
		
		this.audioStartTimer.stop();
		this.audioStartTimer.reset();

		// Saudio 1 can become null if the demo menu button is clicked during scene transitions
		// and there is an immediate scene switch after the transition
		
		if(this.Saudio1 != null)
		{
			this.Saudio1.gotoAndStop(1);
			this.Saudio1.bindPlay(this.tutorDoc.tutorContainer);
		}
	}		
			
	/**
	 * Attach to the SubSequence Navigation object
	 * @param	Navigator
	*/
	public connectNavigator(Navigator:CEFNavigator) : void 
	{
		this.navigator = Navigator;
	}		
	
	/**
	 * polymorphic audio track initialization
	*/
	public connectAudio(audioClip:MovieClip ) :void 
	{
		if(this.traceMode) CUtil.trace("Connect Audio Behavior");		
		
		//@@ Debug memory test May 27 2010
		
		// Note that the ActionTrack timeline does not need to be on stage to play and work
		
		//addChild(audioClip);	
		audioClip.stop();
		
		// Listen for cue/navigation events
		//
		audioClip.addEventListener(CEFSceneCueEvent.CUEPOINT, this.doSceneCue);	
		audioClip.addEventListener(CEFCommandEvent.OBJCMD, this.doActionXML);				
		audioClip.addEventListener(CEFNavEvent.WOZNAVINC, this.navNext);
		audioClip.addEventListener(CEFActionEvent.EFFECT, this.effectHandler);
		audioClip.addEventListener(CEFScriptEvent.SCRIPT, this.scriptHandler);
	}

	/**
	 * polymorphic audio track termination
	*/
	public disConnectAudio(audioClip:MovieClip ) :void 
	{
		if(this.traceMode) CUtil.trace("disConnectAudio Audio Behavior");		
		
		if(audioClip)
		{
			audioClip.stop();
			
			// Stop listening for cue/navigation events
			//
			audioClip.removeEventListener(CEFSceneCueEvent.CUEPOINT, this.doSceneCue);				
			audioClip.removeEventListener(CEFCommandEvent.OBJCMD, this.doActionXML);				
			audioClip.removeEventListener(CEFNavEvent.WOZNAVINC, this.navNext);				
			audioClip.removeEventListener(CEFActionEvent.EFFECT, this.effectHandler);
			audioClip.removeEventListener(CEFScriptEvent.SCRIPT, this.scriptHandler);
		
			// Note that the action timeline does not need to be on stage to play and work
			
			//if(contains(audioClip))
			//	removeChild(audioClip);			
		}
	}

	/**
	 * polymorphic audio track initialization
	*/
	public bindAudio(audio:any ) : TRoot 
	{
		if(this.traceMode) CUtil.trace("bindAudio Behavior");		
			
		if (audio)
			this.connectAudio(audio);
			
		return audio;
	}		
	
//*** REWIND PLAY Management		
	
	/**
	 * Polymorphic Audio Creation - must 
	*/
	public createAudio() : void
	{
	}

	/**
	 * polymorphic audio track initialization
	*/
	public initAudio() :void 
	{
		if(this.traceMode) CUtil.trace("Default Audio Behavior");		
		
		this.createAudio();

		if (this.Saudio1)
			this.connectAudio(this.Saudio1);
	}
	
	/**
	 * Polymorphic Control Naming
	*/
	public initControlNames() : void 
	{		
		//*************** name unique instances
		
		//*************** name unique instances
	}		
	
	/**
	 * Polymorphic Prompt Initialization
	*/
	public initPrompts() : void 
	{		
	}		
	
//*************** SubSequence Navigation

	/**
	 * This drives the Navigation sequence - here it is audio event driven
	 * @param	event
	 */
	public navNext(event:CEFNavEvent) : void 
	{
		if(this.traceMode) CUtil.trace("navNext: " + event);
		
		this.navigator.gotoNextScene();
	}		
	
//*************** SubSequence Navigation

//*************** Audio Cue Points

	/**
	 * 
	 * @param	evt
	 */
	public doSceneCue(evt:CEFSceneCueEvent)
	{
		if(this.traceMode) CUtil.trace("SceneCue: " + evt);

		this.disConnectAudio(this.Saudio1 );			
	}
	
	/**
	 * 
	 * @param	evt
	 */
	public doActionXML(evt:CEFCommandEvent) : void
	{	
		if(this.traceMode) CUtil.trace("doActionXML: " + evt.objCmd);
	
		this.parseOBJ(this, evt.objCmd.children(), "xmlCmd");
	}					


//*************** Audio Cue Points

			
//****** Navigation Behaviors

	/**
	 * 
	 * @param	tarObj
	 * @param	tarOBJ
	 */
	public parseOBJ(tarObj:DisplayObject, tarOBJ:any, xType:string) : void
	{
		let element:any;
		
		if(this.traceMode) CUtil.trace("doActionXML: " + tarOBJ);
		
		for (element of tarOBJ)	
		{
			switch(element)
			{
				case "animationgraph":
					
					if(element['features'] != undefined)
					{
						// Each element of the fFeature vector contains an id for a feature of the tutor.
						// This permits the tutor to have multiple independently managed features.
						// All identifiers of all the feature sets must be globally unique.
						
						if(!this.tutorDoc.testFeatureSet(String(element['features'])))
							break;
					}
					
					try
					{
						this.animationGraph = CAnimationGraph.factory(this.tutorDoc, this, "root", element.name);
						
						if(this.animationGraph != null)
						{
							this.Saudio1 = this.bindAudio(CUtil.instantiateThermiteObject("moduleName", this.animationGraph.nextAnimation()));
							this.Saudio1.stop();
						}
					}
					catch(err)							
					{
						CUtil.trace("animationgraph JSON Spec Failed" + err);
					}
					break;
					
				case "actionsequence":
					
					if(element['features'] != undefined)
					{
						// Each element of the fFeature vector contains an id for a feature of the tutor.
						// This permits the tutor to have multiple independently managed features.
						// All identifiers of all the feature sets must be globally unique.
						
						if(!this.tutorDoc.testFeatureSet(String(element['features'])))
							break;
					}
					
					// start parsing the actiontrack sequence
					
					this.nextActionTrack(element.selection);
					
					break;
				
				case "actiontrack":
					
					if(element['features'] != undefined)
					{
						// Each element of the fFeature vector contains an id for a feature of the tutor.
						// This permits the tutor to have multiple independently managed features.
						// All identifiers of all the feature sets must be globally unique.
						
						if(!this.tutorDoc.tutorContainer.testFeatureSet(String(element['features'])))
																			break;
					}
					
					try
					{
						this.Saudio1 = this.bindAudio(CUtil.instantiateThermiteObject("moduleName", element.type));
						this.Saudio1.stop();
					}
					catch(err)							
					{
						CUtil.trace("TScene:parseOBJ: " + err);
					}
					break;
			}
		}
		
		// process parent
		
		if(tarObj)
			super.parseOBJ(tarObj, tarOBJ, xType);
	}
	
	
	/**
	 *##Mod Sep 01 2013 - Support for Animation Graphs 
		* 
		* If this is called from scenegraphnavigator don't inc scene when animationgraph exhausted
		* let the scenegraph handle it
		*/
	public nextGraphAnimation(bNavigating:boolean = false) : string
	{
		let nextSeq:string;
		
		// If this scene has an animation graph
		// This may be called as a result of scene increment on scenes that just have actiontracks
		
		if(this.animationGraph != null)
		{				
			if(this.Saudio1)
			{
				this.disConnectAudio(this.Saudio1);
				
				this.Saudio1 = null;
			}
						
			nextSeq = this.animationGraph.nextAnimation();
			
			if(nextSeq != null)
			{
				this.Saudio1 = this.bindAudio(CUtil.instantiateThermiteObject("moduleName", nextSeq) as any);
				
				this.scenePlay();								
			}
			
			// If we run out of actionTracks then move to the next scene node
			else if(!bNavigating)
			{
				this.navigator.gotoNextScene();				
			}
		}
		
		return nextSeq;
	}
	
	
	/**
	 *##Mod Jan 29 2013 - Support for actiontrack Sequences 
		*/
	public nextActionTrack(tarXML:any = null) : void
	{
		if(tarXML != null)
		{
			this.seqTrack  = tarXML;
			this.seqIndex  = 0;
		}

		//@@ Mod Aug 29 2013 - release this.Saudio1 - use it to track success in finding next track in sequence
		
		if(this.Saudio1)
		{
			this.disConnectAudio(this.Saudio1);
			
			this.Saudio1 = null;
		}
		
		while(this.seqTrack[this.seqIndex] != null)
		{
			this.parseOBJ(null, this.seqTrack[this.seqIndex].actiontrack, "");
	
			// remember the current sequence track id				
			this.seqID = this.seqTrack[this.seqIndex].id;
			
			// Autoplay subsequent tracks
			if(tarXML == null)
			this.scenePlay();
				
			this.seqIndex++;
			
			//@@ Mod Aug 29 2013 - use this.Saudio1 to track success in finding next track in sequence
			// If we sucessfully found a track then continue otherwise check the next set
			
			if(this.Saudio1)
					break;
		}			
	}
	
	
	/**
	 *##Mod Aug 31 2013 - Support for playing specific actiontrack Sequences by ID
		* 
		* @@TODO manage non-existent id's 
		*/
	public gotoActionTrackId(id:string = null) : void
	{
		// replay current track if non specified
		if(id == null || id == "")
							id = this.seqID;			
		if(this.Saudio1)
		{
			this.disConnectAudio(this.Saudio1);
			
			this.Saudio1 = null;
		}
		
		this.seqIndex = 0;
		
		for (let track of this.seqTrack)
		{				
			this.seqIndex++;
			
			if(track.id == id)
			{					
				this.parseOBJ(null, track.actiontrack, "");
			
				// remember the current sequence track id				
				this.seqID = id;
				
				this.scenePlay();					
			}			
		}			
	}
	
	
	// Default behavior - Set the Tutor Title and return same target scene
	// Direction can be - "WOZNEXT" , "WOZBACK" , "WOZGOTO"
	// 
	// return values - label of target scene or one of "WOZNEXT" or "WOZBACK"
	//
	public preEnterScene(lTutor:Object, sceneLabel:string, sceneTitle:string, scenePage:string, Direction:string ) : string
	{
		let result:string;
		
		if(this.traceMode) CUtil.trace("Default Pre-Enter Scene Behavior: " + sceneTitle);		

		//*********** Call super to run scene config first
		
		result = super.preEnterScene(lTutor, sceneLabel, sceneTitle, scenePage, Direction );
		
		//*************** Polymorphic Prompt Initialization
		
		this.initPrompts();

		// polymorphic actiontrack initialization - must be after "super" call - XMLParse of sceneConfig

		this.initAudio();				
		
		// Placing this in the preEnter phase causes a second call on enter scene - don't know why???
		
		//if(this.Saudio1)
			//this.audioStartTimer.start(gTutor);						
			
		return result;
	}

	
	public deferredEnterScene(Direction:string) : void
	{				
		if((Direction == "WOZNEXT") ||
			(Direction == "WOZGOTO"))
		{
			if(this.animationGraph != null)
			{					
				this.animationGraph.onEnterRoot();
			}
			
			// Create a unique timestamp for this scene
			
			this.tutorDoc.tutorContainer.timeStamp.createLogAttr("dur_"+name, true);
		}			
	}
	
	
	public onEnterScene(Direction:string) : void
	{				
		if(this.traceMode) CUtil.trace("TScene Enter Scene Behavior:" + Direction);		
		
		if((Direction == "WOZNEXT") ||
			(Direction == "WOZGOTO"))
		{
			if(this.Saudio1)
				this.audioStartTimer.start();								
		}
		
		// only listen for replay events while the scene instance in playing
		
		this.tutorDoc.tutorContainer.addEventListener(CONST.WOZREPLAY, this.sceneReplay);					
		
		super.onEnterScene(Direction);
	}

	
	public onExitScene() : void
	{				
		if(this.traceMode) CUtil.trace("TScene Exit Scene Behavior:");		
		
		//***** Kill the ActionTrack
		
		this.disConnectAudio(this.Saudio1);
		
		this.Saudio1 = null;
		
		// only listen for replay events while the scene instance in playing
		
		this.tutorDoc.tutorContainer.removeEventListener(CONST.WOZREPLAY, this.sceneReplay);					
		
		
		//@@ Emit State Log Packet for this scene			
		// Parse the scenedescr.xml for logging procedures for this scene
		
		this.tutorDoc._sceneData = {};			
		
		try {
			this.$logging();
		}
		catch(error) {
			CUtil.trace("logging error on scene: " + this.name + " - " + error);
		}
		
		// TODO: implement
		// Always log the scene duration data
		
		// this.tutorDoc._sceneData['scene']     = name;
		// this.tutorDoc._sceneData['iteration'] = this.tutorDoc.tutorContainer.gNavigator.iteration.toString();
		// this.tutorDoc._sceneData['duration']  = this.tutorDoc.tutorContainer.timeStamp.createLogAttr("dur_"+name);
		
		// this.tutorDoc.log.logStateEvent(this.tutorDoc._sceneData);
		
		
		// Check for Terminate Flag
		// 
		try {
			if(this.$logterm) {
				if(this.tutorDoc.testFeatureSet(this.$features)) {
					this.enQueueTerminateEvent();
				}
				else {
					this.enQueueTerminateEvent();
				}
			}
		}
		catch(error) {
			CUtil.trace("enQueueTerminateEvent error on scene: " + this.name + " - " + error);
		}

		
		//## Mod aug 22 2013 - Update KT beliefs 
		
		this.updateKT();
		
		//@@ Experimenter Log				
		
		super.onExitScene();
	}

	
	/**
	 * ##Mod Sep 09 2013 - Wait until nothing is happening an then kill the session
	 * 
	 */
	public enQueueTerminateEvent() : void
	{			
		addEventListener(CEFEvent.ENTER_FRAME, this._deferredTerminate);
	}
	
	private _deferredTerminate(e:Event) : void
	{			
		removeEventListener(CEFEvent.ENTER_FRAME, this._deferredTerminate);
		
		this.tutorDoc.log.logTerminateEvent();
	}

	
	/**
	 * ## Mod aug 22 2013 - Broke KT updates out - called from onexit 
	 * 
	 *  Polymorphically Update the knowledge Tracing 
	 */
	public updateKT() : void
	{		
		if(!this.ktUpdated)
		{
			this.ktUpdated = true;
			
			// call KT update rountines polymorphically
		}
	}		
	
//****** Navigation Behaviors
	
//****** Overridable Behaviors		
	
}
	
