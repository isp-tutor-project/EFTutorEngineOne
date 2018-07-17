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

import { TSceneBase } 			from "./TSceneBase";

import { CEFNavigator } 		from "../core/CEFNavigator";
import { CEFTimer } 			from "../core/CEFTimer";

import { CEFNavEvent } 			from "../events/CEFNavEvent";

import { CSceneTrack }          from "../scenegraph/CSceneTrack";
import { CSceneGraph } 		    from "../scenegraph/CSceneGraph";

import { CEFTimerEvent } 		from "../events/CEFTimerEvent";
import { CEFSceneCueEvent } 	from "../events/CEFSceneCueEvent";
import { CEFEvent } 			from "../events/CEFEvent";

import { CUtil } 				from "../util/CUtil";


import MovieClip     		  = createjs.MovieClip;
import { CONST } from "../util/CONST";




/**
* ...
*/
export class TScene extends TSceneBase
{	
	private STrack:CSceneTrack;		
    private _asyncGraphTimer:CEFTimer;
    private _asyncPlayTimer:CEFTimer;

    private _trackHandler:Function;
    private _playHandler:Function;

    private _deferPlay:boolean;

	public static readonly DEFAULT_MONITOR_INTERVAL:Number = 3000;
	
	protected _timer:CEFTimer;
	protected _interval:Number = TScene.DEFAULT_MONITOR_INTERVAL;

    private cueListener:Function   = null;
    private navListener:Function   = null;
    
	//## Mod aug 22 2013 - KT updates are single shot per scene 
	
	protected ktUpdated:boolean = false;
	
	//## MOD Aug 31 2013 - actiontrack sceneGraph support
	
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
		
        this._asyncPlayTimer  = new CEFTimer(0);
        this._asyncGraphTimer = new CEFTimer(0);

        this._deferPlay = false;

		if(this.traceMode) CUtil.trace("TScene:Constructor");					
    }

	/* ######################################################### */
	/*  ###########  END CREATEJS SUBCLASS SUPPORT ###########   */


	
	public Destructor() : void
	{
		this.disConnectTrack(this.STrack);
		this._asyncPlayTimer.off("timer", this._playHandler);			
		this._asyncGraphTimer.off("timer", this._trackHandler);			
		
		super.Destructor();
	}
	
	
//****** Overridable Behaviors

	/**
	 * Initiate the action/audio sequence - 
	 * @param	evt
	 */
	public trackPlay() : void 
	{
        // Do automated scene increments asynchronously to allow
        // actiontrack scripts to complete prior to scene nav
        
        this._playHandler = this._asyncPlayTimer.on(CONST.TIMER, this._asyncPlayTrack, this);
        this._asyncPlayTimer.start();

    }

    private _asyncPlayTrack(evt:Event) : void
    {			
        this._asyncPlayTimer.stop();
        this._asyncPlayTimer.off(CONST.TIMER, this._playHandler);                    
		this._asyncPlayTimer.reset();

        this.STrack.play();
	}		
            
    
	/**
	 * polymorphic audio track initialization
	*/
	public connectTrack(track:CSceneTrack ) :void 
	{
		if(this.traceMode) CUtil.trace("Connect Audio Behavior");		
		
		// Listen for cue/navigation events
		//
		this.cueListener = track.on(CEFSceneCueEvent.CUEPOINT, this.doSceneCue, this);	
		this.navListener = track.on(CEFNavEvent.WOZNAVINC, this.navNext, this);
	}

	/**
	 * polymorphic audio track termination
	*/
	public disConnectTrack(track:CSceneTrack ) :void 
	{
		if(this.traceMode) CUtil.trace("disConnectAudio Audio Behavior");		
		
		if(track)
		{
			track.stop();
			
			// Stop listening for cue/navigation events
			//
			track.off(CEFSceneCueEvent.CUEPOINT, this.cueListener);				
			track.off(CEFNavEvent.WOZNAVINC, this.navListener);				
		}
	}

	
