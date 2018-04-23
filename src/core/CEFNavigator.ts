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

import { CEFScene } 		from "./CEFScene";
import { CEFSceneSequence } from "./CEFSceneSequence";
import { CEFTutorRoot } 	from "./CEFTutorRoot";
import { CEFRoot } 			from "./CEFRoot";

import { CEFNavNext } 		from "../navigation/CEFNavNext";
import { CEFNavBack } 		from "../navigation/CEFZNavBack";
import { CEFMouseEvent } 	from "../events/CEFMouseEvent";
import { CEFEvent } 		from "../events/CEFEvent";

import { CTutorState }  	from "../util/CTutorState";
import { CONST }            from "../util/CONST";
import { CUtil } 			from "../util/CUtil";


/**
* ...
* 
* ## Mod Apr 15 2014 - rebased from CEFScene - was CEFObject 
*/
export class CEFNavigator extends CEFScene
{
	//************ Stage Symbols
	
	public SnextButton:CEFNavNext;		
	public SbackButton:CEFNavBack;
	
	//************ Stage Symbols
	
	sceneCnt:number = 0;
	
	//*************** Navigator "ROOT INSTANCE" CONSTANTS - 
	// Place these within a subclass to set the root of a navigation sequence
	// See CEFNavPanel
	//static Stthis.scenePrev:number;
	//static Stthis.sceneCurr:number;
	//
	//static StsceneTitle:Array;		// initialize the Tutor specific scene titles
	//static Stthis.sceneSeq:Array;			// initialize the Tutor specific scene sequence
	//*************** Navigator "ROOT INSTANCE" CONSTANTS - 

	protected _inNavigation:boolean = false; 
	
	public CEFNavigator() 
	{
		this.traceMode = false;
					
		this.SnextButton.addEventListener(CEFMouseEvent.WOZCLICK, this.onButtonNext);
		this.SbackButton.addEventListener(CEFMouseEvent.WOZCLICK, this.onButtonPrev);		
		
		CTutorState.gNavigator = this;
	}

	
	/**
	 * returns the current scenes iteration count
	 */
	public get iteration() : string
	{
		return "null";
	}
	
	
	public get sceneObj() : CEFSceneSequence
	{
		return null;
	}
	
	/**
	 * Add a scene to a navigation sub-sequence - These sequences are driven by scene events not NEXT/PREV button clicks
	 * @param	sceneTitle
	 * @param	this.sceneName
	 */
	public addScene(SceneTitle:string, ScenePage:string, SceneName:string, SceneClass:string, ScenePersist:boolean, SceneFeatures:string = "null" ) : void
	{
	}	
	
	//*************** Navigator getter setters - 
	
	public connectToTutor(parentTutor:CEFTutorRoot, autoTutor:Object) : void
	{
		CTutorState.prntTutor = parentTutor;
		CTutorState.TutAutomator = autoTutor;
	}
	
	
	//*************** Navigator getter setters - 
	// Override these within a subclass to set the root of a navigation sequence
	protected get scenePrev() :number 
	{
		return 0;
	}
	protected set scenePrev(scenePrevINT:number) 
	{
	}
	
	protected get sceneCurr() :number 
	{
		return 0;
	}
	protected set sceneCurr(sceneCurrINT:number) 
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
	
	protected get sceneTitle() :Array<string>						// initialize the Tutor specific scene titles
	{
		return new Array();
	}
	protected set sceneTitle(sceneTitleARRAY:Array<string>)			// initialize the Tutor specific scene titles
	{
	}
	
	protected get sceneSeq() :Array<string>							// initialize the Tutor specific scene sequence
	{
		return new Array();
	}		
	protected set sceneSeq(sceneSeqARRAY:Array<string>) 			// initialize the Tutor specific scene sequence
	{
	}		
	
	protected get scenePage() :Array<string>						// initialize the Tutor specific scene sequence
	{
		return new Array();
	}		
	protected set scenePage(scenePageARRAY:Array<string>) 			// initialize the Tutor specific scene sequence
	{
	}		
	
	protected get sceneName() :Array<string>						// initialize the Tutor specific scene sequence
	{
		return new Array();
	}		
	protected set sceneName(sceneSeqARRAY:Array<string>) 			// initialize the Tutor specific scene sequence
	{
	}		
	
	protected get sceneClass() :Array<string>						// initialize the Tutor specific scene sequence
	{
		return new Array();
	}		
	protected set sceneClass(sceneSeqARRAY:Array<string>) 			// initialize the Tutor specific scene sequence
	{
	}		
	
