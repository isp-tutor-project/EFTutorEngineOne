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

import { CEFRoot } 	    	from "./CEFRoot";	
import { CEFDoc }			from "./CEFDoc";
import { CEFObject } 	    from "./CEFObject";	
import { CEFCursorProxy } 	from "./CEFCursorProxy";	
import { CEFTransitions } 	from "./CEFTransitions";	
import { CEFNavigator } 	from "./CEFNavigator";	
import { CEFTimeStamp } 	from "./CEFTimeStamp";	
import { CEFScene } 		from "./CEFScene";
import { CEFSceneSequence } from "./CEFSceneSequence";
import { CEFTitleBar } 		from "./CEFTitleBar";

import { CEFScene0 } 		from "../thermite/scene/CEFScene0";

import { CEFEvent } 		from "../events/CEFEvent";
import { CEFNavEvent } 		from "../events/CEFNavEvent";
import { CEFMouseEvent } 	from "../events/CEFMouseEvent";

import { CEFKTNode } 		from "../kt/CEFKTNode";
import { CLogManagerType } 	from "../managers/CLogManagerType";
import { CEFKeyboardEvent } from "../events/CEFKeyboardEvent";

import { CUtil } 			from "../util/CUtil";


import MovieClip     		  = createjs.MovieClip;
import DisplayObject 		  = createjs.DisplayObject;
import DisplayObjectContainer = createjs.Container;
import Tween 				  = createjs.Tween;


export class CEFTutorRoot extends CEFRoot 
{	   
	
	//************ Standard Stage Symbols
	
	public StitleBar:CEFTitleBar;
	public SnavPanel:CEFNavigator;
	public Sscene0:CEFScene0;
			
	//************ Standard Stage Symbols
	
			
//*** Tutor Customization Flags

	// Current feature vector
	
	private fFeatures:Array<string> = new Array<string>();			
	private fDefaults:Array<string> = new Array<string>();			
	
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
	public scenePtr:Array<CEFScene>   	 = new Array;
	
	// Playback support
	
	public stateStack:Array<any> = new Array();
				
	// Global Mouse Cursor
	//
	public 	 cCursor:CEFCursorProxy;		
	
	public   sceneCnt:number   		   	= 0;							// Total number of scenes	

	public   tutorAutoObj:any;											// This allows us to automate non-WOZ objects - They have no code behind and therefore no local variables to store initial state
	public   xitions:CEFTransitions 	= new CEFTransitions;			// This is the tutor transition object

			  replayIndex:Array<number> 	= new Array;
			  replayTime:number    			= 0;
	
			Running:Array<Tween> 			= new Array();
			runCount:number  				= 0;
			
			// Playback counters
			//
			  baseTime:number;
			
			// knowledge tracing 
			public 	 ktNets:any				= {};				// deprecated Aug 28 2013
			public   ktSkills:any;										//@@ Mod Aug 28 2013 - support for new kt structure in sceneGraph
	
	private sceneGraph:string = "<sceneGraph/>";						// export purposes only  
	
	
	/**
	 * CEFTutorRoot constructor
	 */
	constructor()
	{
		super();

		this.traceMode = false;
		
		if (this.traceMode) CUtil.trace("CEFTutorRoot:Constructor");						
		
		//*** Init the Tutor Global Variables
		
		CEFRoot.gTutor       = this;						// Connect to the Tutor
		this.tutorAutoObj = {};						// Create the Automation Object			
	}
	
	public resetZorder()
	{
			this.StitleBar.setTopMost();			
			this.Sscene0.setTopMost();				
	}
	
	//@@ debug - for building XML spec of Tutor spec only - captureSceneGraph
	public captureSceneGraph() : void
	{		
		//System.setClipboard(sceneGraph);		
	}
	
	// generate the working feature set for this instance
	//
	public setTutorDefaults(featSet:string) : void
	{
		let feature:string;
		let featArray:Array<string> = featSet.split(":");
		
		this.fDefaults = new Array<string>();
		
		for(let feature of featArray)
		{
			this.fDefaults.push(feature);
		}
	}
			
