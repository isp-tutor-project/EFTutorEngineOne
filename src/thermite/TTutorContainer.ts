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

import { TRoot } 	    	from "../thermite/TRoot";	
import { TObject } 	   		from "../thermite/TObject";	
import { TScene } 			from "../thermite/TScene";
import { TSceneBase } 		from "../thermite/TSceneBase";
import { CEFScene0 } 		from "../thermite/scenes/CEFScene0";
import { TCursorProxy } 	from "../thermite/TCursorProxy";	
import { TTitleBar } 		from "../thermite/TTitleBar";

import { TMouseEvent } 		from "../thermite/events/TMouseEvent";

import { CEFNavigator } 	from "../core/CEFNavigator";	
import { CEFTimeStamp } 	from "../core/CEFTimeStamp";	

import { CEFEvent } 		from "../events/CEFEvent";
import { CEFNavEvent } 		from "../events/CEFNavEvent";

import { CEFKTNode } 		from "../kt/CEFKTNode";
import { CLogManagerType } 	from "../managers/CLogManagerType";
import { CEFKeyboardEvent } from "../events/CEFKeyboardEvent";


import { CONST }            from "../util/CONST";
import { CUtil } 			from "../util/CUtil";


import MovieClip     		  = createjs.MovieClip;
import DisplayObject 		  = createjs.DisplayObject;
import DisplayObjectContainer = createjs.Container;
import Tween 				  = createjs.Tween;
import Rectangle     	  	  = createjs.Rectangle;
import Shape     		  	  = createjs.Shape;


export class TTutorContainer extends TRoot 
{	   
	
	//************ Standard Stage Symbols
	
	// public StitleBar:TTitleBar;
	// public SnavPanel:CEFNavigator;
	// public Sscene0:CEFScene0;
			
	//************ Standard Stage Symbols
	
			
//*** Tutor Customization Flags

//*********** TED2 Study1 

	public fIntroVideo:boolean 			= false;	
	public fCVSIntro:boolean 			= true;			
	public fRampsIntro:boolean			= true;
	public fRampPreTest:boolean			= false;			
	public fFreeResponse:number			= 0;			
	public fStepByStep0:boolean			= false;
	public fStepByStep1:boolean			= false;
	public fEIA:boolean					= true;
	public fEIB:boolean					= true;		
	public fEIC:boolean					= true;
	public fSummaryVideo:boolean		= false;
	public fRampPostTest:boolean		= true;
				
	// TimeStamp Logging support
	public timeStamp:CEFTimeStamp = new CEFTimeStamp;
	
	// Pause Play support
	public playing:Array<DisplayObject>  = new Array();					// Array of actively playing WOZ Objects
	public isPaused:boolean				 = false;
	public scenePtr:Array<TSceneBase>   	 = new Array;
	
	// Playback support
	
	public stateStack:Array<any> = new Array();
				
	// Global Mouse Cursor
	//
	public 	 cCursor:TCursorProxy;		
	
	public   sceneCnt:number   		   		= 0;						// Total number of scenes	

			  replayIndex:Array<number> 	= new Array;
			  replayTime:number    			= 0;
	
			Running:Array<Tween> 			= new Array();
			runCount:number  				= 0;
			
			// Playback counters
			//
			  baseTime:number;
				
	private sceneGraph:string = "<sceneGraph/>";						// export purposes only  

	public containerBounds:Shape;
    public nominalBounds:Rectangle;
    
	// This is a special signature to avoid typescript error "because <type> has no index signature."
	// on this[<element name>]
	// 
	[key: string]: any;

	
	/**
	 * CEFTutorContainer constructor
	 */
	constructor()
	{
		super();
        this.init1();
	}
	
	/*  ###########  START CREATEJS SUBCLASS SUPPORT ##########  */
	/* ######################################################### */

    public TTutorContainerInitialize() {
        this.TRootInitialize();

        this.init1();
    }

    public initialize() {
        this.TRootInitialize();

        this.init1();
    }

    private init1() {

		this.traceMode = true;		
		
		if (this.traceMode) CUtil.trace("TTutorContainer:Constructor");						
				
		// TODO derive container dimensions from TutorLoader module
		//
        this.containerBounds = new Shape();
        this.containerBounds.graphics.f("rgba(255,0,0,0)").s("rgba(0,0,0,0)").ss(1,1,1).dr(0,0,1920,1200);
        this.containerBounds.setTransform(0,0);

        this.timeline.addTween(Tween.get(this.containerBounds).wait(1));
        
        this.nominalBounds = new Rectangle(0,0,1920,1200);
    }
            
