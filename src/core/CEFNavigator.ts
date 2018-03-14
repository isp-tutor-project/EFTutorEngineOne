//*********************************************************************************
//                                                                        
//         CARNEGIE MELLON UNIVERSITY PROPRIETARY INFORMATION             
//  
//  This software is supplied under the terms of a license agreement or   
//  nondisclosure agreement with Carnegie Mellon University and may not   
//  be copied or disclosed except in accordance with the terms of that   
//  agreement.    
//  
//   Copyright(c) 2008 Carnegie Mellon University. All Rights Reserved.   
//                                                                        
//  File:      CEFNavigator.as
//                                                                        
//  Purpose:   CEFNavigator object implementation
//                                                                        
//  Author(s): Kevin Willows                                                          
//  
//  History: File Creation 9/8/2008 2:47 PM 
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

import { CEFScene } from "./CEFScene";

import { CUtil } 			from "../util/CUtil";

/**
* ...
* 
* ## Mod Apr 15 2014 - rebased from CWOZScene - was CWOZObject 
*/
export class CEFNavigator extends CEFScene
{
	//************ Stage Symbols
	
	public SnextButton:CWOZNavNext;		
	public SbackButton:CWOZNavBack;
	
	//************ Stage Symbols
	
	sceneCnt:number = 0;
	
	//*************** Navigator
	//@@Mod Aug 10 2013 - tutorautomator made public so CSceneGraph can access it.
	
	protected static prntTutor:Object;				// The parent CWOZTutorRoot of these transitions
	public    static TutAutomator:Object;			// The location of this tutor automation object			
	
	//*************** Navigator "ROOT INSTANCE" CONSTANTS - 
	// Place these within a subclass to set the root of a navigation sequence
	// See CWOZNavPanel
	//static StscenePrev:number;
	//static StsceneCurr:number;
	//
	//static StsceneTitle:Array;		// initialize the Tutor specific scene titles
	//static StsceneSeq:Array;			// initialize the Tutor specific scene sequence
	//*************** Navigator "ROOT INSTANCE" CONSTANTS - 

	protected _inNavigation:boolean = false; 
	
	public CEFNavigator() 
	{
		this.traceMode = false;
					
		this.SnextButton.addEventListener(CWOZMouseEvent.WOZCLICK, onButtonNext);
		this.SbackButton.addEventListener(CWOZMouseEvent.WOZCLICK, onButtonPrev);		
		
		this.gNavigator = this;
	}

	
	/**
	 * returns the current scenes iteration count
	 */
	public get iteration() : string
	{
		return "null";
	}
	
	
	public get sceneObj() : CWOZSceneSequence
	{
		return null;
	}
	
	/**
	 * Add a scene to a navigation sub-sequence - These sequences are driven by scene events not NEXT/PREV button clicks
	 * @param	sceneTitle
	 * @param	sceneName
	 */
	public addScene(SceneTitle:string, ScenePage:string, SceneName:string, SceneClass:string, ScenePersist:boolean, SceneFeatures:string = "null" ) : void
	{
	}	
	
	//*************** Navigator getter setters - 
	
	public connectToTutor(parentTutor:CWOZTutorRoot, autoTutor:Object) : void
	{
		prntTutor = parentTutor;
		TutAutomator = autoTutor;
	}
	
	
	//*************** Navigator getter setters - 
	// Override these within a subclass to set the root of a navigation sequence
	protected get scenePrev() :number 
	{
		return 0;
	}
	protected set scenePrev(scenePrevINT:number) :void 
	{
	}
	
	protected get sceneCurr() :number 
	{
		return 0;
	}
	protected set sceneCurr(sceneCurrINT:number) :void 
	{
	}
	protected get sceneCurrINC() :number 
	{
		return 0;
	}
	protected get sceneCurrDEC() :number 
	{
		return 0;
	}
	
	protected get sceneTitle() :Array							// initialize the Tutor specific scene titles
	{
		return new Array();
	}
	protected set sceneTitle(sceneTitleARRAY:Array) :void		// initialize the Tutor specific scene titles
	{
	}
	
	protected get sceneSeq() :Array							// initialize the Tutor specific scene sequence
	{
		return new Array();
	}		
	protected set sceneSeq(sceneSeqARRAY:Array) :void			// initialize the Tutor specific scene sequence
	{
	}		
	
