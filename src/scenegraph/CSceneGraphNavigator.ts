//*********************************************************************************
//                                                                        
//         CARNEGIE MELLON UNIVERSITY PROPRIETARY INFORMATION             
//  
//  This software is supplied under the terms of a license agreement or   
//  nondisclosure agreement with Carnegie Mellon University and may not   
//  be copied or disclosed except in accordance with the terms of that   
//  agreement.    
//  
//  Copyright(c) 2013 Carnegie Mellon University. All Rights Reserved.   
//                                                                        
//  Author(s): Kevin Willows                                                           
//  
//  History: File Creation 07/18/2013 
//                                                                        
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//
//*********************************************************************************


//** Imports

import { CSceneGraph } 		from "./CSceneGraph";
import { CGraphScene } 		from "./CGraphScene";
import { CGraphHistory } 	from "./CGraphHistory";

import { CEFSceneSequence } from "../core/CEFSceneSequence";
import { CEFNavigator } 	from "../core/CEFNavigator";
import { CEFEvent } 		from "../events/CEFEvent";

import { CUtil } 			from "../util/CUtil";
import { CEFRoot } from "../core/CEFRoot";
import { CEFMouseEvent } from "../events/CEFMouseEvent";




/**
* ...
*/
export class CSceneGraphNavigator extends CEFNavigator
{		
	private static _history:CGraphHistory;				
	private static _rootGraph:CSceneGraph;
	private static _fSceneGraph:boolean = true;
	
	public static readonly GOTONEXTSCENE:string     = "incSceneGraph";
	public static readonly GOTONEXTANIMATION:string = "incAnimationGraph";
	
	private _sceneGraph:CSceneGraph;
	
	private _currScene:CGraphScene;
	private _nextScene:CGraphScene;
	private _prevScene:CGraphScene;
	
	private _xType:string;
	
	private _iterations:Object = new Object;

	private _progressData:Object;
	private _profileData:Object;
	
	
	/**
		* Creates a new CSceneGraphNavigator instance. 
		*/
	constructor()
	{
		super();			
	}
	
	
	public get sceneObj() : CEFSceneSequence
	{
		return (CSceneGraphNavigator._rootGraph.sceneInstance() as CEFSceneSequence);
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
			if(!CEFRoot.gTutor.testFeatureSet("NO_ITER"))
				this._iterations[this._currScene.scenename]++;
		}		
	}
	
	
	/**
		*  initializes the root sceneGraph instance 
		*/
	public static rootGraphFactory(factory:Object) : void
	{
		let scene:CGraphScene; 
		
		this._history = new CGraphHistory();
		
		if(factory['history'] != null)
		{
			this._history.volatile = (factory['history'] == "volatile")? true:false; 
		}
		
		// Generate the global scene graph
		
		CSceneGraphNavigator._rootGraph = CSceneGraph.factory(null, "root", factory); 
		
		// Init the position in the currGraph
		
		CSceneGraphNavigator._rootGraph.seekRoot();

		// Note: initial scene update is done out of CEFDoc.launchTutors
		
		//			tutorAutoObj["SnavPanel"].instance.onButtonNext(null);
		//
		//			scene = CSceneGraphNavigator._rootGraph.nextScene();		
		//			this._history.push(CSceneGraphNavigator._rootGraph.node, scene);
	}
	
	
	// pass the name of the target scene and the type of the transition
	//