	/* ######################################################### */
	/*  ###########  END CREATEJS SUBCLASS SUPPORT ###########   */
	


	public Destructor() : void
	{
		super.Destructor();
	}
	
	
	//*************** Logging state management
	
	public captureLOGState() : string
	{
		let obj:string = super.captureLOGState();
				
		return obj;											   
	}				

//*************** Logging state management

	
//*************** Serialization
	
	/*
	* 
	*/
	public loadXML(stringSrc:any) : void
	{		
		super.loadXML(stringSrc);
		
	}
	
	/*
	*/
	public saveXML() : string
	{
		let propVector:string;
		
		return propVector;
	}	
	
//*************** Serialization


	//@@ debug - for building XML spec of Tutor spec only - captureSceneGraph
	public captureSceneGraph() : void
	{		
		//System.setClipboard(sceneGraph);		
	}
	
	
	// TODO: This appears to be deprecated
	// 
	public addScene(sceneTitle:string, scenePage:string, sceneName:string, sceneClass:string, sceneFeatures:string, sceneEnqueue:boolean, sceneCreate:boolean, sceneVisible:boolean, scenePersist:boolean, sceneObj:any = null ) : void
	{		
		//@@ debug - for building XML spec of Tutor spec only - captureSceneGraph			
		//sceneGraph.appendChild(<scene sceneTitle={sceneTitle} scenePage={scenePage} sceneName={sceneName} sceneClass={sceneClass} sceneFeatures={sceneFeatures} sceneEnqueue={sceneEnqueue? "true:boolean":":boolean"} sceneCreate={sceneCreate? "true:boolean":":boolean"} scenePersist={scenePersist? "true:boolean":":boolean"} sceneObj={sceneObj? sceneObj.name:"null"} condition="" />);
						
		// Build the Navigation sequences
		// Note that this adds the scene to the sequence as well as connecting the scene to the sequence
		//
		if(sceneEnqueue)
			this.SnavPanel.addScene(sceneTitle, scenePage, sceneName, sceneClass, scenePersist, sceneFeatures );

		// Pre-Create scene if requested
		
		if(sceneCreate)
			this.instantiateScene(sceneName, sceneClass, sceneVisible); 				

		// Otherwise add it to the automation object if it is Extant - i.e. Flash instantiated
		
		if(sceneObj != null)
			this.automateScene(sceneName, sceneObj, false);
	}
	
	
	public instantiateScene(sceneName:string, sceneClass:string, sceneVisible:boolean=false) : any
	{			
		let i1:number;
		let tarScene:any;
		let subScene:any;

		if (this.traceMode) CUtil.trace("Creating Scene : "+ sceneName);

		tarScene = CUtil.instantiateThermiteObject("moduleName", sceneClass);
		tarScene.name         = sceneName;
		tarScene.tutorDoc     = this.tutorDoc;
		tarScene.tutorAutoObj = this.tutorAuto;

		// Mixin the supplimentary code.
		//
		CUtil.extractOwnProperties(tarScene, this.tutorDoc.tutorExt[sceneName], CONST.EXT_SIG);
		CUtil.extractOwnProperties(tarScene, this.tutorDoc.tutorExt[CONST.COMMON_CODE], CONST.EXT_SIG);
		// tarScene.sceneExt     = this.tutorDoc.tutorExt[sceneName];	

		this.addChild(tarScene);

		//enumChildren(tarScene,0);				//@@ Debug display list Test May 10 2014
		//enumScenes();							//@@ Debug display list Test Oct 29 2012
		
		//gTruck.add(tarScene);					//@@ Debug memory test May 27 2010
		
		tarScene.visible = false;				
		// tarScene.stop();						// TODO: COMMENTED FOR DEBUG

		//## Mod Aug 10 2012 - must wait for initializeScenes to ensure basic scenes are in place now that 
		//					   we allow dynamic creation of the navPanel etc.
		//## Mod Oct 29 2012 - add sceneVisible - once scene has been created hasOwnProperty(sceneName) will return 
		//                                        true even if scene is destroyed - as in demo mode - in demo reentering scene 
		//										  cause scene to appear before transitionIN
		
		if(sceneVisible)
		{
			this[sceneName]  = tarScene;
			tarScene.visible = true;
		}
		
		// Generate the automation hooks
		
		this.automateScene(sceneName, tarScene);
		
		// Listen for Nav Events
		
		tarScene.addEventListener("Start", this.questionStart);
		tarScene.addEventListener("Done", this.questionComplete);
		tarScene.addEventListener(CEFNavEvent.WOZNAVBACK, this.goBackScene);
		tarScene.addEventListener(CEFNavEvent.WOZNAVNEXT, this.goNextScene);
		tarScene.addEventListener(CEFNavEvent.WOZNAVTO  , this.goToScene);

		// Stop all sub movies upon instantiation
		
		for(i1 = 0 ; i1 < tarScene.numChildren ; i1++)
		{
			subScene = tarScene.getChildAt(i1);	
			
			if(subScene instanceof MovieClip)
				subScene.gotoAndStop(1);
		}
		
		return tarScene;			
	}
	
	
	public destroyScene(sceneName:string ) : void
	{			
		let sceneObj:DisplayObject = this.getChildByName(sceneName);
		let wozObj:TObject;
		
		if(sceneObj != null)
		{
			sceneObj.removeEventListener("Start", this.questionStart);
			sceneObj.removeEventListener("Done", this.questionComplete);
			sceneObj.removeEventListener(CEFNavEvent.WOZNAVBACK, this.goBackScene);
			sceneObj.removeEventListener(CEFNavEvent.WOZNAVNEXT, this.goNextScene);
			sceneObj.removeEventListener(CEFNavEvent.WOZNAVTO  , this.goToScene);			
			
			// Recurse WOZ Children
			//
			if(sceneObj instanceof TObject)
			{
				wozObj = sceneObj as TObject;			// Coerce the Object					
				// wozObj.removeAllListeners(true); 		// Cleanup listeners  @@FLAG
				
				wozObj.Destructor();					// Object cleanup 				
			}								
			
			this.removeChild(sceneObj);
		}
		
		if (this.traceMode) CUtil.trace("Destroying Scene : "+ sceneName);
		
		if(this.hasOwnProperty(sceneName))
		{
			this[sceneName] = null;
			
			// Remove each SCENE Object
			if(this.tutorAutoObj.hasOwnProperty(sceneName))
			{				
				this.tutorAutoObj[sceneName].instance = null;			
				
				delete this.tutorAutoObj[sceneName];
			}
		}
	}
	
	
	public automateScene(sceneName:string, sceneObj:any, nameObj:boolean = true) : void
	{						
		// name the object
		
		this[sceneName] = sceneObj;		
		
		if(nameObj)									// Can't rename an object placed in Flash
			this[sceneName].name = sceneName;
		
		// Attach the navigator to the scene itself - let it know what navigation object to use when NAV events occur
		
		if(sceneObj instanceof TScene)
			sceneObj.connectNavigator(this.SnavPanel);
		
		// Record each SCENE Object
		//
		this.tutorAutoObj[sceneName] = {};
		this.tutorAutoObj[sceneName].instance = sceneObj;			
		
		// Propogate to children  
		//
		sceneObj.initAutomation(sceneObj, this.tutorAutoObj[sceneName], "", this.tutorDoc.log, this);								
		
		// Capture the initial state for replay reset
		// Fire the restore - it does instance specific initializations
	
		sceneObj.captureDefState(this.tutorAutoObj[sceneName] );	
		sceneObj.restoreDefState(this.tutorAutoObj[sceneName] );			
	}
	
	
//***************** XML State Management *******************************	