	protected get scenePage() :Array								// initialize the Tutor specific scene sequence
	{
		return new Array();
	}		
	protected set scenePage(scenePageARRAY:Array) :void			// initialize the Tutor specific scene sequence
	{
	}		
	
	protected get sceneName() :Array							// initialize the Tutor specific scene sequence
	{
		return new Array();
	}		
	protected set sceneName(sceneSeqARRAY:Array) :void			// initialize the Tutor specific scene sequence
	{
	}		
	
	protected get sceneClass() :Array							// initialize the Tutor specific scene sequence
	{
		return new Array();
	}		
	protected set sceneClass(sceneSeqARRAY:Array) :void			// initialize the Tutor specific scene sequence
	{
	}		
	
	protected get scenePersist() :Array							// initialize the Tutor specific scene sequence
	{
		return new Array();
	}		
	protected set scenePersist(sceneSeqARRAY:Array) :void			// initialize the Tutor specific scene sequence
	{
	}		
	
	

	// Deprecated - Jul 18 2013 - unused
	
//		public getScene() : string
//		{
//			// returns the scene ordinal in the sequence array or 0
//			//
//			return sceneSeq[sceneCurr];
//		}


	// Deprecated - Jul 18 2013 - unused
	
//		/**
//		 * insert a new scene at the given sequence index
//		 * 
//		 * @param	sceneNdx   - The index of the current scene
//		 * @param	sceneName  - The name of the Scene to insert
//		 * @param	sceneTitle - The title of the Scene to insert
//		 * @return
//		 */
//		public insertScene(SceneNdx:number, SceneName:string, SceneTitle:string ) : CWOZScene
//		{
//			// returns the scene ordinal in the sequence array or 0
//			//
//			sceneTitle.splice(SceneNdx + 1, 0, SceneTitle); 
//			  sceneSeq.splice(SceneNdx + 1, 0, SceneName); 
//			
//			return TutAutomator[sceneSeq[SceneNdx]].instance;
//		}		
	
	
	//@@ Mod Jul 18 2013 - public -> private
	
