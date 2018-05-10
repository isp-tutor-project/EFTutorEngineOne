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

import { CTutorGraph } 		from "./CTutorGraph";
import { CTutorScene } 		from "./CTutorScene";
import { CTutorHistory } 	from "./CTutorHistory";
import { CTutorHistoryNode} from "./CTutorHistoryNode";

import { CEFTutorDoc } 		from "../core/CEFTutorDoc";
import { CEFNavigator } 	from "../core/CEFNavigator";

import { TRoot } 			from "../thermite/TRoot";
import { TScene } 			from "../thermite/TScene";

import { TMouseEvent } 		from "../thermite/events/TMouseEvent";

import { CEFEvent } 		from "../events/CEFEvent";

import { MObject } 			from "../mongo/MObject";
import { CMongo } 			from "../mongo/CMongo";

import { CONST }            from "../util/CONST";
import { CUtil } 			from "../util/CUtil";


import Event 		  = createjs.Event;
import Ticker 		  = createjs.Ticker;



/**
* ...
*/
export class CTutorGraphNavigator extends CEFNavigator
{		
	private _history:CTutorHistory;				
	private _rootGraph:CTutorGraph;

	private _fTutorGraph:Boolean = true;

	private _tutorGraph:CTutorGraph;
	
	private _currScene:CTutorScene;
	private _nextScene:CTutorScene;
	private _prevScene:CTutorScene;
	
	private _xType:string;
	
	private _iterations:any = {};

	private _profileData:any;
	private _tickHandler:Function;
	
	
	/**
		* Creates a new CTutorGraphNavigator instance. 
		*/
	constructor(_tutorDoc:IEFTutorDoc)
	{
		super(_tutorDoc);			
	}
	
	
	public get sceneObj() : TScene
	{
		return (this._rootGraph.sceneInstance() as TScene);
	}
	
	
	/**
		* returns the current scenes iteration count
		*/
	public get iteration() : string
	{
		let iCount:string;
		
		try
		{
			iCount = this._iterations[this._currScene.scenename].toString();
		}
		catch(err)
		{
			iCount = "uninitialized";
		}
		
		return iCount;
	}
	
	
	private updateSceneIteration() : void
	{
		if(this._iterations[this._currScene.scenename] == undefined)
		{
			this._iterations[this._currScene.scenename] = 1;
		}
		else
		{
			if(!this.tutorDoc.testFeatureSet("NO_ITER"))
				this._iterations[this._currScene.scenename]++;
		}		
	}
	
	
	/**
		*  initializes the root tutorGraph instance 
		*/
	public static rootFactory(_tutorDoc:IEFTutorDoc, factory:any) : CTutorGraphNavigator
	{	
		let tutorNav 	  = new CTutorGraphNavigator(_tutorDoc);				
		tutorNav._history = new CTutorHistory(_tutorDoc);
		
		if(factory['history'] != null)
		{
			tutorNav._history.volatile = (factory['history'] == "volatile")? true:false; 
		}
		
		// Generate the global tutor graph
		
		tutorNav._rootGraph = CTutorGraph.factory(_tutorDoc, null, "root", factory); 
		
		// Init the position in the currGraph
		
		tutorNav._rootGraph.seekRoot();

		// Note: initial scene update is done out of launchTutors

		return tutorNav;
	}
	
	
	// pass the name of the target scene and the type of the transition
	//
//		public goToScene(tutorGraphID:string) : void
//		{
//			_xType = "WOZGOTO";
//
//			// Find the ordinal for the requested scene Label
//			//
//			_nextScene = tutorGraph.seekTo(nxtScene);			
//						
//		//	seekToScene(nxtScene);
//		}


	/**
	 * Used to set the nextButton 
	 */
	public set buttonBehavior(action:String) 
	{
		if(action == CONST.GOTONEXTSCENE) this._fTutorGraph = true;
									else  this._fTutorGraph = false;
	}
		

	/**
		* ##Mod Sep 09 2013 - Wait until nothing is happening and then kill the session
		* 					   We don't want to kill it in the middle of scene creation 	
		* 
		*/
	private enQueueTerminateEvent() : void
	{			
		this.on(CEFEvent.ENTER_FRAME, this._deferredTerminate);
	}
	
	private _deferredTerminate(e:Event) : void
	{			
		this.off(CEFEvent.ENTER_FRAME, this._deferredTerminate);
		
		this.tutorDoc.log.logTerminateEvent();
	}
	
	
	