//*** REWIND PLAY Management		
	
	
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
        
	}	

//*************** Audio Cue Points

			
//****** Navigation Behaviors


    /**
     * Called during TScene instantiation in the tutorcontainer 
     * this is where a scene is connected to its scene graph.
     * 
     * @param hostModule 
     * @param sceneName 
     */
	public connectSceneGraph(hostModule:string, sceneName:string ) {

		try
		{
			this.sceneGraph = CSceneGraph.factory(this.tutorDoc, this, hostModule, sceneName);			 
		}
		catch(err)							
		{
			CUtil.trace("Error: scenegraph connect Failed: " + err);
		}
	}


    /**
    * gotoNextScene manual entry point
    */
    public nextSceneTrack() : void
    {
        // Do automated scene increments asynchronously to allow
        // actiontrack scripts to complete prior to scene nav
        
        this._trackHandler = this._asyncGraphTimer.on(CONST.TIMER, this._asyncNextTrack, this);
        this._asyncGraphTimer.start();
    }

    private _asyncNextTrack(evt:Event) : void
    {			
        this._asyncGraphTimer.stop();
        this._asyncGraphTimer.off(CONST.TIMER, this._trackHandler);
                    
        this.traceGraphEdge();
    }


	/**
	 *##Mod Sep 01 2013 - Support for Animation Graphs 
    * 
    * TODO: note that we now require graphs so actiontrack exlusive scenes are not allowed
    * 
    * If this is called from scenegraphnavigator don't inc scene when scenegraph exhausted
    * let the tutorgraph handle it
    */
	public traceGraphEdge(bNavigating:boolean = false) : CSceneTrack
	{
		let nextTrack:CSceneTrack;
		
		// If this scene has an animation graph
		// This may be called as a result of scene increment on scenes that just have actiontracks
		
		if(this.sceneGraph != null)
		{				
			if(this.STrack)
			{
				this.disConnectTrack(this.STrack);				
				this.STrack = null;
			}
						
			nextTrack = this.sceneGraph.gotoNextTrack();
			
			if(nextTrack != null)
			{
                this.STrack = nextTrack;
                this.connectTrack(nextTrack);	
                
                if(!this._deferPlay)
                    this.STrack.play();			
			}
			
			// If we run out of tracks then move to the next scene node
			else if(!bNavigating)
			{
				this.navigator.gotoNextScene();				
			}
		}
		
		return nextTrack;
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

        // Set up the root sceneTrack
        // 
        this._deferPlay = true;
        this.nextSceneTrack();
        
		return result;
	}

	
	public onEnterScene(Direction:string) : void
	{				
		if(this.traceMode) CUtil.trace("TScene onenter Scene Behavior:" + this.name);		

        this._deferPlay = false;
        this.trackPlay();
        
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
		// 
		this.disConnectTrack(this.STrack);
		
		this.STrack = null;
		
		//@@ Emit State Log Packet for this scene			
		// Parse the scenedescr.xml for logging procedures for this scene
		
		this.tutorDoc._sceneData = {};			
		
		// TODO: implement
		// Always log the scene duration data
		
		// this.tutorDoc._sceneData['scene']     = name;
		// this.tutorDoc._sceneData['iteration'] = this.tutorDoc.tutorContainer.gNavigator.iteration.toString();
		// this.tutorDoc._sceneData['duration']  = this.tutorDoc.tutorContainer.timeStamp.createLogAttr("dur_"+name);
		
		// this.tutorDoc.log.logStateEvent(this.tutorDoc._sceneData);
				
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
		addEventListener(CEFEvent.ENTER_FRAME, this._asyncTerminate);
	}
	
	private _asyncTerminate(e:Event) : void
	{			
		removeEventListener(CEFEvent.ENTER_FRAME, this._asyncTerminate);
		
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
	