	// public recurseXML(xmlNodes:Array<any>, xmlTar:any, newVal:string ) : string
	// {
	// 	let xml:any = xmlTar;
	// 	let ndx:number;
	// 	let len:number = xmlNodes.length;
	// 	let attr:string;
	// 	let node:string
	// 	let value:string;
		
	// 	for(let nodeId:number = 0 ; nodeId < len ; nodeId++)
	// 	{
	// 		if(xmlNodes[nodeId] == '@')
	// 		{
	// 			attr = xmlNodes[nodeId+1];
				
	// 			if (this.traceMode) CUtil.trace(typeof(xml[attr]));
	// 			if (this.traceMode) CUtil.trace(xml[attr]);
				
	// 			(newVal != null)? xml[attr] = value = newVal : value = xml[attr];
	// 			nodeId++;
	// 		}
	// 		else
	// 		{
	// 			node = xmlNodes[nodeId];
				
	// 			if((nodeId + 1) < len)
	// 			{
	// 				attr = xmlNodes[nodeId+1];
					
	// 				if(isNaN( Number(attr as String)))
	// 				{
	// 					xml = xml[node];
	// 				}
	// 				else
	// 				{
	// 					ndx = Number(attr as String);
						
	// 					if((nodeId + 2) < len)
	// 						xml = xml[node][ndx];
	// 					else 
	// 						(newVal != null)? xml[node][ndx] = value = newVal : value = xml[node][ndx];
							