	private findSceneOrd(tarScene:string) : int
	{
		if(traceMode) trace("findSceneOrd: " + tarScene);
		
		leti1:number;
		letordScene:number = 0;
		letnewScene:string; 
		
		// Find the ordinal for the requested scene Label
		//
		for(i1 = 0 ; i1 < sceneCnt ; i1++)
		{
			if(sceneSeq[i1] == tarScene)
			{
				ordScene = i1;
				break;
			}
		}					
		
		// returns the scene ordinal in the sequence array or 0
		//
		return ordScene;
	}

	
	public goToScene(tarScene:string) : void
	{
		if(traceMode) trace("Nav To: " + tarScene);
		
		letordScene:number = -1;
		letnewScene:string = ""; 
		letredScene:string = "";
		
		//@@ Mod Sep 27 2011 - protect against recurrent calls
		
		if(_inNavigation) 
					return;
		
		_inNavigation = true;
		
		//@@ 
		
		// In demo mode we defer any demo button clicks while scene changes are in progress
		
		if(fDemo)
			fDeferDemoClick = true;
		
		// Find the ordinal for the requested scene Label
		//
		ordScene = findSceneOrd(tarScene);
		
		// If we don't find the requested scene just skip it
		//
		if(ordScene >= 0)
		{
			if(traceMode) trace("Nav GoTo Found: " + tarScene);
			
			// remember current frame
			
			scenePrev = sceneCurr;
		
			// No redirection if switching to demo navigator scene
			
			if(tarScene == "SdemoScene")
			{
				// Do the exit behavior
				
				TutAutomator[sceneSeq[sceneCurr]].instance.preExitScene("WOZGOTO", sceneCurr);
				
				// switch the curent active scene
				
				sceneCurr = ordScene;		
			}
			// Allow current scene to update next scene dynamically
			
			else switch(redScene = TutAutomator[sceneSeq[sceneCurr]].instance.preExitScene("WOZGOTO", sceneCurr))
			{
				case CANCELNAV: 						// Do not allow scene to change
						if(fDemo)
							fDeferDemoClick = false;
						
						//@@ Mod Sep 27 2011 - protect against recurrent calls
						
						_inNavigation = false;
						
						return;				
						
				case OKNAV: 							// Move to GOTO scene 
						sceneCurr = ordScene;						
						break;
				
				default: 								// Goto the scene defined by the current scene
						sceneCurr = findSceneOrd(redScene);					
			}
			
			// Do scene Specific initialization - scene returns the Label of the desired target scene
			// This allows the scene to do redirection
			// We allow iterative redirection
			//
			for(redScene = sceneSeq[sceneCurr] ; redScene != newScene ; )
			{
				//*** Create scene on demand
				//
				if(TutAutomator[sceneSeq[sceneCurr]] == undefined)
				{
					prntTutor.instantiateScene(sceneName[sceneCurr], sceneClass[sceneCurr]);
				}
				
				newScene = redScene;
				
				redScene = TutAutomator[sceneSeq[sceneCurr]].instance.preEnterScene(prntTutor, newScene, sceneTitle[sceneCurr], scenePage[sceneCurr], "WOZGOTO");

				//@@@ NOTE: either discontinue support for redirection through PreEnterScene - or manage scene creation and destruction here
				
				if(redScene == "WOZNEXT")
				{
					sceneCurrINC;
					redScene = sceneSeq[sceneCurr];
				}
				if(redScene == "WOZBACK")
				{
					sceneCurrDEC;
					redScene = sceneSeq[sceneCurr];
				}
				// Find the ordinal for the requested scene Label
				//
				else
					sceneCurr = findSceneOrd(redScene);					
			}
			
			//@@ Action Logging
			letlogData:Object = {'navevent':'navgoto', 'curscene':scenePrev, 'newscene':redScene};
			//letxmlVal:XML = <navgoto curscene={scenePrev} newscene={redScene}/>
							
			gLogR.logNavEvent(logData);				
			//@@ Action Logging			
			
			// On exit behaviors
			
			TutAutomator[sceneSeq[scenePrev]].instance.onExitScene();
			
			// Initialize the stategraph for the new scene
			
			
			// Do the scene transitions
			
			prntTutor.xitions.addEventListener(Event.COMPLETE, doEnterScene);			
			prntTutor.xitions.gotoScene(redScene);							
		}
	}

	/**
	 * gotoNextScene Event driven entry point
	 * @param	evt
	 */
	public onButtonNext(evt:CWOZMouseEvent) : void
	{
		//@@ debug - for building XML spec of Tutor spec only - captureSceneGraph
		//			 note allowed for non-click events - i.e. virtual invocations see: CWOZDoc.launchTutors():
//			if(evt != null)
//				gTutor.captureSceneGraph();			
		
		gotoNextScene();
	}
	