	// generate the working feature set for this instance
	//
	public setTutorFeatures(featSet:string) : void
	{
		let feature:string;
		let featArray:Array<string> = new Array;
		
		if(featSet.length > 0)
			featArray = featSet.split(":");
		
		this.fFeatures = new Array<string>();

		// Add default features 
		
		for (let feature of this.fDefaults)
		{
			this.fFeatures.push(feature);
		}

		// Add instance features 
		
		for (let feature of featArray)
		{
			this.fFeatures.push(feature);
		}
	}

	// get : delimited string of features
	//## Mod Oct 16 2012 - logging support
	//
	public get features() : string
	{			
		// Add new features - no duplicates
		
		return this.fFeatures.join(":");
	}
	
	// set : delimited string of features
	//## Mod Dec 03 2013 - DB state support
	//
	public set features(ftrSet:string) 
	{			
		// Add new features - no duplicates
		
		this.fFeatures = ftrSet.split(":");
	}

	
	// udpate the working feature set for this instance
	//
	public set addFeature(feature:string) 
	{			
		// Add new features - no duplicates
		
		if(this.fFeatures.indexOf(feature) == -1)
		{
			this.fFeatures.push(feature);
		}
	}
	
	// udpate the working feature set for this instance
	//
	public set delFeature(feature:string)
	{
		let fIndex:number;
		
		// remove features - no duplicates
		
		if((fIndex = this.fFeatures.indexOf(feature)) != -1)
		{
			this.fFeatures.splice(fIndex,1);
		}
	}
	
	//## Mod Jul 01 2012 - Support for NOT operation on features.
	//
	//	
	private testFeature(element:any, index:number, arr:Array<string>) : boolean
	{
		if(element.charAt(0) == "!")
		{
			return (this.fFeatures.indexOf(element.substring(1)) != -1)? false:true;
		}
		else
			return (this.fFeatures.indexOf(element) != -1)? true:false;
	}
	
	
	// test possibly compound features
	//
	public testFeatureSet(featSet:string) : boolean
	{
		let feature:string;
		let disjFeat:Array<string> = featSet.split(":");	// Disjunctive features
		let conjFeat:Array<string>;							// Conjunctive features
		
		// match a null set - i.e. empty string means the object is not feature constrained
		
		if(featSet == "")
				return true;
		
		// Check all disjunctive featuresets - one in each element of disjFeat
		// As long as one is true we pass
		
		for (let feature of disjFeat)
		{
			conjFeat = feature.split(",");
			
			// Check that all conjunctive features are set in fFeatures 
			
			if(conjFeat.every(this.testFeature))
									return true;
		}			
		return false;
	}				

	
	// udpate the working feature set for this instance
	//
	public traceFeatures() : void
	{			
		CUtil.trace(this.fFeatures);
	}		
	
	
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
		let ClassRef:any = CEFRoot.getDefinitionByName(sceneClass);
		
		tarScene = new ClassRef();			
		
		if (this.traceMode) CUtil.trace("Creating Scene : "+ sceneName);
		
		this.addChild(tarScene);

		//enumChildren(tarScene,0);				//@@ Debug display list Test May 10 2014
		//enumScenes();							//@@ Debug display list Test Oct 29 2012
		
		//gTruck.add(tarScene);					//@@ Debug memory test May 27 2010
		
		tarScene.visible = false;				
		tarScene.stop();						

		//## Mod Aug 10 2012 - must wait for initializeScenes to ensure basic scenes are in place now that 
		//					   we allow dynamic creation of the navPanel etc.
		//## Mod Oct 29 2012 - add sceneVisible - once scene has been created hasOwnProperty(sceneName) will return 
		//                                        true even if scene is destroyed - as in demo mode - in demo reentering scene 
		//										  cause scene to appear before transitionIN
		