	// 					nodeId++;
	// 				}
	// 			}
	// 			else
	// 				(newVal != null)? xml[node] = value = newVal : value = xml[node];
	// 		}
	// 	}
		
	// 	if(this.traceMode) CUtil.trace("Final Result: " + value);
		
	// 	return value;
	// }
	
	// // Set the state value for the xmlSpec if newVal != null
	// // Otherwise it just returns the current value
	// //
	// public state(xmlSpec:string, newVal:string = null ) : string
	// {			
	// 	let nodeArray:Array<any>;
			
	// 	nodeArray = xmlSpec.split(".");
			
	// 	if(this.traceMode) CUtil.trace("Node Array: " + nodeArray);

	// 	return this.recurseXML(nodeArray, this.tutorDoc.state[0], newVal);
	// }

	
	// // Set the scene value for the xmlSpec if newVal != null
	// // Otherwise it just returns the current value
	// //
	// public scene(xmlSpec:string, newVal:string = null ) : string
	// {			
	// 	let nodeArray:Array<any>;
			
	// 	nodeArray = xmlSpec.split(".");
			
	// 	if(this.traceMode) CUtil.trace("Node Array: " + nodeArray);

	// 	return this.recurseXML(nodeArray, this.tutorDoc.scenedata[0], newVal);
	// }

	
//***************** XML State Management *******************************		


//***************** Pause Play Support *******************************		
	
	/**
	 * Cancel anything that is currently playing - inform component proxies through a replay event dispatch
	 * 
	 */
	public wozReplay():void 
	{
		if (this.traceMode)  CUtil.trace(" wozReplay : ", this.playing.length);		
		
		// Stop anything that is currently playing 
		
		this.wozStopPlay();
		
		// Tell Proxies that Tutor is replaying
		//
		dispatchEvent(new Event(CONST.WOZCANCEL));
		dispatchEvent(new Event(CONST.WOZREPLAY));
	}

	/**
	 * Cancel anything that is currently playing - inform component proxies through a replay event dispatch
	 * 
	 */
	public wozStopPlay():void 
	{
		if (this.traceMode)  CUtil.trace(" wozStopPlay : ", this.playing.length);		
		
		let tCount:number = this.playing.length;
		
		for (let i1:number = 0 ; i1 < tCount ; i1++)
		{
			// Call the base stop directly - so playing array is not affected
			// this.playing[0].stop();  //** TODO */
			this.playing.pop();
		}
	}
	
	/**
	 * Pause anything that is currently playing - inform component proxies through a pause event dispatch
	 * 
	 */
	public wozPause():void 
	{
		if (this.traceMode)  CUtil.trace(" wozPause : ", this.playing.length);		
		
		this.isPaused = true;					//@@ Mod Mar 15 2013 - FLEX support - manage pause when transitioning in and out of full screen mode
		
		// Tell Proxies that Tutor is pausing
		//
		this.dispatchEvent(new Event(CONST.WOZPAUSING));
		
		for (let i1:number = 0 ; i1 < this.playing.length ; i1++)
		{
			// Call the base stop directly - so playing array is not affected
			// this.playing[i1].stop();		//** TODO */
		}
	}

	/**
	 * Pause anything that is currently playing - inform component proxies through a pause event dispatch
	 * 
	 */
	public wozPlay():void 
	{
		if (this.traceMode)  CUtil.trace(" wozPlay : ", this.playing.length);		

		this.isPaused = false;					//@@ Mod Mar 15 2013 - FLEX support - manage pause when transitioning in and out of full screen mode
		
		// Tell Proxies that Tutor is playing again
		//
		this.dispatchEvent(new Event(CONST.WOZPLAYING));			
		
		for (let i1:number = 0 ; i1 < this.playing.length ; i1++)
		{
			// Call the base play directly - so playing array is not affected
			// this.playing[i1].play();		//** TODO */
		}
	}

	/**
	 * Manage the array of playing movieclips
	 * 
	 * @@@ NOTE: There is probably a memory leak here as we don't catch cases where movies stop at their last 
	 * 		     frame just because they are complete
	 */
	public playRemoveThis(wozObj:TRoot ):void 
	{
		if (this.traceMode) CUtil.trace(" playRemoveThis : ", wozObj.name, this.playing.length);		
		
		for (let i1:number = 0 ; i1 < this.playing.length ; i1++)
		{
			if (this.playing[i1] == wozObj)
			{
				// the interface is now in a new state - 
				
				this.tutorDoc.incStateID();
			
				// remove the movie from the running array

				this.playing.splice(i1, 1);
				break;
			}
		}
	}