	/**
	 * 	recoverState - called from CWOZDoc.launchTutors to restart an interrupted session
	 */
	public recoverState() : void
	{
	}
	
	
	/**
	 * gotoNextScene manual entry point
	 */
	public gotoNextScene() : void
	{
		if(traceMode) trace("Nav Next: " );
		
		letnewScene:string; 
		letredScene:string = "";
		
		//@@ Mod Sep 27 2011 - protect against recurrent calls
		
		if(_inNavigation) 
			return;
		
		_inNavigation = true;
						
		//@@ 						
		// In demo mode we defer any demo button clicks while scene changes are in progress
		
		if(fDemo)
			fDeferDemoClick = true;
					
		if(sceneCurr < sceneCnt)
		{
			// remember current frame
			//
			if(traceMode) trace("scenePrev: " + scenePrev + "  - sceneCurr: " + sceneCurr);
			scenePrev = sceneCurr;

			// Do scene Specific termination 
			//
			if (traceMode) trace("sceneSeq[sceneCurr]: " + sceneSeq[sceneCurr]);
			
			// Allow current scene to update next scene dynamically
			//
			switch(redScene = TutAutomator[sceneSeq[sceneCurr]].instance.preExitScene("WOZNEXT", sceneCurr))
			{
				case CANCELNAV: 						// Do not allow scene to change
						if(fDemo)
							fDeferDemoClick = false;
						
						//@@ Mod Sep 27 2011 - protect against recurrent calls
						
						_inNavigation = false;
						
						return;				
						
				case OKNAV: 							// Move to next scene in sequence
						sceneCurrINC;					
						break;
				
				default: 								// Goto the scene defined by the current scene
						sceneCurr = findSceneOrd(redScene);					
			}
			
			// Do scene Specific initialization - scene returns the Label of the desired target scene
			// This allows the scene to do redirection
			// We allow iterative redirection
			//
			for(redScene = sceneSeq[sceneCurr] ; redScene != newScene ; )
			{
				//prntTutor.enumScenes();	//@@debug
				
				//*** Create scene on demand
				//
				trace(sceneSeq[sceneCurr]);
				trace(TutAutomator[sceneSeq[sceneCurr]]);
				
				if(TutAutomator[sceneSeq[sceneCurr]] == undefined)
				{
					prntTutor.instantiateScene(sceneName[sceneCurr], sceneClass[sceneCurr]);
				}
				
				newScene = redScene;
				
				//@@@ NOTE: either discontinue support for redirection through PreEnterScene - or manage scene creation and destruction here
				
				redScene = TutAutomator[sceneSeq[sceneCurr]].instance.preEnterScene(prntTutor, newScene, sceneTitle[sceneCurr], scenePage[sceneCurr], "WOZNEXT");
				
				// Skip to next scene in sequence
				if(redScene == "WOZNEXT")
				{
					sceneCurrINC;
					redScene = sceneSeq[sceneCurr];
				}
				// Stay were we are
				if(redScene == "WOZBACK")
				{
					sceneCurrDEC;
					redScene = sceneSeq[sceneCurr];
				}
				// Goto scene by name 
				// Find the ordinal for the requested scene Label
				else
					sceneCurr = findSceneOrd(redScene);					
			}
			
			//@@ Action Logging
			letlogData:Object = {'navevent':'navnext', 'curscene':scenePrev, 'newscene':redScene};
			//letxmlVal:XML = <navnext curscene={scenePrev} newscene={redScene}/>
			
			gLogR.logNavEvent(logData);				
			//@@ Action Logging							
			
			// On exit behaviors
			
			TutAutomator[sceneSeq[scenePrev]].instance.onExitScene();
			
			// Do the scene transitions
			prntTutor.xitions.addEventListener(Event.COMPLETE, doEnterNext);			
			prntTutor.xitions.gotoScene(redScene);							
		}
	}


	/**
	 * prevScene Event driven entry point
	 * @param	evt
	 */
	public onButtonPrev(evt:CWOZMouseEvent) : void
	{	
		gotoPrevScene();
	}		
	
	/**
	 * prevScene manual entry point
	 * Mod Jul 18 2013 - public -> private
	 */
	private gotoPrevScene()
	{				
		if(traceMode) trace("Nav Back: " );
							
		letnewScene:string = ""; 
		letredScene:string = "";
					
		//@@ Mod Sep 27 2011 - protect against recurrent calls
		
		if(_inNavigation) 
			return;
		
		_inNavigation = true;
		
		//@@ 
		// In demo mode we defer any demo button clicks while scene changes are in progress
		
		if(fDemo)
			fDeferDemoClick = true;
					
		if(sceneCurr >= 1)		
		{
			// remember current frame
			//
			scenePrev = sceneCurr;

			// Allow current scene to update next scene dynamically
			//
			switch(redScene = TutAutomator[sceneSeq[sceneCurr]].instance.preExitScene("WOZBACK", sceneCurr))
			{
				case CANCELNAV: 						// Do not allow scene to change
						if(fDemo)
							fDeferDemoClick = false;
					
						//@@ Mod Sep 27 2011 - protect against recurrent calls
						
						_inNavigation = false;
						
						return;				
						
				case OKNAV: 							// Move to next scene in sequence
						sceneCurrDEC;					
						break;
				
				default: 								// Goto the scene defined by the current scene
						sceneCurr = findSceneOrd(redScene);					
			}
			
			// Do scene Specific initialization - scene returns the Label of the desired target scene
			// This allows the scene to do redirection
			// We allow iterative redirection
			//
			for(redScene = sceneSeq[sceneCurr] ; redScene != newScene ; )
			{
				newScene = redScene;
				
				redScene = TutAutomator[sceneSeq[sceneCurr]].instance.preEnterScene(prntTutor, newScene, sceneTitle[sceneCurr], scenePage[sceneCurr], "WOZBACK");
								
				if(redScene == "WOZNEXT")
				{
					sceneCurrINC;
					redScene = sceneSeq[sceneCurr];
				}
				if(redScene == "WOZBACK")
				{
					sceneCurrDEC;
					redScene = sceneSeq[sceneCurr];
				}
				// Find the ordinal for the requested scene Label
				//
				else
					sceneCurr = findSceneOrd(redScene);					
			}
			
			//@@ Action Logging
			letlogData:Object = {'navevent':'navback', 'curscene':scenePrev, 'newscene':redScene};
			//letxmlVal:XML = <navback curscene={scenePrev} newscene={redScene}/>
			
			gLogR.logNavEvent(logData);				
			//@@ Action Logging			
			
			// On exit behaviors
			
			TutAutomator[sceneSeq[scenePrev]].instance.onExitScene();
			
			// Do the scene transitions
			prntTutor.xitions.addEventListener(Event.COMPLETE, doEnterBack);			
			prntTutor.xitions.gotoScene(redScene);							
		}
	}