		if(sceneVisible)
		{
			(this as any)[sceneName]  = tarScene;
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
		let wozObj:CEFObject;
		
		if(sceneObj != null)
		{
			sceneObj.removeEventListener("Start", this.questionStart);
			sceneObj.removeEventListener("Done", this.questionComplete);
			sceneObj.removeEventListener(CEFNavEvent.WOZNAVBACK, this.goBackScene);
			sceneObj.removeEventListener(CEFNavEvent.WOZNAVNEXT, this.goNextScene);
			sceneObj.removeEventListener(CEFNavEvent.WOZNAVTO  , this.goToScene);			
			
			// Recurse WOZ Children
			//
			if(sceneObj instanceof CEFObject)
			{
				wozObj = sceneObj as CEFObject;			// Coerce the Object					
				// wozObj.removeAllListeners(true); 		// Cleanup listeners  @@FLAG
				
				wozObj.Destructor();					// Object cleanup 				
			}								
			
			this.removeChild(sceneObj);
		}
		
		if (this.traceMode) CUtil.trace("Destroying Scene : "+ sceneName);
		
		if(this.hasOwnProperty(sceneName))
		{
			(this as any)[sceneName] = null;
			
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
		
		(this as any)[sceneName] = sceneObj;		
		
		if(nameObj)									// Can't rename an object placed in Flash
			(this as any)[sceneName].name = sceneName;
		
		// Attach the navigator to the scene itself - let it know what navigation object to use when NAV events occur
		
		if(sceneObj instanceof CEFSceneSequence)
			sceneObj.connectNavigator(this.SnavPanel);
		
		// Record each SCENE Object
		//
		this.tutorAutoObj[sceneName] = {};
		this.tutorAutoObj[sceneName].instance = sceneObj;			
		
		// Propogate to children  
		//
		sceneObj.initAutomation(sceneObj, this.tutorAutoObj[sceneName], "", this.gLogR, this);								
		
		// Capture the initial state for replay reset
		// Fire the restore - it does instance specific initializations
	
		sceneObj.captureDefState(this.tutorAutoObj[sceneName] );	
		sceneObj.restoreDefState(this.tutorAutoObj[sceneName] );	
		
		// Reset the Z order
		
		this.resetZorder();		
	}
	
	
	public instantiateKT() : void
	{
		// Parse the Tutor.config for preenter procedures for this scene 
		
		if((CEFRoot.gSceneConfig != null) && (CEFRoot.gSceneConfig.ktnets != undefined))			
				this.loadKTNets(CEFRoot.gSceneConfig.ktnets);				
	}
	
	/**
	 * 
	 * @param	tarXML
	 */
	public loadKTNets(tarXML:any ) : void
	{						
		for(let ktnet of tarXML)
		{
			this.ktNets[ktnet.name] = new CEFKTNode;
			
			this.ktNets[ktnet.name].loadXML(ktnet);
		}
	}
	
	
//***************** XML State Management *******************************	

	public recurseXML(xmlNodes:Array<any>, xmlTar:any, newVal:string ) : string
	{
		let xml:any = xmlTar;
		let ndx:number;
		let len:number = xmlNodes.length;
		let attr:string;
		let node:string
		let value:string;
		
		for(let nodeId:number = 0 ; nodeId < len ; nodeId++)
		{
			if(xmlNodes[nodeId] == '@')
			{
				attr = xmlNodes[nodeId+1];
				
				if (this.traceMode) CUtil.trace(typeof(xml[attr]));
				if (this.traceMode) CUtil.trace(xml[attr]);
				
				(newVal != null)? xml[attr] = value = newVal : value = xml[attr];
				nodeId++;
			}
			else
			{
				node = xmlNodes[nodeId];
				
				if((nodeId + 1) < len)
				{
					attr = xmlNodes[nodeId+1];
					
					if(isNaN( Number(attr as String)))
					{
						xml = xml[node];
					}
					else
					{
						ndx = Number(attr as String);
						
						if((nodeId + 2) < len)
							xml = xml[node][ndx];
						else 
							(newVal != null)? xml[node][ndx] = value = newVal : value = xml[node][ndx];
							
						nodeId++;
					}
				}
				else
					(newVal != null)? xml[node] = value = newVal : value = xml[node];
			}
		}
		
		if(this.traceMode) CUtil.trace("Final Result: " + value);
		
		return value;
	}
	
	// Set the state value for the xmlSpec if newVal != null
	// Otherwise it just returns the current value
	//
	public state(xmlSpec:string, newVal:string = null ) : string
	{			
		let nodeArray:Array<any>;
			
		nodeArray = xmlSpec.split(".");
			
		if(this.traceMode) CUtil.trace("Node Array: " + nodeArray);

		return this.recurseXML(nodeArray, CEFTutorRoot.gSceneConfig.state[0], newVal);
	}

	
	// Set the scene value for the xmlSpec if newVal != null
	// Otherwise it just returns the current value
	//
	public scene(xmlSpec:string, newVal:string = null ) : string
	{			
		let nodeArray:Array<any>;
			
		nodeArray = xmlSpec.split(".");
			
		if(this.traceMode) CUtil.trace("Node Array: " + nodeArray);

		return this.recurseXML(nodeArray, CEFTutorRoot.gSceneConfig.scenedata[0], newVal);
	}

	
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
		dispatchEvent(new Event(CEFRoot.WOZCANCEL));
		dispatchEvent(new Event(CEFRoot.WOZREPLAY));
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
		this.dispatchEvent(new Event(CEFTutorRoot.WOZPAUSING));
		
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
		this.dispatchEvent(new Event(CEFTutorRoot.WOZPLAYING));			
		
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
	public playRemoveThis(wozObj:CEFRoot ):void 
	{
		if (this.traceMode) CUtil.trace(" playRemoveThis : ", wozObj.name, this.playing.length);		
		
		for (let i1:number = 0 ; i1 < this.playing.length ; i1++)
		{
			if (this.playing[i1] == wozObj)
			{
				// the interface is now in a new state - 
				
				CEFDoc.gApp.incStateID();
			
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
	public playAddThis(wozObj:CEFRoot ):void 
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
		this.StitleBar.Spause.visible = fShow;
	}

	/**
	 * 
	 * @param	fShow
	 */
	public showReplay(fShow:boolean) : void
	{
		this.StitleBar.Sreplay.visible = fShow;
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
			this.cCursor = new CEFCursorProxy;
			this.cCursor.visible = false;
			
			CEFRoot.gTutor.addChild(this.cCursor);			
		}
		
		this.cCursor.initWOZCursor(CEFCursorProxy.WOZLIVE);				
		this.cCursor.show(false);
	}

//***************** Mouse Cursor Management *******************************		
	
//***************** Automation *******************************		

	public initAutomation(tutorObj:Object) : void
	{				
		if(this.traceMode) CUtil.trace("Init Automation:");
		
		// Point the transitions / NavPanel
		//  	to this tutor in the automation array
		//
		this.xitions.connectToTutor(this, this.tutorAutoObj);									
		this.SnavPanel.connectToTutor(this, this.tutorAutoObj);			
		
	}

	
	//****** Initialize the scene configurations - Add Audio etc.
	
	public initializeScenes() : void
	{
		// override in Tutor to initialize tutor specific scene variables
	}

	
	// Walk the WOZ Objects to capture their default state
	//
	public captureDefState(Tutor:any ) : void 
	{
		if(this.traceMode) CUtil.trace("\t*** Start Capture - Walking Scenes***");

		for(let scene in Tutor)
		{
			if(this.traceMode) CUtil.trace("\tSCENE : " + scene);
			
			if(scene != "instance" && Tutor[scene].instance instanceof CEFScene)
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
			
			if(scene != "instance" && Tutor[scene].instance instanceof CEFScene)
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

		this.cCursor.initWOZCursor(CEFCursorProxy.WOZREPLAY);	
		this.cCursor.setCursorStyle("Sautomate");
		this.cCursor.setTopMost();
		this.cCursor.show(true);			
		this.cCursor.initPlayBack();						// reset the Playback timer
		
		// Save the current tutor state
		// Note: during playback no logging takes place
		
		this.stateStack.push(this.baseTime);
		this.stateStack.push(CEFDoc.gApp.stateID);
		this.stateStack.push(CEFDoc.gApp.frameID);
		this.stateStack.push(this.gLogR.fLogging);				// Remember the logger flag prior to playback
		
		this.gLogR.fLogging = CLogManagerType.RECLOGNONE;		// stop logging/recording
		
		// Prep the Playback source.
		//			
		this.gLogR.setPlayBackSource(pbSource);
		
		if(pbSource[0].version == "1") 
		{
			this.gLogR.normalizePlayBackTime();
			
			// Set the normalization constant for the realtime calculations

			this.baseTime = CUtil.getTimer();
		
			addEventListener(CEFEvent.ENTER_FRAME, this.playBackByTime);
			
			// In demo mode any key will abort playback and return to demo menu
			
			if(CEFTutorRoot.fDemo)
			{
				this.stage.addEventListener(CEFKeyboardEvent.KEY_UP, this.abortPlayBack);
				this.stage.addEventListener(CEFMouseEvent.CLICK, this.abortPlayBack2);
			}
		}
		else if(pbSource[0].version == "2")
		{
			this.gLogR.normalizePlayBack();
			
			// Disconnect the tutor frame counter - handed off to the playback unit

			CEFDoc.gApp.connectFrameCounter(false);
			
			addEventListener(CEFEvent.ENTER_FRAME, this.playBackByFrame);
		}
	}
	
	
	// Replay the live Events stream 
	//
	public replayStream(evt:CEFNavEvent) : void 
	{
		if(this.traceMode) CUtil.trace("\t*** Start - Replay Stream ***");
		
		this.cCursor.initWOZCursor(CEFCursorProxy.WOZREPLAY);				
		this.cCursor.show(true);			
		this.cCursor.initPlayBack();						// reset the Playback timer
					
		this.restoreDefState(this.tutorAutoObj);
		
		// Save the current tutor state
		// Note: during playback no logging takes place
		
		this.stateStack.push(this.baseTime);
		this.stateStack.push(CEFDoc.gApp.stateID);
		this.stateStack.push(CEFDoc.gApp.frameID);
		this.stateStack.push(this.gLogR.fLogging);				// Remember the logger flag prior to playback
		
		this.gLogR.fLogging= CLogManagerType.RECLOGNONE;	// stop logging/recording
		
		// Prep the Playback source.

		this.gLogR.setPlayBackSource(null);
		this.gLogR.normalizePlayBack();

		// Disconnect the tutor frame counter - handed off to the playback unit

		CEFDoc.gApp.connectFrameCounter(false);
			
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
		
		this.cCursor.initWOZCursor(CEFCursorProxy.WOZREPLAY);				
		this.cCursor.setCursorStyle("Sautomate");
		this.cCursor.setTopMost();
		this.cCursor.show(true);			
		this.cCursor.initPlayBack();						// reset the Playback timer
					
		this.restoreDefState(this.tutorAutoObj);
		
		// Save the current tutor state
		// Note: during playback no logging takes place
		
		this.stateStack.push(this.baseTime);
		this.stateStack.push(CEFDoc.gApp.stateID);
		this.stateStack.push(CEFDoc.gApp.frameID);
		this.stateStack.push(this.gLogR.fLogging);				// Remember the logger flag prior to playback
		
		this.gLogR.fLogging= CLogManagerType.RECLOGNONE;	// stop logging/recording
		
		// Prep the Playback source.
		//			
		this.gLogR.setPlayBackSource(null);
		this.gLogR.normalizePlayBack();
		
		// Disconnect the tutor frame counter - handed off to the playback unit

		CEFDoc.gApp.connectFrameCounter(false);
		
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
		this.gLogR.setPlayBackDone(true);	
		dispatchEvent(new Event("interruptPlayBack"));
	}

	/**
	 * set flag to end playback on next frame
	 */
	private abortPlayBack2(evt:MouseEvent) : void
	{
		this.gLogR.setPlayBackDone(true);
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

		if(this.gLogR.playBackDone())
		{
			if(this.traceMode) CUtil.trace("-- Playback Completed -- ");
			
			removeEventListener(CEFEvent.ENTER_FRAME, this.playBackByFrame);
							
			this.cCursor.initWOZCursor(CEFCursorProxy.WOZLIVE);		
			this.cCursor.setCursorStyle("Sstandard");
			this.cCursor.show(false);
			
			dispatchEvent(new Event("endPlayBack"));
			
			// restore the tutor state
			// Note: during playback no logging takes place
			
			this.gLogR.fLogging = this.stateStack.pop();	
			CEFDoc.gApp.frameID = this.stateStack.pop();
			CEFDoc.gApp.stateID = this.stateStack.pop();
			this.baseTime       = this.stateStack.pop();			
			
			// Reconnect the tutor frame counter - handed off to the playback unit

			CEFDoc.gApp.connectFrameCounter(true);		
		}		

		//**** Otherwise playback the next event(s) in sequence
		
		else
		{
			// wait until we have reached the state for the next event
			//
			// CEFDoc.gApp.stateID is the current state of the interface
			// nextEventState is the state when the next event will happen - at some frame within this state
			//
			// Note1: We reset the frameID on each state change so events happen relative to a state change
			//
			// Note2: non-event driven state changes (video / animation events) may need to complete 
			//       before we continue.
			
			nextEventState = this.gLogR.getNextEventState();
			
			// once we reach the state start checking frames for events 
			
			if (this.traceMode) CUtil.trace("CEFDoc.gApp.stateID: " + CEFDoc.gApp.stateID + "  - nextEventState:" + nextEventState);
			
			//if(CEFDoc.gApp.stateID >= nextEventState)
			{				
				// Now we fire all the events that occured in this frame (in sequence)
				
				do
				{
					wozEvt = this.gLogR.getNextEvent(CEFDoc.gApp.stateID, CEFDoc.gApp.frameID);
				
					if(wozEvt != null)
					{
						if (this.traceMode) CUtil.trace("-- Executing Frame:" + CEFDoc.gApp.frameID + " -- EVT -- " + wozEvt);

						// fire the event - this handles mouse and text event types
						
						this.cCursor.playBackAction(wozEvt );	
					}
					
				}while(wozEvt != null);
				
				// In replay we only increment the frameID once we have reached the next event state - 
				// this maintains synchronization with movieclips that may be running fast or slow relative
				// to the frame they occured in the live session.
				
				CEFDoc.gApp.incFrameID();				
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
			wozEvt = this.gLogR.getActionEvent(frameTime);
			
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
		wozEvt = this.gLogR.getMoveEvent(frameTime);
		
		if(wozEvt != null)
		this.cCursor.playBackMove(wozEvt, frameTime );	

		// If playback is finished remove onFrame action and restore mouse cursor
		//
		if(this.gLogR.playBackDone())
		{
			if(this.traceMode) CUtil.trace("-- Playback Completed -- ");
			
			removeEventListener(CEFEvent.ENTER_FRAME, this.playBackByTime);
							
			this.cCursor.initWOZCursor(CEFCursorProxy.WOZLIVE);		
			this.cCursor.setCursorStyle("Sstandard");
			this.cCursor.show(false);
			
			dispatchEvent(new Event("endPlayBack"));
			
			// restore the tutor state
			// Note: during playback no logging takes place
			
			this.gLogR.fLogging = this.stateStack.pop();	
			CEFDoc.gApp.frameID = this.stateStack.pop();
			CEFDoc.gApp.stateID = this.stateStack.pop();
			this.baseTime       = this.stateStack.pop();
			
			// Reconnect the tutor frame counter - handed off to the playback unit

			CEFDoc.gApp.connectFrameCounter(true);				
							
			// In demo mode any key will abort playback 
			
			if(CEFTutorRoot.fDemo)
			{
				this.stage.removeEventListener(CEFKeyboardEvent.KEY_UP, this.abortPlayBack);
				this.stage.removeEventListener(CEFMouseEvent.CLICK, this.abortPlayBack2);
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
			
			if(scene != "instance" && Tutor[scene].instance instanceof CEFObject)
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
		this.SnavPanel.SnextButton.showButton(fshow);		
	}

	
	public enableNext(fEnable:boolean)
	{			
		this.SnavPanel.SnextButton.enableButton(fEnable);		
	}

	
	public enableBack(fEnable:boolean)
	{			
		this.SnavPanel.SbackButton.enableButton(fEnable);		
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
	
}