	/**
	 * Manage the array of playing movieclips
	 * 
	 */
	public playAddThis(wozObj:TRoot ):void 
	{
		if (this.traceMode)  CUtil.trace(" playAddThis : ", wozObj.name, this.playing.length);		
		
		let fAdd:boolean = true;
		
		for (let i1:number = 0 ; i1 < this.playing.length ; i1++)
		{
			if (this.playing[i1] == wozObj)
			{
				fAdd = false;
				break;
			}
		}
		
		if (fAdd)
			this.playing.push(wozObj);
	}

	/**
	 * Note we don't show the Play as it will obscure everything - pause will show it as required
	 * @param	fShow
	 */
	public showPPlay(fShow:boolean) : void
	{
		// this.StitleBar.Spause.visible = fShow;
	}

	/**
	 * 
	 * @param	fShow
	 */
	public showReplay(fShow:boolean) : void
	{
		// this.StitleBar.Sreplay.visible = fShow;
	}
					
	
//***************** Pause Play Support *******************************		

//***************** Mouse Cursor Management *******************************		

	public setCursor(sMode:string) : void
	{
		if(this.traceMode) CUtil.trace("switching mouse ownership");

		if(this.cCursor)
		{
			this.cCursor.initWOZCursor(sMode);				
		}
	}
	
	public replaceCursor() : void
	{
		if(this.traceMode) CUtil.trace("Creating Mouse Pointer");
		
		if(!this.cCursor)
		{
			this.cCursor = new TCursorProxy;
			this.cCursor.visible = false;
			
			this.addChild(this.cCursor);			
		}
		
		this.cCursor.initWOZCursor(TCursorProxy.WOZLIVE);				
		this.cCursor.show(false);
	}

//***************** Mouse Cursor Management *******************************		
	
//***************** Automation *******************************		