//		public goToScene(sceneGraphID:string) : void
//		{
//			_xType = "WOZGOTO";
//
//			// Find the ordinal for the requested scene Label
//			//
//			_nextScene = sceneGraph.seekTo(nxtScene);			
//						
//		//	seekToScene(nxtScene);
//		}


	/**
		* ##Mod Sep 09 2013 - Wait until nothing is happening and then kill the session
		* 					   We don't want to kill it in the middle of scene creation 	
		* 
		*/
	private enQueueTerminateEvent() : void
	{			
		addEventListener(CEFEvent.ENTER_FRAME, this._deferredTerminate);
	}
	
	private _deferredTerminate(e:Event) : void
	{			
		removeEventListener(CEFEvent.ENTER_FRAME, this._deferredTerminate);
		
		this.gLogR.logTerminateEvent();
	}
	
	
	
	/**
		* Used to set the nextButton 
		*/
	public static set buttonBehavior(action:string)
	{
		if(action == GOTONEXTSCENE) this._fSceneGraph = true;
							  else  this._fSceneGraph = false;
	}
	

	/**
		* gotoNextScene Event driven entry point
		* @param	evt
		*/
	public onButtonNext(evt:CEFMouseEvent) : void
	{
		dispatchEvent(new Event("NEXT_CLICK"));

		// Do button clicks synchronously
		
		this.traceGraphEdge();
	}		

	
	/**
		* 	recoverState - called from CEFDoc.launchTutors to restart an interrupted session
		*/
	public recoverState() : void
	{			
		// Do the scene Transition 
		
		this._xType = "WOZNEXT";

		CSceneGraphNavigator._rootGraph.parseSkills(sessionAccount.session.profile.stateData.ktSkills);
		
		globals         = sessionAccount.session.profile.stateData.globals;
		gTutor.features = sessionAccount.session.profile.stateData.features;
		_phaseData      = sessionAccount.session.profile.stateData.data;
		
		seekToScene(CSceneGraphNavigator._rootGraph.restoreGraph(sessionAccount.session.profile.stateData.sceneGraph));
	}

	
	/**
		* gotoNextScene manual entry point
		*/
	public gotoNextScene() : void
	{
		// Do automated scene increments asynchronously to allow
		// actiontrack scripts to complete prior to scene nav
		
		addEventListener(CEFEvent.ENTER_FRAME, this._deferredNextScene);
	}
	
	private _deferredNextScene(e:Event) : void
	{			
		removeEventListener(CEFEvent.ENTER_FRAME, this._deferredNextScene);
					
		this.traceGraphEdge();
	}
	
	/**
		* gotoNextScene Event driven entry point
		* @param	evt
		*/
	private traceGraphEdge() : void
	{
		let historyNode:CGraphHistoryNode;
		let nextScene:CGraphScene;
		let scene:CEFSceneSequence = CSceneGraphNavigator._rootGraph.sceneInstance() as CEFSceneSequence;
		
		try
		{
			// debounce the next button - i.e. disallow multiple clicks on same next instance  			
			// protect against recurrent calls			
			
			if(_inNavigation) 
						return;
			
			_inNavigation = true;
			
			// The next button can target either the scenegraph or the animationgraph.
			// i.e. You either want it to trigger the next step in the animationGraph or the sceneGraph
			// reset _fSceneGraph if you want the next button to drive the animationGraph
			//      
			if(_fSceneGraph || scene == null || scene.nextGraphAnimation(true) == null)
			{
				// If we are not at the head end of the history then use the historic 'next'.
				// i.e. non-volatile history moves forward past the exact same sequence
				// we back tracked through
				
				historyNode = this._history.next();
				
				// If we are at the HEAD of the history step through the sceneGraph
				
				if(historyNode == null)
				{
					nextScene = CSceneGraphNavigator._rootGraph.nextScene();
					
					if(_currScene != nextScene && nextScene != null)
					{
						this._history.push(CSceneGraphNavigator._rootGraph.node, nextScene);
					}
					
					else if(nextScene == null)
						enQueueTerminateEvent();
				}
				
				// if the history is non-volatile we go forward the same way we went back
				
				else
				{
					// Set the scene we go to next
					
					nextScene = historyNode.scene;				
				}
				
				// Do the scene Transition 
				
				_xType = "WOZNEXT";
				
				if(_currScene != nextScene && nextScene != null)
				{
					seekToScene(nextScene);
				}

				// We aren't going to be navigating so reset the flag to allow 
				// future attempts.
				
				else
				{
					_inNavigation = false;
				}
			}
			else
			{
				_inNavigation = false;
			}
		}
		catch(err:Error)
		{
			trace("CSceneGraphNavigator.traceGraphEdge: " + err.toString());
			
			let logData:Object = {'location':'traceGraphEdge', 'message':err.toString()};
			
			gLogR.logErrorEvent(logData);
		}				
	}

	
	/**
		* prevScene Event driven entry point
		* @param	evt
		*/
	public onButtonPrev(evt:CEFMouseEvent) : void
	{			
		let historyNode:CGraphHistoryNode;

		try
		{
			// debounce the back button - i.e. disallow multiple clicks on same instance  
			// protect against recurrent calls
			
			if(_inNavigation) 
				return;
			
			_inNavigation = true;
			
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
						if(!CEFRoot.Tutor.testFeatureSet(features))
						{
							continue;
						}
					}
					
					// if the history is volatile we need to update the node and scene that
					// the scenegraph is working with since when we start moving forward again 
					// we may not visit the same scenes/nodes
					//
					// If it is non-volatile we go whereever the history takes us.
					
					if(this._history.isVolatile)
					{
						// Seek the scene graph to the historic node/scene because we may take 
						// a different path when going forward again
						
						CSceneGraphNavigator._rootGraph.node  = historyNode.node;
						CSceneGraphNavigator._rootGraph.scene = historyNode.scene;
					}
					
					// Do the scene Transition 
					
					_xType = "WOZBACK";
					
					seekToScene(historyNode.scene);
					
					break;					
				}
				
				// We aren't going to be navigating so reset the flag to allow 
				// future attempts.
				
				else
				{
					_inNavigation = false;
				}
				
			}while(historyNode != null)					
		}
		catch(err:Error)
		{
			trace("CSceneGraphNavigator.onButtonPrev: " + err.toString());
			
			let logData:Object = {'location':'onButtonPrev', 'message':err.toString()};
			
			gLogR.logErrorEvent(logData);
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
	private seekToScene(nextScene:CGraphScene) : void
	{			
		let _progressData:Object;
		
		try
		{
			_nextScene = nextScene;

//			if(traceMode) trace("Nav To: " + nextScene);
			
			let logData:Object;
						
			// In demo mode we defer any demo button clicks while scene changes are in progress			
			if(fDemo)
				fDeferDemoClick = true;
						
			// remember current scene object			
			_prevScene = _currScene;
						
			// Do the exit behavior			
			if(_currScene)
				TutAutomator[_currScene.scenename].instance.preExitScene(_xType, 0);
						
			// Do scene Specific initialization 
			//
			//*** Create scene on demand
			//
			if(TutAutomator[_nextScene.scenename] == undefined)
			{
				_nextScene.instantiateScene();
			}
			
			TutAutomator[_nextScene.scenename].instance.preEnterScene(prntTutor, _nextScene.scenename, _nextScene.title, _nextScene.page, _xType);
			
//@@ Action Logging
			
			if(_currScene)
				logData = {'curscene':_currScene.scenename, 'newscene':_nextScene.scenename};
			else
				logData = {'curscene':'null', 'newscene':_nextScene.scenename};
			
			gLogR.logNavEvent(logData);
			
//@@ Action Logging			


			// Process the - Onexit behaviors - This will process the XML logging specification for the currScene results
			
			if(_currScene)
			{
				TutAutomator[_currScene.scenename].instance.onExitScene();
				
				//## Mod May 10 2014 - Support runtime scripting
				
				TutAutomator[_currScene.scenename].instance.doExitAction();					
			}				
			
//@@ Progress Logging

			// Only scenes which can act as starting points - i.e. are independent of other scenes are eligible for
			// progress logging
			
			if(_nextScene.isCheckPoint)
			{
				// On the first pass we need to generate an object scaffold to hold the progress update packet.
				// On subsequent passes we just need to change the value fields and add the stateData
				
				// Note: a progress event is processed as a mongo update operation - so we must use
				//       CObject and MObject types to define UPDATEABLE and REPLACEABLE Objects respectively
				
				if(_progressData == null)
				{
					_progressData = new Object;			
					_profileData  = new CObject;				 
																				
					_progressData['reify']           = new CObject; 	// 'reify' is the portion that is parsed for update fields - it and any sub-documents  			
					_progressData['reify']['phases'] = new CObject;		// should be either CObjects, MObjects or AS3 primitive data types String, Number,int,Boolean,Null,void
					
					_progressData['reify']['phases'][CEFRoot.sessionAccount.session.profile_Index] = _profileData;
					
					_profileData['stateData']        = new MObject;			// Use a MObject ot force replacement of entire stateData sub-document in MongoDB 
				}
				
				_profileData.progress = CMongo._INPROGRESS;								
				
				_profileData['stateData']['sceneGraph'] = CSceneGraphNavigator._rootGraph.captureGraph(new Object);
				
				_profileData['stateData']['ktSkills']   = gTutor.ktSkills;
				_profileData['stateData']['globals']    = globals;
				_profileData['stateData']['features']   = gTutor.features;
				_profileData['stateData']['data']  		= _phaseData;

				gLogR.logProgressEvent(_progressData);
			}
			
			
			//@@ Mod Mar 9 2015 - interrupt if connection lost
			//
			// Session manager listens to the tutor for these to ensure we don't get ahead of the logging. 
			
			if(!gLogR.connectionActive)
			{				
				CEFDoc.gApp.dispatchEvent(new Event("CONNECTION_LOST"));
			}				
			
//@@ Progress Logging			
							
			// switch the curent active scene			
			_currScene = _nextScene;		
			
			// update the iteration count for this named scene 
			updateSceneIteration();
			
			// Do the actual scene transitions			
			prntTutor.xitions.addEventListener(CEFEvent.COMPLETE, doEnterScene);			
			prntTutor.xitions.gotoScene(_nextScene.scenename);
		}
		catch(err:Error)
		{
			trace("CSceneGraphNavigator.seekToScene: " + err.toString());
			
			logData = {'location':'seekToScene', 'message':err.toString()};
			
			gLogR.logErrorEvent(logData);
		}
	}
	
	
	// Performed immediately after scene is fully onscreen
	//@@ Mod Jul 18 2013 - public -> private
	//
	protected doEnterScene(evt:Event) : void
	{
		try
		{
			if(traceMode) trace("doEnterScene: " , sceneCurr);
			
			prntTutor.xitions.removeEventListener(CEFEvent.COMPLETE, doEnterScene);						
			
			// increment the global frame ID - for logging 
			
			incFrameNdx();
						
			//*** Destroy non persistent scenes
			//
			if(_prevScene && !_prevScene.persist)
			{
				prntTutor.destroyScene(_prevScene.scenename);
				
				_prevScene.destroyScene();
			}
			
			// Do scene Specific Enter Scripts
			//
			
			TutAutomator[_currScene.scenename].instance.onEnterScene(_xType);
			
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
			TutAutomator[_currScene.scenename].instance.deferredEnterScene(_xType);			
			
			// In demo mode defer demo clicks while scene switches are in progress
			
			if(fDemo)
				prntTutor.dispatchEvent(new Event("deferedDemoCheck"));
			
			//@@ Mod Sep 27 2011 - protect against recursive calls
			
			_inNavigation = false;
		}
		catch(err)
		{
			trace("CSceneGraphNavigator.doEnterScene: " + err.toString());
			
			let logData:Object = {'location':'doEnterScene', 'message':err.toString()};
			
			gLogR.logErrorEvent(logData);
		}
	}
	
}
