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

import { TActionTrack }         from "./TActionTrack";

import { TRoot } 				from "../thermite/TRoot";
import { TSceneBase } 			from "../thermite/TSceneBase";

import { CEFNavigator } 		from "../core/CEFNavigator";
import { CEFTimer } 			from "../core/CEFTimer";

import { CEFNavEvent } 			from "../events/CEFNavEvent";
import { CSceneGraph } 		    from "../scenegraph/CSceneGraph";

import { CEFTimerEvent } 		from "../events/CEFTimerEvent";
import { CEFSceneCueEvent } 	from "../events/CEFSceneCueEvent";
import { CEFCommandEvent } 		from "../events/CEFCommandEvent";
import { CEFScriptEvent } 		from "../events/CEFScriptEvent";
import { CEFActionEvent } 		from "../events/CEFActionEvent";
import { CEFEvent } 			from "../events/CEFEvent";

import { CONST }        	    from "../util/CONST";
import { CUtil } 				from "../util/CUtil";


import MovieClip     		  = createjs.MovieClip;




/**
* ...
*/
export class TScene extends TSceneBase
{	
	public STrack:TActionTrack;		
	public trackStartTimer:CEFTimer;
	
	public static readonly DEFAULT_MONITOR_INTERVAL:Number = 3000;
	
	protected _timer:CEFTimer;
	protected _interval:Number = TScene.DEFAULT_MONITOR_INTERVAL;

	
	//## Mod aug 22 2013 - KT updates are single shot per scene 
	
	protected ktUpdated:boolean = false;
	
	//## MOD Aug 31 2013 - actiontrack AnimationGraph support
	
	private sceneGraph:CSceneGraph = null;		
	
	
	
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
		
		this.trackStartTimer = new CEFTimer(10, 1);
		this.trackStartTimer.reset();
		this.trackStartTimer.stop();
		this.trackStartTimer.addEventListener("timer", this.playTrackHandler);	