	public initAutomation() : void
	{				
		if(this.traceMode) CUtil.trace("Init Automation:");
		
		// Point the transitions / NavPanel
		//  	to this tutor in the automation array
		//
		if(this.xitions)
			this.xitions.connectToTutor(this, this.tutorAutoObj);									
		
	}

	
	// Walk the WOZ Objects to capture their default state
	//
	public captureDefState(Tutor:any ) : void 
	{
		if(this.traceMode) CUtil.trace("\t*** Start Capture - Walking Scenes***");

		for(let scene in Tutor)
		{
			if(this.traceMode) CUtil.trace("\tSCENE : " + scene);
			
			if(scene != "instance" && Tutor[scene].instance instanceof TSceneBase)
			{				
				Tutor[scene].instance.captureDefState(Tutor[scene] );					
			}					
		}		
		if(this.traceMode) CUtil.trace("\t*** End Capture - Walking Scenes***");
	}
	
	
	// Walk the WOZ Objects to restore their default state
	//
	public restoreDefState(Tutor:any ) : void 
	{
		if(this.traceMode) CUtil.trace("\t*** Start Restore - Walking Scenes***");

		for(let scene in Tutor)
		{
			if(this.traceMode) CUtil.trace("\tSCENE : " + scene);
			
			if(scene != "instance" && Tutor[scene].instance instanceof TSceneBase)
			{				
				if(this.traceMode) CUtil.trace("reseting: " + scene);
			
				Tutor[scene].instance.restoreDefState(Tutor[scene] );					
			}					
		}		
		if(this.traceMode) CUtil.trace("\t*** End Restore - Walking Scenes***");
	}
	
	
	// Playback the recorded event stream 
	//
	public doPlayBack(pbSource:any) : void 
	{
		if(this.traceMode) CUtil.trace("\t*** Start - Playback Stream ***");

		this.cCursor.initWOZCursor(TCursorProxy.WOZREPLAY);	
		this.cCursor.setCursorStyle("Sautomate");
		this.cCursor.setTopMost();
		this.cCursor.show(true);			
		this.cCursor.initPlayBack();						// reset the Playback timer
		
		// Save the current tutor state
		// Note: during playback no logging takes place
		
		this.stateStack.push(this.baseTime);
		this.stateStack.push(this.tutorDoc.stateID);
		this.stateStack.push(this.tutorDoc.frameID);
		this.stateStack.push(this.tutorDoc.log.fLogging);				// Remember the logger flag prior to playback
		
		this.tutorDoc.log.fLogging = CONST.RECLOGNONE;		// stop logging/recording
		
		// Prep the Playback source.
		//			
		this.tutorDoc.log.setPlayBackSource(pbSource);
		
		if(pbSource[0].version == "1") 
		{
			this.tutorDoc.log.normalizePlayBackTime();
			
			// Set the normalization constant for the realtime calculations

			this.baseTime = CUtil.getTimer();
		
			addEventListener(CEFEvent.ENTER_FRAME, this.playBackByTime);
			
			// In demo mode any key will abort playback and return to demo menu
			
			if(this.tutorDoc.fDemo)
			{
				this.stage.addEventListener(CEFKeyboardEvent.KEY_UP, this.abortPlayBack);
				this.stage.addEventListener(TMouseEvent.CLICK, this.abortPlayBack2);
			}
		}
		else if(pbSource[0].version == "2")
		{
			this.tutorDoc.log.normalizePlayBack();
			
			// Disconnect the tutor frame counter - handed off to the playback unit

			this.tutorDoc.connectFrameCounter(false);
			
			addEventListener(CEFEvent.ENTER_FRAME, this.playBackByFrame);
		}
	}
	
	
	// Replay the live Events stream 
	//
	public replayStream(evt:CEFNavEvent) : void 
	{
		if(this.traceMode) CUtil.trace("\t*** Start - Replay Stream ***");
		
		this.cCursor.initWOZCursor(TCursorProxy.WOZREPLAY);				
		this.cCursor.show(true);			
		this.cCursor.initPlayBack();						// reset the Playback timer
					
		this.restoreDefState(this.tutorAutoObj);
		
		// Save the current tutor state
		// Note: during playback no logging takes place
		
		this.stateStack.push(this.baseTime);
		this.stateStack.push(this.tutorDoc.stateID);
		this.stateStack.push(this.tutorDoc.frameID);
		this.stateStack.push(this.tutorDoc.log.fLogging);				// Remember the logger flag prior to playback
		
		this.tutorDoc.log.fLogging= CONST.RECLOGNONE;	// stop logging/recording
		
		// Prep the Playback source.

		this.tutorDoc.log.setPlayBackSource(null);
		this.tutorDoc.log.normalizePlayBack();

		// Disconnect the tutor frame counter - handed off to the playback unit

		this.tutorDoc.connectFrameCounter(false);
			
		// Seek to the start scene

		this.SnavPanel.goToScene("Sscene0");		
		
		// Use playback frame counter/update
		
		addEventListener(CEFEvent.ENTER_FRAME, this.playBackByFrame);
	}
	
	
	/**
	 *  Replay the live Events stream from the current log cache	
	 * 
	 */
	public replayLiveStream() : void 
	{
		if(this.traceMode) CUtil.trace("\t*** Start - Replay Live Stream ***");
		
		this.cCursor.initWOZCursor(TCursorProxy.WOZREPLAY);				
		this.cCursor.setCursorStyle("Sautomate");
		this.cCursor.setTopMost();
		this.cCursor.show(true);			
		this.cCursor.initPlayBack();						// reset the Playback timer
					
		this.restoreDefState(this.tutorAutoObj);
		
		// Save the current tutor state
		// Note: during playback no logging takes place
		
		this.stateStack.push(this.baseTime);
		this.stateStack.push(this.tutorDoc.stateID);
		this.stateStack.push(this.tutorDoc.frameID);
		this.stateStack.push(this.tutorDoc.log.fLogging);				// Remember the logger flag prior to playback
		
		this.tutorDoc.log.fLogging= CONST.RECLOGNONE;	// stop logging/recording
		
		// Prep the Playback source.
		//			
		this.tutorDoc.log.setPlayBackSource(null);
		this.tutorDoc.log.normalizePlayBack();
		
		// Disconnect the tutor frame counter - handed off to the playback unit

		this.tutorDoc.connectFrameCounter(false);
		
		// Seek to the start scene
		//
		this.SnavPanel.goToScene("SstartSplash");		// 	
		
		// Use playback frame counter/update
		
		addEventListener(CEFEvent.ENTER_FRAME, this.playBackByFrame);
	}
	
	/**
	 * set flag to end playback on next frame
	 */
	private abortPlayBack(evt:KeyboardEvent) : void
	{
		this.tutorDoc.log.setPlayBackDone(true);	
		dispatchEvent(new Event("interruptPlayBack"));
	}

	/**
	 * set flag to end playback on next frame
	 */
	private abortPlayBack2(evt:MouseEvent) : void
	{
		this.tutorDoc.log.setPlayBackDone(true);
		dispatchEvent(new Event("interruptPlayBack"));
	}
	