	/**
		* gotoNextScene Event driven entry point
		* @param	evt
		*/
	public onButtonNext(evt:TMouseEvent) : void
	{
		this.dispatchEvent(new Event("NEXT_CLICK",false,false));

		// Do button clicks synchronously
		
		this.traceGraphEdge();
	}		

	
	/**
		* 	recoverState - called from CONST.launchTutors to restart an interrupted session
		*/
	public recoverState() : void
	{			
		// Do the scene Transition 
		
		this._xType = "WOZNEXT";
		
		this._rootGraph.recoverSkills(this.tutorDoc.sessionAccount.session.profile.stateData.ktSkills);
		
		this.tutorDoc._globals 		= this.tutorDoc.sessionAccount.session.profile.stateData.globals;
		this.tutorDoc.features 		= this.tutorDoc.sessionAccount.session.profile.stateData.features;
		this.tutorDoc._phaseData    = this.tutorDoc.sessionAccount.session.profile.stateData.data;
		
		this.seekToScene(this._rootGraph.restoreGraph(this.tutorDoc.sessionAccount.session.profile.stateData.tutorGraph));
	}

	
	/**
		* gotoNextScene manual entry point
		*/
	public gotoNextScene() : void
	{
		// Do automated scene increments asynchronously to allow
		// actiontrack scripts to complete prior to scene nav
		
		this._tickHandler = Ticker.on(CEFEvent.ENTER_FRAME, this._deferredNextScene, this);
	}
	
	private _deferredNextScene(evt:Event) : void
	{			
		Ticker.off(CEFEvent.ENTER_FRAME, this._tickHandler);
					
		this.traceGraphEdge();
	}
	