		if(this.traceMode) CUtil.trace("TScene:Constructor");					
    }

	/* ######################################################### */
	/*  ###########  END CREATEJS SUBCLASS SUPPORT ###########   */


	
	public Destructor() : void
	{
		this.audioStartTimer.removeEventListener("timer", this.playTrackHandler);		
		this.tutorDoc.tutorContainer.removeEventListener(CONST.WOZREPLAY, this.sceneReplay);					
		
		this.disConnectAudio(this.STrack);
		
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
		
		this.trackStartTimer.reset();			
		this.trackStartTimer.start();	
	}		

	
	/**
	 * Initiate the action/audio sequence - 
	 * @param	evt
	 */
	public scenePlay() : void 
	{
		// Use the timer to do an asynchronous start of the actionTrack
		
		this.trackStartTimer.reset();			
		this.trackStartTimer.start();	
	}		

	
	/**
	 * Initiate the action/audio sequence - 
	 * @param	evt
	 */
	public playTrackHandler(evt:CEFTimerEvent) : void 
	{
		if(this.traceMode) CUtil.trace("TScene timerHandler: " + evt);
		
		this.trackStartTimer.stop();
		this.trackStartTimer.reset();

		// STrack 1 can become null if the demo menu button is clicked during scene transitions
		// and there is an immediate scene switch after the transition
		
		if(this.STrack != null)
		{
			this.STrack.gotoAndStop(1);
			this.STrack.bindPlay(this.tutorDoc.tutorContainer);
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
	public connectAudio(track:TActionTrack ) :void 
	{
		if(this.traceMode) CUtil.trace("Connect Audio Behavior");		
		
		track.stop();
		
		// Listen for cue/navigation events
		//
		track.addEventListener(CEFSceneCueEvent.CUEPOINT, this.doSceneCue);	
		track.addEventListener(CEFCommandEvent.OBJCMD, this.doActionXML);				
		track.addEventListener(CEFNavEvent.WOZNAVINC, this.navNext);
		track.addEventListener(CEFActionEvent.EFFECT, this.effectHandler);
		track.addEventListener(CEFScriptEvent.SCRIPT, this.scriptHandler);
	}

	/**
	 * polymorphic audio track termination
	*/
	public disConnectAudio(track:TActionTrack ) :void 
	{
		if(this.traceMode) CUtil.trace("disConnectAudio Audio Behavior");		
		
		if(track)
		{
			track.stop();
			
			// Stop listening for cue/navigation events
			//
			track.removeEventListener(CEFSceneCueEvent.CUEPOINT, this.doSceneCue);				
			track.removeEventListener(CEFCommandEvent.OBJCMD, this.doActionXML);				
			track.removeEventListener(CEFNavEvent.WOZNAVINC, this.navNext);				
			track.removeEventListener(CEFActionEvent.EFFECT, this.effectHandler);
			track.removeEventListener(CEFScriptEvent.SCRIPT, this.scriptHandler);		
		}
	}

	/**
	 * polymorphic audio track initialization
	*/
	public bindTrack(trackid:string ) : TActionTrack 
	{
		if(this.traceMode) CUtil.trace("bindTrack Behavior");		
        
        this.STrack = new TActionTrack(this, trackid);

		if (trackid)
			this.connectAudio(this.STrack);
			
		return this.STrack;
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

		if (this.STrack)
			this.connectAudio(this.STrack);
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

		this.disConnectAudio(this.STrack );			
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


	public connectGraph(hostModule:string, sceneName:string ) {

		try
		{
			this.sceneGraph = CSceneGraph.factory(this.tutorDoc, this, hostModule, sceneName);
			
			if(this.sceneGraph != null)
			{
				this.STrack = this.bindTrack(this.sceneGraph.nextActionTrack());
				this.STrack.stop();
			}
		}
		catch(err)							
		{
			CUtil.trace("Error: scenegraph connect Failed: " + err);
		}
	}


	/**
	 *##Mod Sep 01 2013 - Support for Animation Graphs 
    * 
    * TODO: note that we now require graphs so actiontrack exlusive scenes are not allowed
    * 
    * If this is called from scenegraphnavigator don't inc scene when scenegraph exhausted
    * let the tutorgraph handle it
    */
	public nextGraphAnimation(bNavigating:boolean = false) : string
	{
		let nextTrack:string;
		
		// If this scene has an animation graph
		// This may be called as a result of scene increment on scenes that just have actiontracks
		
		if(this.sceneGraph != null)
		{				
			if(this.STrack)
			{
				this.disConnectAudio(this.STrack);
				
				this.STrack = null;
			}
						
			nextTrack = this.sceneGraph.nextActionTrack();
			
			if(nextTrack != null)
			{
				this.STrack = this.bindTrack(nextTrack);				
				this.scenePlay();								
			}
			
			// If we run out of actionTracks then move to the next scene node
			else if(!bNavigating)
			{
				this.navigator.gotoNextScene();				
			}
		}
		
		return nextTrack;
	}
	
	
	public deferredEnterScene(Direction:string) : void
	{				
		if((Direction == "WOZNEXT") ||
			(Direction == "WOZGOTO"))
		{
			if(this.sceneGraph != null)
			{					
				this.sceneGraph.onEnterRoot();
			}
			
			// Create a unique timestamp for this scene
			
			this.tutorDoc.tutorContainer.timeStamp.createLogAttr("dur_"+name, true);
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
		
		if(this.traceMode) CUtil.trace("TScene preenter Scene Behavior: " + this.name);		

		//*********** Call super to run scene config first
		
		result = super.preEnterScene(lTutor, sceneLabel, sceneTitle, scenePage, Direction );
		
		//*************** Polymorphic Prompt Initialization
		
		this.initPrompts();

		// polymorphic actiontrack initialization - must be after "super" call - XMLParse of sceneConfig
        // 
		this.initAudio();				
					
		return result;
	}

	
	public onEnterScene(Direction:string) : void
	{				
		if(this.traceMode) CUtil.trace("TScene onenter Scene Behavior:" + this.name);		
		
		if((Direction == "WOZNEXT") ||
			(Direction == "WOZGOTO"))
		{
			if(this.STrack)
				this.trackStartTimer.start();								
		}
		
		// only listen for replay events while the scene instance in playing
		
		this.tutorDoc.tutorContainer.addEventListener(CONST.WOZREPLAY, this.sceneReplay);					
		
		super.onEnterScene(Direction);
	}

	
	// Direction can be - "NEXT" , "BACK" , "GOTO"
	// 
	public preExitScene(Direction:string, sceneCurr:number ) : string
	{
		return(super.preExitScene(Direction, sceneCurr));
	}


    public onExitScene() : void
	{				
		if(this.traceMode) CUtil.trace("TScene onexit Behavior:" + this.name);		
		
		//***** Kill the ActionTrack
		
		this.disConnectAudio(this.STrack);
		
		this.STrack = null;
		
		// only listen for replay events while the scene instance in playing
		// 
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
	