	/**
	 * 
	 * @param	evt
	 */
	public playBackByFrame(evt:Event)
	{
		let wozEvt:any = null;								// Next event
		let nextEventState:number;

		//**** If playback is finished remove onFrame action and restore mouse cursor

		if(this.tutorDoc.log.playBackDone())
		{
			if(this.traceMode) CUtil.trace("-- Playback Completed -- ");
			
			removeEventListener(CEFEvent.ENTER_FRAME, this.playBackByFrame);
							
			this.cCursor.initWOZCursor(TCursorProxy.WOZLIVE);		
			this.cCursor.setCursorStyle("Sstandard");
			this.cCursor.show(false);
			
			dispatchEvent(new Event("endPlayBack"));
			
			// restore the tutor state
			// Note: during playback no logging takes place
			
			this.tutorDoc.log.fLogging = this.stateStack.pop();	
			this.tutorDoc.frameID = this.stateStack.pop();
			this.tutorDoc.stateID = this.stateStack.pop();
			this.baseTime       = this.stateStack.pop();			
			
			// Reconnect the tutor frame counter - handed off to the playback unit

			this.tutorDoc.connectFrameCounter(true);		
		}		

		//**** Otherwise playback the next event(s) in sequence
		
		else
		{
			// wait until we have reached the state for the next event
			//
			// this.tutorDoc.stateID is the current state of the interface
			// nextEventState is the state when the next event will happen - at some frame within this state
			//
			// Note1: We reset the frameID on each state change so events happen relative to a state change
			//
			// Note2: non-event driven state changes (video / animation events) may need to complete 
			//       before we continue.
			
			nextEventState = this.tutorDoc.log.getNextEventState();
			
			// once we reach the state start checking frames for events 
			
			if (this.traceMode) CUtil.trace("this.tutorDoc.stateID: " + this.tutorDoc.stateID + "  - nextEventState:" + nextEventState);
			
			//if(this.tutorDoc.stateID >= nextEventState)
			{				
				// Now we fire all the events that occured in this frame (in sequence)
				
				do
				{
					wozEvt = this.tutorDoc.log.getNextEvent(this.tutorDoc.stateID, this.tutorDoc.frameID);
				
					if(wozEvt != null)
					{
						if (this.traceMode) CUtil.trace("-- Executing Frame:" + this.tutorDoc.frameID + " -- EVT -- " + wozEvt);

						// fire the event - this handles mouse and text event types
						
						this.cCursor.playBackAction(wozEvt );	
					}
					
				}while(wozEvt != null);
				
				// In replay we only increment the frameID once we have reached the next event state - 
				// this maintains synchronization with movieclips that may be running fast or slow relative
				// to the frame they occured in the live session.
				
				this.tutorDoc.incFrameID();				
			}
		}
	}


	public playBackByTime(evt:Event)
	{
		let frameTime:number = CUtil.getTimer() - this.baseTime;	// get the realtime normalized frame Time
		let wozEvt:any;												// Next event
				
		// First do all the actions that have occured up to and including frameTime 
		//
		do
		{
			wozEvt = this.tutorDoc.log.getActionEvent(frameTime);
			
			// If we find an action item - fire it
			//
			if(wozEvt != null)
			{
				this.cCursor.playBackAction(wozEvt );	
				if(this.traceMode) CUtil.trace("-- Executing Frame:" + frameTime + " -- EVT -- " + wozEvt);
			}
			
		}while(wozEvt != null);
		
		// Find the next move that occurs at or immediately following frameTime.  Interoplate 
		// position from this.  note that getMoveEvent can return lastMove multiple times if
		// there are multiple frameTime events before the playhead reaches it.
		//
		wozEvt = this.tutorDoc.log.getMoveEvent(frameTime);
		
		if(wozEvt != null)
		this.cCursor.playBackMove(wozEvt, frameTime );	

		// If playback is finished remove onFrame action and restore mouse cursor
		//
		if(this.tutorDoc.log.playBackDone())
		{
			if(this.traceMode) CUtil.trace("-- Playback Completed -- ");
			
			removeEventListener(CEFEvent.ENTER_FRAME, this.playBackByTime);
							
			this.cCursor.initWOZCursor(TCursorProxy.WOZLIVE);		
			this.cCursor.setCursorStyle("Sstandard");
			this.cCursor.show(false);
			
			dispatchEvent(new Event("endPlayBack"));
			
			// restore the tutor state
			// Note: during playback no logging takes place
			
			this.tutorDoc.log.fLogging = this.stateStack.pop();	
			this.tutorDoc.frameID = this.stateStack.pop();
			this.tutorDoc.stateID = this.stateStack.pop();
			this.baseTime       = this.stateStack.pop();
			
			// Reconnect the tutor frame counter - handed off to the playback unit

			this.tutorDoc.connectFrameCounter(true);				
							
			// In demo mode any key will abort playback 
			
			if(this.tutorDoc.fDemo)
			{
				this.stage.removeEventListener(CEFKeyboardEvent.KEY_UP, this.abortPlayBack);
				this.stage.removeEventListener(TMouseEvent.CLICK, this.abortPlayBack2);
			}
		}		
	}
	
	
//***************** Automation *******************************		
			
//***************** Debug *******************************		