	protected get scenePersist() :Array<string>						// initialize the Tutor specific scene sequence
	{
		return new Array();
	}		
	protected set scenePersist(sceneSeqARRAY:Array<string>) 		// initialize the Tutor specific scene sequence
	{
	}		
	
	

	// Deprecated - Jul 18 2013 - unused
	
//		public getScene() : string
//		{
//			// returns the scene ordinal in the sequence array or 0
//			//
//			return this.sceneSeq[this.sceneCurr];
//		}


	// Deprecated - Jul 18 2013 - unused
	
//		/**
//		 * insert a new scene at the given sequence index
//		 * 
//		 * @param	sceneNdx   - The index of the current scene
//		 * @param	this.sceneName  - The name of the Scene to insert
//		 * @param	sceneTitle - The title of the Scene to insert
//		 * @return
//		 */
//		public insertScene(SceneNdx:number, SceneName:string, SceneTitle:string ) : CEFScene
//		{
//			// returns the scene ordinal in the sequence array or 0
//			//
//			sceneTitle.splice(SceneNdx + 1, 0, SceneTitle); 
//			  this.sceneSeq.splice(SceneNdx + 1, 0, SceneName); 
//			
//			return TutAutomator[this.sceneSeq[SceneNdx]].instance;
//		}		
	
	
	//@@ Mod Jul 18 2013 - public -> private
	
