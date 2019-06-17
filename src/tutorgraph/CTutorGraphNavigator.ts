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

import { CEFNavigator } 	from "../core/CEFNavigator";

import { TScene } 			from "../thermite/TScene";

import { TMouseEvent } 		from "../thermite/events/TMouseEvent";

import { CEFEvent } 		from "../events/CEFEvent";

import { CONST }            from "../util/CONST";
import { CUtil } 			from "../util/CUtil";
import { CEFTimer }         from "../core/CEFTimer";

import Event 		  = createjs.Event;
import { TSceneBase } from "../thermite/TSceneBase";




/**
* ...
*/
export class CTutorGraphNavigator extends CEFNavigator
{		
	private _history:CTutorHistory;				
    private _rootGraph:CTutorGraph;

    private _asyncTimer:CEFTimer;
    private _tickHandler:Function;

	private _fTutorGraph:Boolean = true;

	private _currScene:CTutorScene;
	private _nextScene:CTutorScene;
	private _prevScene:CTutorScene;
	
	private _xType:string;
	
	private _iterations:any = {};

	
	
	/**
		* Creates a new CTutorGraphNavigator instance. 
		*/
	constructor(_tutorDoc:IEFTutorDoc)
	{
        super(_tutorDoc);		
        
        this._asyncTimer = new CEFTimer(0);

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
        // Create the tutors navigator object and init the internal pointer _tutorDoc.tutorNavigator
        // which may be used during scene initialization
        // 
		let tutorNav 	         = new CTutorGraphNavigator(_tutorDoc);				
        tutorNav._history        = new CTutorHistory(_tutorDoc);
        _tutorDoc.tutorNavigator = tutorNav;
		
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
    public captureGraph() : any
    {
       return this._rootGraph.captureGraph({});
    }
	
	// pass the name of the target scene and the type of the transition
	//
    public restoreGraph(nodeState:any) : void
    {
        this._rootGraph.restoreGraph(nodeState);
    }


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
		this.on(CEFEvent.ENTER_FRAME, this._asyncTerminate);
	}
	
	private _asyncTerminate(e:Event) : void
	{			
		this.off(CEFEvent.ENTER_FRAME, this._asyncTerminate);
		
		this.tutorDoc.log.logTerminateEvent();
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
	public gotoNextScene(source:string) : void
	{
		// Do automated scene increments asynchronously to allow
		// actiontrack scripts to complete prior to scene nav
        
        this.changeRequestorScene = source;
        
        this._tickHandler = this._asyncTimer.on(CONST.TIMER, this._asyncNextScene, this);
        this._asyncTimer.start();
	}
	
	private _asyncNextScene(evt:Event) : void
	{			
        this._asyncTimer.stop();
		this._asyncTimer.off(CONST.TIMER, this._tickHandler);
					
        this.traceGraphEdge();
	}
	/**
    * gotoNextScene Event driven entry point
    * @param	evt
    */
    public onButtonNext(evt:TMouseEvent) : void
    {
        // Do button clicks synchronously
        
        this.changeRequestorScene = "$buttonClick" + evt.currentTarget.name;
        
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

            console.log("TUTORGRAPH: state change: " + this.changeRequestorScene);

            if(scene)
                scene.changeRequestorTrack = "$tutorGraph:" + this.changeRequestorScene;
			
			// The next button can target either the tutorgraph or the scenegraph.
			// i.e. You either want it to trigger the next step in the sceneGraph or the tutorgraph
			// reset _fTutorGraph if you want the next button to drive the sceneGraph
			//      
			if(this._fTutorGraph || scene == null || scene.traceGraphEdge(true) == null)
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
                else if(nextScene == null) {
                    let curScene:TSceneBase = this.tutorAutoObj[this._currScene.scenename]._instance;    

                    this.tutorDoc.logTutorState(curScene);                    
                    this.tutorDoc.logTutorProgress(CONST.END_OF_TUTOR);
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
            // Ensure this is reset or navigation will freeze
            // 
            this._inNavigation = false;

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
		let scene:TScene = this._rootGraph.sceneInstance() as TScene;

		try
		{
			// debounce the back button - i.e. disallow multiple clicks on same instance  
			// protect against recurrent calls
			
			if(this._inNavigation) 
				return;
			
				this._inNavigation = true;
            
                
			// The next button can target either the tutorgraph or the scenegraph.
			// i.e. You either want it to trigger the next step in the sceneGraph or the tutorgraph
			// reset _fTutorGraph if you want the next button to drive the sceneGraph
			//      
			if(this._fTutorGraph || scene.traceHistory() == null)
			{
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
                        // 
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
                            // Seek the tutor graph to the historic node/scene because we may take 
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
                        this.doEnterScene(new Event("test",true,false));
                    }
                    
                }while(historyNode != null)					
            }
            else {
				this._inNavigation = false;
			}
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
				this.tutorAutoObj[this._currScene.scenename]._instance.preExitScene(this._xType, 0);
						
			// Do scene Specific initialization 
			//
			//*** Create scene on demand
			//
			if(this.tutorAutoObj[this._nextScene.scenename] == undefined)
			{
				this._nextScene.instantiateScene();
			}
			
			
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
                let curScene:TSceneBase = this.tutorAutoObj[this._currScene.scenename]._instance;

                curScene.onExitScene();

                // We always record the tutor data for each scene
                // 
                this.tutorDoc.logTutorState(curScene);
			}				
			
//@@ Progress Logging

			// Only scenes which can act as starting points - i.e. are independent of other scenes are eligible for
			// progress logging
            // 
			if(this._nextScene.isCheckPoint)
				this.tutorDoc.logTutorProgress(this._nextScene.scenename);
			
			
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
			this.xitions.gotoScene(this._nextScene.scenename, this._xType);
		}
		catch(err)
		{
			CUtil.trace("CONST.seekToScene: " + err.toString());
			
			let logData:any = {'location':'seekToScene', 'message':err.toString()};
			
			this.tutorDoc.log.logErrorEvent(logData);
		}
	}
    

    //#Mod Jun 11 2019 - Need to do preenter after common scene elements are moved between scenes in the transition sceneout processing
    //
    public doPreEnterScene() {

        this.tutorAutoObj[this._currScene.scenename]._instance.preEnterScene(this.tutorDoc.tutorContainer, this._currScene.scenename, this._currScene.title, this._currScene.page, this._xType);
    }

	
	// Performed immediately after scene is fully onscreen
	//@@ Mod Jul 18 2013 - public -> private
	//
	protected doEnterScene(evt:Event) : void
	{
		try
		{
			if(this.traceMode) CUtil.trace("doEnterScene: " , this._currScene._name);
			
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
			this.tutorDoc.TutAutomator[this._currScene.scenename]._instance.onEnterScene(this._xType);
			
			//## DEBUG May 11 2014 - dump display list
            //_currScene.enumDisplayList();			
            	
			// Create a unique timestamp for this scene			
			this.tutorDoc.tutorContainer.timeStamp.createLogAttr("dur_" + this._currScene.scenename, true);
            
			// In demo mode defer demo clicks while scene switches are in progress
			
			// if(this.tutorDoc.fDemo)
			// 	this.tutorDoc.tutorContainer.dispatchEvent(new Event("deferedDemoCheck",false,false));
			
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