	/**
	 * 
	 * @param	Tutor
	 */
	public dumpScenes(Tutor:any) : void
	{				
		for(let scene in Tutor)
		{
			if(this.traceMode) CUtil.trace("\tSCENE : " + scene);
			
			if(scene != "instance" && Tutor[scene].instance instanceof TObject)
			{
				if(this.traceMode) CUtil.trace("\tCEF***");
	
				Tutor[scene].instance.dumpSceneObjs(Tutor[scene]);					
			}					
		}		
	}
	
	
	/**
	 * 
	 * @param	Tutor
	 */
	public enumScenes() : void
	{				
		let sceneObj:DisplayObject;
		
		for(let i1:number = 0 ; i1 < this.numChildren ; i1++)
		{
			sceneObj = this.getChildAt(i1) as DisplayObject;
			
			CUtil.trace(sceneObj.name + " is visible : " + ((sceneObj.visible)? " true":" false"));
		}	
	}

	
	/**
	 * 
	 * @param	Tutor
	 */
	public enumChildren(scene:DisplayObjectContainer, indentCnt:number) : void
	{				
		let sceneObj:any;
		let indent:string = "";
		
		for(let i2:number = 0 ; i2 < indentCnt ; i2++)
			indent += "\t";
		
		for(let i1:number = 0 ; i1 < scene.numChildren ; i1++)
		{
			sceneObj = scene.getChildAt(i1);
			
			CUtil.trace(indent + sceneObj.name + " is visible : " + ((sceneObj.visible)? " true":" false") + " -alpha : " + sceneObj.alpha.toString() + "- x : " + sceneObj.x.toString() + " -y : " + sceneObj.y.toString() + " -width : " + sceneObj.width.toString() + " -height : " + sceneObj.height.toString());
			
			if(sceneObj instanceof DisplayObjectContainer)
								this.enumChildren(sceneObj, indentCnt +1);
		}	
	}
	
//***************** Debug *******************************		
	

	public showNext(fshow:boolean)
	{			
		// this.SnavPanel.SnextButton.showButton(fshow);		
	}

	
	public enableNext(fEnable:boolean)
	{			
		// this.SnavPanel.SnextButton.enableButton(fEnable);		
	}

	
	public enableBack(fEnable:boolean)
	{			
		// this.SnavPanel.SbackButton.enableButton(fEnable);		
	}

	
	public questionStart(evt:Event)
	{
		if(this.traceMode) CUtil.trace("Start of Question: ");
		
	}

	
	public questionComplete(evt:Event)
	{
		if(this.traceMode) CUtil.trace("Question Complete: ");
		
	}
	
	
	public goBackScene(evt:CEFNavEvent)
	{
		if(this.traceMode) CUtil.trace("Force Decrement Question: ");
		
		this.SnavPanel.onButtonPrev(null);
	}
	
	public goNextScene(evt:CEFNavEvent)
	{
		if(this.traceMode) CUtil.trace("Force Increment Question: ");
		
		this.SnavPanel.gotoNextScene();
		
	}
	
	
	public goToScene(evt:CEFNavEvent)
	{
		if(this.traceMode) CUtil.trace("Force Increment Question: ");
		
		this.SnavPanel.goToScene(evt.wozNavTarget);			
	}

	
	
//***************** Debug *******************************		
		
	protected dumpTutors() : void
	{
		if(this.traceMode) CUtil.trace("\n*** Start root dump ALL tutors ***");
		
		for(let tutor of this.tutorAutoObj)
		{
			if(this.traceMode) CUtil.trace("TUTOR : " + tutor);
		
			if(this.tutorAutoObj[tutor].instance instanceof TTutorContainer) 
			{
				if(this.traceMode) CUtil.trace("CEF***");
				
				this.tutorAutoObj[tutor].instance.dumpScenes(this.tutorAutoObj[tutor]);
			}				
		}			
		
		if(this.traceMode) CUtil.trace("*** End root dump tutor structure ***");			
	}

//***************** Debug *******************************		
 
}