	private findSceneOrd(tarScene:string) :number
	{
		if(this.traceMode) CUtil.trace("findSceneOrd: " + tarScene);
		
		let i1:number;
		let ordScene:number = 0;
		let newScene:string; 
		
		// Find the ordinal for the requested scene Label
		//
		for(i1 = 0 ; i1 < this.sceneCnt ; i1++)
		{
			if(this.sceneSeq[i1] == tarScene)
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
		if(this.traceMode) CUtil.trace("Nav To: " + tarScene);
		
		let ordScene:number = -1;
		let newScene:string = ""; 
		let redScene:string = "";
		
		//@@ Mod Sep 27 2011 - protect against recurrent calls
		
		if(this._inNavigation) 
					return;
		
					this._inNavigation = true;
		
		//@@ 
		
		// In demo mode we defer any demo button clicks while scene changes are in progress
		
		if(CTutorState.fDemo)
			CTutorState.fDeferDemoClick = true;
		
		// Find the ordinal for the requested scene Label
		//
		ordScene = this.findSceneOrd(tarScene);
		
		// If we don't find the requested scene just skip it
		//
		if(ordScene >= 0)
		{
			if(this.traceMode) CUtil.trace("Nav GoTo Found: " + tarScene);
			
			// remember current frame
			
			this.scenePrev = this.sceneCurr;
		
			// No redirection if switching to demo navigator scene
			
			if(tarScene == "SdemoScene")
			{
				// Do the exit behavior
				
				CTutorState.TutAutomator[this.sceneSeq[this.sceneCurr]].instance.preExitScene("WOZGOTO", this.sceneCurr);
				
				// switch the curent active scene
				
				this.sceneCurr = ordScene;		
			}
			// Allow current scene to update next scene dynamically
			
			else switch(redScene = CTutorState.TutAutomator[this.sceneSeq[this.sceneCurr]].instance.preExitScene("WOZGOTO", this.sceneCurr))
			{
				case CONST.CANCELNAV: 						// Do not allow scene to change
						if(CTutorState.fDemo)
							CTutorState.fDeferDemoClick = false;
						
						//@@ Mod Sep 27 2011 - protect against recurrent calls
						
						this._inNavigation = false;
						
						return;				
						
				case CONST.OKNAV: 							// Move to GOTO scene 
					this.sceneCurr = ordScene;						
						break;
				
				default: 								// Goto the scene defined by the current scene
					this.sceneCurr = this.findSceneOrd(redScene);					
			}
			
			// Do scene Specific initialization - scene returns the Label of the desired target scene
			// This allows the scene to do redirection
			// We allow iterative redirection
			//
			for(redScene = this.sceneSeq[this.sceneCurr] ; redScene != newScene ; )
			{
				//*** Create scene on demand
				//
				if(CTutorState.TutAutomator[this.sceneSeq[this.sceneCurr]] == undefined)
				{
					CTutorState.prntTutor.instantiateScene(this.sceneName[this.sceneCurr], this.sceneClass[this.sceneCurr]);
				}
				
				newScene = redScene;
				
				redScene = CTutorState.TutAutomator[this.sceneSeq[this.sceneCurr]].instance.preEnterScene(CTutorState.prntTutor, newScene, this.sceneTitle[this.sceneCurr], this.scenePage[this.sceneCurr], "WOZGOTO");

				//@@@ NOTE: either discontinue support for redirection through PreEnterScene - or manage scene creation and destruction here
				
				if(redScene == "WOZNEXT")
				{
					this.sceneCurrINC;
					redScene = this.sceneSeq[this.sceneCurr];
				}
				if(redScene == "WOZBACK")
				{
					this.sceneCurrDEC;
					redScene = this.sceneSeq[this.sceneCurr];
				}
				// Find the ordinal for the requested scene Label
				//
				else
				this.sceneCurr = this.findSceneOrd(redScene);					
			}
			
			//@@ Action Logging
			let logData:any = {'navevent':'navgoto', 'curscene':this.scenePrev, 'newscene':redScene};
			//letxmlVal:XML = <navgoto curscene={this.scenePrev} newscene={redScene}/>
							
			CTutorState.gLogR.logNavEvent(logData);				
			//@@ Action Logging			
			
			// On exit behaviors
			
			CTutorState.TutAutomator[this.sceneSeq[this.scenePrev]].instance.onExitScene();
			
			// Initialize the stategraph for the new scene
			
			
			// Do the scene transitions
			
			CTutorState.prntTutor.xitions.addEventListener(CEFEvent.COMPLETE, this.doEnterScene);			
			CTutorState.prntTutor.xitions.gotoScene(redScene);							
		}
	}

	/**
	 * gotoNextScene Event driven entry point
	 * @param	evt
	 */
	public onButtonNext(evt:CEFMouseEvent) : void
	{
		//@@ debug - for building XML spec of Tutor spec only - captureSceneGraph
		//			 note allowed for non-click events - i.e. virtual invocations see: CONST.launchTutors():
//			if(evt != null)
//				gTutor.captureSceneGraph();			
		
		this.gotoNextScene();
	}
	
	/**
	 * 	recoverState - called from CONST.launchTutors to restart an interrupted session
	 */
	public recoverState() : void
	{
	}
	
	
	/**
	 * gotoNextScene manual entry point
	 */
	public gotoNextScene() : void
	{
		if(this.traceMode) CUtil.trace("Nav Next: " );
		
		let newScene:string; 
		let redScene:string = "";
		
		//@@ Mod Sep 27 2011 - protect against recurrent calls
		
		if(this._inNavigation) 
			return;
		
		this._inNavigation = true;
						
		//@@ 						
		// In demo mode we defer any demo button clicks while scene changes are in progress
		
		if(CTutorState.fDemo)
			CTutorState.fDeferDemoClick = true;
					
		if(this.sceneCurr < this.sceneCnt)
		{
			// remember current frame
			//
			if(this.traceMode) CUtil.trace("this.scenePrev: " + this.scenePrev + "  - this.sceneCurr: " + this.sceneCurr);
			this.scenePrev = this.sceneCurr;

			// Do scene Specific termination 
			//
			if (this.traceMode) CUtil.trace("this.sceneSeq[this.sceneCurr]: " + this.sceneSeq[this.sceneCurr]);
			
			// Allow current scene to update next scene dynamically
			//
			switch(redScene = CTutorState.TutAutomator[this.sceneSeq[this.sceneCurr]].instance.preExitScene("WOZNEXT", this.sceneCurr))
			{
				case CONST.CANCELNAV: 						// Do not allow scene to change
						if(CTutorState.fDemo)
							CTutorState.fDeferDemoClick = false;
						
						//@@ Mod Sep 27 2011 - protect against recurrent calls
						
						this._inNavigation = false;
						
						return;				
						
				case CONST.OKNAV: 							// Move to next scene in sequence
						this.sceneCurrINC;					
						break;
				
				default: 								// Goto the scene defined by the current scene
						this.sceneCurr = this.findSceneOrd(redScene);					
			}
			
			// Do scene Specific initialization - scene returns the Label of the desired target scene
			// This allows the scene to do redirection
			// We allow iterative redirection
			//
			for(redScene = this.sceneSeq[this.sceneCurr] ; redScene != newScene ; )
			{
				//CTutorState.prntTutor.enumScenes();	//@@debug
				
				//*** Create scene on demand
				//
				CUtil.trace(this.sceneSeq[this.sceneCurr]);
				CUtil.trace(CTutorState.TutAutomator[this.sceneSeq[this.sceneCurr]]);
				
				if(CTutorState.TutAutomator[this.sceneSeq[this.sceneCurr]] == undefined)
				{
					CTutorState.prntTutor.instantiateScene(this.sceneName[this.sceneCurr], this.sceneClass[this.sceneCurr]);
				}
				
				newScene = redScene;
				
				//@@@ NOTE: either discontinue support for redirection through PreEnterScene - or manage scene creation and destruction here
				
				redScene = CTutorState.TutAutomator[this.sceneSeq[this.sceneCurr]].instance.preEnterScene(CTutorState.prntTutor, newScene, this.sceneTitle[this.sceneCurr], this.scenePage[this.sceneCurr], "WOZNEXT");
				
				// Skip to next scene in sequence
				if(redScene == "WOZNEXT")
				{
					this.sceneCurrINC;
					redScene = this.sceneSeq[this.sceneCurr];
				}
				// Stay were we are
				if(redScene == "WOZBACK")
				{
					this.sceneCurrDEC;
					redScene = this.sceneSeq[this.sceneCurr];
				}
				// Goto scene by name 
				// Find the ordinal for the requested scene Label
				else
					this.sceneCurr = this.findSceneOrd(redScene);					
			}
			
			//@@ Action Logging
			let logData:Object = {'navevent':'navnext', 'curscene':this.scenePrev, 'newscene':redScene};
			//letxmlVal:XML = <navnext curscene={this.scenePrev} newscene={redScene}/>
			
			CTutorState.gLogR.logNavEvent(logData);				
			//@@ Action Logging							
			
			// On exit behaviors
			
			CTutorState.TutAutomator[this.sceneSeq[this.scenePrev]].instance.onExitScene();
			
			// Do the scene transitions
			CTutorState.prntTutor.xitions.addEventListener(CEFEvent.COMPLETE, this.doEnterNext);			
			CTutorState.prntTutor.xitions.gotoScene(redScene);							
		}
	}


	/**
	 * prevScene Event driven entry point
	 * @param	evt
	 */
	public onButtonPrev(evt:CEFMouseEvent) : void
	{	
		this.gotoPrevScene();
	}		
	
	/**
	 * prevScene manual entry point
	 * Mod Jul 18 2013 - public -> private
	 */
	private gotoPrevScene()
	{				
		if(this.traceMode) CUtil.trace("Nav Back: " );
							
		let newScene:string = ""; 
		let redScene:string = "";
					
		//@@ Mod Sep 27 2011 - protect against recurrent calls
		
		if(this._inNavigation) 
			return;
		
		this._inNavigation = true;
		
		//@@ 
		// In demo mode we defer any demo button clicks while scene changes are in progress
		
		if(CTutorState.fDemo)
			CTutorState.fDeferDemoClick = true;
					
		if(this.sceneCurr >= 1)		
		{
			// remember current frame
			//
			this.scenePrev = this.sceneCurr;

			// Allow current scene to update next scene dynamically
			//
			switch(redScene = CTutorState.TutAutomator[this.sceneSeq[this.sceneCurr]].instance.preExitScene("WOZBACK", this.sceneCurr))
			{
				case CONST.CANCELNAV: 						// Do not allow scene to change
						if(CTutorState.fDemo)
							CTutorState.fDeferDemoClick = false;
					
						//@@ Mod Sep 27 2011 - protect against recurrent calls
						
						this._inNavigation = false;
						
						return;				
						
				case CONST.OKNAV: 							// Move to next scene in sequence
						this.sceneCurrDEC;					
						break;
				
				default: 								// Goto the scene defined by the current scene
						this.sceneCurr = this.findSceneOrd(redScene);					
			}
			
			// Do scene Specific initialization - scene returns the Label of the desired target scene
			// This allows the scene to do redirection
			// We allow iterative redirection
			//
			for(redScene = this.sceneSeq[this.sceneCurr] ; redScene != newScene ; )
			{
				newScene = redScene;
				
				redScene = CTutorState.TutAutomator[this.sceneSeq[this.sceneCurr]].instance.preEnterScene(CTutorState.prntTutor, newScene, this.sceneTitle[this.sceneCurr], this.scenePage[this.sceneCurr], "WOZBACK");
								
				if(redScene == "WOZNEXT")
				{
					this.sceneCurrINC;
					redScene = this.sceneSeq[this.sceneCurr];
				}
				if(redScene == "WOZBACK")
				{
					this.sceneCurrDEC;
					redScene = this.sceneSeq[this.sceneCurr];
				}
				// Find the ordinal for the requested scene Label
				//
				else
					this.sceneCurr = this.findSceneOrd(redScene);					
			}
			
			//@@ Action Logging
			let logData:Object = {'navevent':'navback', 'curscene':this.scenePrev, 'newscene':redScene};
			//letxmlVal:XML = <navback curscene={this.scenePrev} newscene={redScene}/>
			
			CTutorState.gLogR.logNavEvent(logData);				
			//@@ Action Logging			
			
			// On exit behaviors
			
			CTutorState.TutAutomator[this.sceneSeq[this.scenePrev]].instance.onExitScene();
			
			// Do the scene transitions
			CTutorState.prntTutor.xitions.addEventListener(CEFEvent.COMPLETE, this.doEnterBack);			
			CTutorState.prntTutor.xitions.gotoScene(redScene);							
		}
	}


	// Performed immediately after scene is fullly onscreen
	//@@ Mod Jul 18 2013 - public -> private
	//
	protected doEnterNext(evt:Event) : void
	{
		if(this.traceMode) CUtil.trace("this.doEnterNext: " , this.sceneCurr);
		
		CTutorState.prntTutor.xitions.removeEventListener(CEFEvent.COMPLETE, this.doEnterNext);						
		
		//*** Destroy non persistent scenes
		//
		if(!this.scenePersist[this.scenePrev])
		{
			// remove it from the tutor itself
			
			CTutorState.prntTutor.destroyScene(this.sceneName[this.scenePrev]);
		}
		
		// Do scene Specific Enter Scripts
		//
		CTutorState.TutAutomator[this.sceneSeq[this.sceneCurr]].instance.onEnterScene("WOZNEXT");
		
		//CTutorState.prntTutor.enumScenes();	//@@debug

		// In demo mode defer demo clicks while scene switches are in progress
		
		if(CTutorState.fDemo)
			CTutorState.prntTutor.dispatchEvent(new Event("deferedDemoCheck"));
		
		//@@ Mod Sep 27 2011 - protect against recurrent calls
		
		this._inNavigation = false;
		
		//@@ DEBUG
		//dumpStage(stage, "stage");			
		
	}
				
	// Performed immediately after scene is fullly onscreen
	//@@ Mod Jul 18 2013 - public -> private
	//
	protected doEnterBack(evt:Event) : void
	{
		if(this.traceMode) CUtil.trace("doEnterBack: " , this.sceneCurr);
		
		CTutorState.prntTutor.xitions.removeEventListener(CEFEvent.COMPLETE, this.doEnterBack);						

		//*** Destroy non persistent scenes
		//
		if(!this.scenePersist[this.scenePrev])
		{
			CTutorState.prntTutor.destroyScene(this.sceneName[this.scenePrev]);
		}
		
		// Do scene Specific Enter Scripts
		//
		CTutorState.TutAutomator[this.sceneSeq[this.sceneCurr]].instance.onEnterScene("WOZBACK");
		
		// In demo mode defer demo clicks while scene switches are in progress
		
		if(CTutorState.fDemo)
			CTutorState.prntTutor.dispatchEvent(new Event("deferedDemoCheck"));

		//@@ Mod Sep 27 2011 - protect against recurrent calls
		
		this._inNavigation = false;
		
	}
	
	// Performed immediately after scene is fully onscreen
	//@@ Mod Jul 18 2013 - public -> private
	//
	protected doEnterScene(evt:Event) : void
	{
		if(this.traceMode) CUtil.trace("this.doEnterScene: " , this.sceneCurr);
		
		CTutorState.prntTutor.xitions.removeEventListener(CEFEvent.COMPLETE, this.doEnterScene);						

		//*** Destroy non persistent scenes
		//
		if(!this.scenePersist[this.scenePrev])
		{
			CTutorState.prntTutor.destroyScene(this.sceneName[this.scenePrev]);
		}
		
		// Do scene Specific Enter Scripts
		//
		CTutorState.TutAutomator[this.sceneSeq[this.sceneCurr]].instance.onEnterScene("WOZGOTO");
		
		// In demo mode defer demo clicks while scene switches are in progress
		
		if(CTutorState.fDemo)
			CTutorState.prntTutor.dispatchEvent(new Event("deferedDemoCheck"));
		
		//@@ Mod Sep 27 2011 - protect against recurrent calls
		
		this._inNavigation = false;
		
	}
	
}