	/**
		* gotoNextScene Event driven entry point
		* @param	evt
		*/
	private traceGraphEdge() : void
	{
		let historyNode:CTutorHistoryNode;
		let nextScene:CTutorScene;
		let scene:TScene = this._rootGraph.sceneInstance() as TScene;
		
		try
		{
			// debounce the next button - i.e. disallow multiple clicks on same next instance  			
			// protect against recurrent calls			
			
			if(this._inNavigation) 
						return;
			
			this._inNavigation = true;
			
			// The next button can target either the tutorgraph or the animationgraph.
			// i.e. You either want it to trigger the next step in the animationGraph or the tutorgraph
			// reset _fTutorGraph if you want the next button to drive the animationGraph
			//      
			if(this._fTutorGraph || scene == null || scene.nextGraphAnimation(true) == null)
			{
				// If we are not at the head end of the history then use the historic 'next'.
				// i.e. non-volatile history moves forward past the exact same sequence
				// we back tracked through
				
				historyNode = this._history.next();
				
				// If we are at the HEAD of the history step through the tutorgraph
				
				if(historyNode == null)
				{
					nextScene = this._rootGraph.nextScene();
					
					if(this._currScene != nextScene && nextScene != null)
					{
						this._history.push(this._rootGraph.node, nextScene);
					}
					
					else if(nextScene == null)
						this.enQueueTerminateEvent();
				}
				
				// if the history is non-volatile we go forward the same way we went back
				
				else
				{
					// Set the scene we go to next
					
					nextScene = historyNode.scene;				
				}
				
				// Do the scene Transition 
				
				this._xType = "WOZNEXT";
				
				if(this._currScene != nextScene && nextScene != null)
				{
					this.seekToScene(nextScene);
				}

				// We aren't going to be navigating so reset the flag to allow 
				// future attempts.
				
				else
				{
					this._inNavigation = false;
				}
			}
			else
			{
				this._inNavigation = false;
			}
		}
		catch(err)
		{
			CUtil.trace("CONST.traceGraphEdge: " + err.toString());
			
			let logData:Object = {'location':'traceGraphEdge', 'message':err.toString()};
			
			this.tutorDoc.log.logErrorEvent(logData);
		}				
	}

	
	/**
		* prevScene Event driven entry point
		* @param	evt
		*/
	public onButtonPrev(evt:TMouseEvent) : void
	{			
		let historyNode:CTutorHistoryNode;
		let features:string;

		try
		{
			// debounce the back button - i.e. disallow multiple clicks on same instance  
			// protect against recurrent calls
			
			if(this._inNavigation) 
				return;
			
				this._inNavigation = true;
			
			// If we are not at the end of the history then step back.
			// Note we support historic scenes no longer being visitable.
			// i.e. We can set a feature so a scene will only be visited once.
			
			do
			{
				historyNode = this._history.back();
				
				// If we are at the root of the history - stop
				
				if(historyNode != null)
				{					
					features = historyNode.scene.features;
					
					// If scene no longer matches the feature set skip it
					
					if(features != "")
					{
						if(!this.tutorDoc.testFeatureSet(features))
						{
							continue;
						}
					}
					
					// if the history is volatile we need to update the node and scene that
					// the tutorgraph is working with since when we start moving forward again 
					// we may not visit the same scenes/nodes
					//
					// If it is non-volatile we go whereever the history takes us.
					
					if(this._history.isVolatile)
					{
						// Seek the scene graph to the historic node/scene because we may take 
						// a different path when going forward again
						
						this._rootGraph.node  = historyNode.node;
						this._rootGraph.scene = historyNode.scene;
					}
					
					// Do the scene Transition 
					
					this._xType = "WOZBACK";
					
					this.seekToScene(historyNode.scene);
					
					break;					
				}
				
				// We aren't going to be navigating so reset the flag to allow 
				// future attempts.
				
				else
				{
					this._inNavigation = false;
				}
				
			}while(historyNode != null)					
		}
		catch(err)
		{
			CUtil.trace("CONST.onButtonPrev: " + err.toString());
			
			let logData:Object = {'location':'onButtonPrev', 'message':err.toString()};
			
			this.tutorDoc.log.logErrorEvent(logData);
		}
	}		
	
	
	/**##Mod Sep 01 2013 - We don't want to flip scenes when we are potentially
		*                     running code inside one so defer calls until after ActionTracks are finished
		*  
		* 		Pass the name of the target scene and the type of the transition
		* 		The transition type may be deprecated at this point - Jul 19 2013
		* 		Historically "WOZGOTO" "WOZNEXT" "WOZBACK"
		* 
		*/
	private seekToScene(nextScene:CTutorScene) : void
	{			
		let _progressData:any;
		
		try
		{
			this._nextScene = nextScene;

//			if(this.traceMode) CUtil.trace("Nav To: " + nextScene);
			
			let logData:Object;
						
			// In demo mode we defer any demo button clicks while scene changes are in progress			
			if(this.tutorDoc.fDemo)
				this.tutorDoc.fDeferDemoClick = true;
						
			// remember current scene object			
			this._prevScene = this._currScene;
						
			// Do the exit behavior			
			if(this._currScene)
				this.tutorDoc.TutAutomator[this._currScene.scenename].instance.preExitScene(this._xType, 0);
						
			// Do scene Specific initialization 
			//
			//*** Create scene on demand
			//
			if(this.tutorDoc.TutAutomator[this._nextScene.scenename] == undefined)
			{
				this._nextScene.instantiateScene();
			}
			
			this.tutorDoc.TutAutomator[this._nextScene.scenename].instance.preEnterScene(this.tutorDoc.tutorContainer, this._nextScene.scenename, this._nextScene.title, this._nextScene.page, this._xType);
			
//@@ Action Logging
			
			if(this._currScene)
				logData = {'curscene':this._currScene.scenename, 'newscene':this._nextScene.scenename};
			else
				logData = {'curscene':'null', 'newscene':this._nextScene.scenename};
			
				this.tutorDoc.log.logNavEvent(logData);
			
//@@ Action Logging			


			// Process the - Onexit behaviors - This will process the XML logging specification for the currScene results
			
			if(this._currScene)
			{
				this.tutorDoc.TutAutomator[this._currScene.scenename].instance.onExitScene();
				
				//## Mod May 10 2014 - Support runtime scripting
				
				this.tutorDoc.TutAutomator[this._currScene.scenename].instance.doExitAction();					
			}				
			
//@@ Progress Logging

			// Only scenes which can act as starting points - i.e. are independent of other scenes are eligible for
			// progress logging

			// TODO: validate logging
			// if(this._nextScene.isCheckPoint)
			// {
			// 	// On the first pass we need to generate an object scaffold to hold the progress update packet.
			// 	// On subsequent passes we just need to change the value fields and add the stateData
				
			// 	// Note: a progress event is processed as a mongo update operation - so we must use
			// 	//       CObject and MObject types to define UPDATEABLE and REPLACEABLE Objects respectively
				
			// 	if(_progressData == null)
			// 	{
			// 		_progressData 	  = {};			
			// 		this._profileData = {};				 
																				
			// 		_progressData['reify']           = {}; 	// 'reify' is the portion that is parsed for update fields - it and any sub-documents  			
			// 		_progressData['reify']['phases'] = {};	// should be either CObjects, MObjects or AS3 primitive data types String, Number,int,Boolean,Null,void
					
			// 		_progressData['reify']['phases'][this.tutorDoc.sessionAccount.session.profile_Index] = this._profileData;
					
			// 		this._profileData['stateData']   = new MObject;			// Use an MObject to force replacement of entire stateData sub-document in MongoDB 
			// 	}
				
			// 	this._profileData.progress = CONST._INPROGRESS;								
				
			// 	this._profileData['stateData']['tutorgraph'] = this._rootGraph.captureGraph({});
				
			// 	this._profileData['stateData']['ktSkills']  = this.tutorDoc.ktSkills;
			// 	this._profileData['stateData']['globals']   = this.tutorDoc._globals;
			// 	this._profileData['stateData']['features']  = this.tutorDoc.features;
			// 	this._profileData['stateData']['data']  	= this.tutorDoc._phaseData;

			// 	this.tutorDoc.log.logProgressEvent(_progressData);
			// }
			
			
			//@@ Mod Mar 9 2015 - interrupt if connection lost
			//
			// Session manager listens to the tutor for these to ensure we don't get ahead of the logging. 
			
			if(!this.tutorDoc.log.connectionActive)
			{				
				this.tutorDoc.dispatchEvent(new Event("CONNECTION_LOST",false,false));
			}				
			
//@@ Progress Logging			
							
			// switch the curent active scene			
			this._currScene = this._nextScene;		
			
			// update the iteration count for this named scene 
			this.updateSceneIteration();
			
			// Do the actual scene transitions			
			this.xitions.on(CEFEvent.COMPLETE, this.doEnterScene, this);			
			this.xitions.gotoScene(this._nextScene.scenename);
		}
		catch(err)
		{
			CUtil.trace("CONST.seekToScene: " + err.toString());
			
			let logData:any = {'location':'seekToScene', 'message':err.toString()};
			
			this.tutorDoc.log.logErrorEvent(logData);
		}
	}
	
	
	// Performed immediately after scene is fully onscreen
	//@@ Mod Jul 18 2013 - public -> private
	//
	protected doEnterScene(evt:Event) : void
	{
		try
		{
			if(this.traceMode) CUtil.trace("doEnterScene: " , this.sceneCurr);
			
			evt.remove();						
			
			// increment the global frame ID - for logging 
			
			this.tutorDoc.incFrameNdx();
						
			//*** Destroy non persistent scenes
			//
			if(this._prevScene && !this._prevScene.persist)
			{
				this.tutorDoc.tutorContainer.destroyScene(this._prevScene.scenename);
				
				this._prevScene.destroyScene();
			}
			
			// Do scene Specific Enter Scripts
			//
			
			this.tutorDoc.TutAutomator[this._currScene.scenename].instance.onEnterScene(this._xType);
			
			//## DEBUG May 11 2014 - dump display list
			
			//_currScene.enumDisplayList();				
			
			//## Mod Sep 12 2013 - This is a special case to handle the first preenter event for an animationGraph. 
			//                     The root node of the animation graph is parsed in the preEnter stage of the scene
			//                     creation so the scene is not yet on stage. This call ensures that the scene
			//                     associated with the animation object has been instantiated.
			//                     
			//	TODO: This should be rationalized with the standard preEnter when all the preEnter customizations
			//        in CEFScene derivatives have been moved to the XML (JSON) spec. 		
			//
			this.tutorDoc.TutAutomator[this._currScene.scenename].instance.deferredEnterScene(this._xType);			
			
			// In demo mode defer demo clicks while scene switches are in progress
			
			if(this.tutorDoc.fDemo)
				this.tutorDoc.tutorContainer.dispatchEvent(new Event("deferedDemoCheck",false,false));
			
			//@@ Mod Sep 27 2011 - protect against recursive calls
			
			this._inNavigation = false;
		}
		catch(err)
		{
			CUtil.trace("doEnterScene: " + err.toString());
			
			let logData:Object = {'location':'doEnterScene', 'message':err.toString()};
			
			this.tutorDoc.log.logErrorEvent(logData);
		}
	}
	
}