	// Performed immediately after scene is fullly onscreen
	//@@ Mod Jul 18 2013 - public -> private
	//
	protected doEnterNext(evt:Event) : void
	{
		if(traceMode) trace("doEnterNext: " , sceneCurr);
		
		prntTutor.xitions.removeEventListener(Event.COMPLETE, doEnterNext);						
		
		//*** Destroy non persistent scenes
		//
		if(!scenePersist[scenePrev])
		{
			// remove it from the tutor itself
			
			prntTutor.destroyScene(sceneName[scenePrev]);
		}
		
		// Do scene Specific Enter Scripts
		//
		TutAutomator[sceneSeq[sceneCurr]].instance.onEnterScene("WOZNEXT");
		
		//prntTutor.enumScenes();	//@@debug

		// In demo mode defer demo clicks while scene switches are in progress
		
		if(fDemo)
			prntTutor.dispatchEvent(new Event("deferedDemoCheck"));
		
		//@@ Mod Sep 27 2011 - protect against recurrent calls
		
		_inNavigation = false;
		
		//@@ DEBUG
		//dumpStage(stage, "stage");			
		
	}
				
	// Performed immediately after scene is fullly onscreen
	//@@ Mod Jul 18 2013 - public -> private
	//
	protected doEnterBack(evt:Event) : void
	{
		if(traceMode) trace("doEnterBack: " , sceneCurr);
		
		prntTutor.xitions.removeEventListener(Event.COMPLETE, doEnterBack);						

		//*** Destroy non persistent scenes
		//
		if(!scenePersist[scenePrev])
		{
			prntTutor.destroyScene(sceneName[scenePrev]);
		}
		
		// Do scene Specific Enter Scripts
		//
		TutAutomator[sceneSeq[sceneCurr]].instance.onEnterScene("WOZBACK");
		
		// In demo mode defer demo clicks while scene switches are in progress
		
		if(fDemo)
			prntTutor.dispatchEvent(new Event("deferedDemoCheck"));

		//@@ Mod Sep 27 2011 - protect against recurrent calls
		
		_inNavigation = false;
		
	}
	
	// Performed immediately after scene is fully onscreen
	//@@ Mod Jul 18 2013 - public -> private
	//
	protected doEnterScene(evt:Event) : void
	{
		if(traceMode) trace("doEnterScene: " , sceneCurr);
		
		prntTutor.xitions.removeEventListener(Event.COMPLETE, doEnterScene);						

		//*** Destroy non persistent scenes
		//
		if(!scenePersist[scenePrev])
		{
			prntTutor.destroyScene(sceneName[scenePrev]);
		}
		
		// Do scene Specific Enter Scripts
		//
		TutAutomator[sceneSeq[sceneCurr]].instance.onEnterScene("WOZGOTO");
		
		// In demo mode defer demo clicks while scene switches are in progress
		
		if(fDemo)
			prntTutor.dispatchEvent(new Event("deferedDemoCheck"));
		
		//@@ Mod Sep 27 2011 - protect against recurrent calls
		
		_inNavigation = false;
		
	}
	
}
