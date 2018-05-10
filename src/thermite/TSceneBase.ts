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


import { TRoot } 			from "./TRoot";
import { TObject } 			from "./TObject";
import { TTutorContainer } 	from "../thermite/TTutorContainer";

import { CEFActionEvent } 	from "../events/CEFActionEvent";
import { CEFScriptEvent } 	from "../events/CEFScriptEvent";
import { CEFSeekEvent }		from "../events/CEFSeekEvent";

import { ILogManager }  	from "../managers/ILogManager";


import { CONST }            from "../util/CONST";
import { CUtil } 			from "../util/CUtil";

import DisplayObject      = createjs.DisplayObject;
import MovieClip     	  = createjs.MovieClip;


export class TSceneBase extends TObject
{		

	public fComplete:boolean = false;			// scene Complete Flag
	
	// For scenes with Timelines, these arrays are used to fire the appropriate code events 
	// as the user seeks the play head.
	//
	public seekForeFunc:Array<any>;
	public seekBackFunc:Array<any>;
	
	public sceneAttempt:number = 1;		
	public sceneTag:string;
	
	protected _section:string;					// Arbitrary tutor section id
	
	
	/**
	 * Scene Constructor
	 */
	constructor()
	{
		super();
		this.init3();
	}


/*  ###########  START CREATEJS SUBCLASS SUPPORT ##########  */
/* ######################################################### */

	public TSceneBaseInitialize() {

		this.TObjectInitialize.call(this);
		this.init3();
	}

	public initialize() {

		this.TObjectInitialize.call(this);		
		this.init3();
	}

	private init3() {
		
		this.traceMode = true;
		if(this.traceMode) CUtil.trace("TSceneBase:Constructor");			
	}

/* ######################################################### */
/*  ###########  END CREATEJS SUBCLASS SUPPORT ###########   */




	public onCreate() : void
	{
		try {
			// if(this.tutorDoc.gSceneConfig.scenedata[this.name] === undefined) {
			// 	throw("Error: scene description not found: " + this.name);
			// }
			// // Parse the Tutor.config for create procedures for this scene 
			
			// if(this.tutorDoc.gSceneConfig.scenedata[this.name].create != undefined)
			// 	this.parseOBJ(this, this.tutorDoc.gSceneConfig.scenedata[this.name].create, "create");

			// //## Mod May 04 2014 - support declarative button actions from scenedescr.xml <create>
			// if(this.onCreateScript != null)
			// 			this.doCreateAction();
			
			// //## Mod Oct 25 2012 - support for demo scene-initialization
			
			// if((this.tutorDoc.gSceneConfig != null) && (this.tutorDoc.gSceneConfig.scenedata[this.name].demoinit != undefined))
			// 	this.parseOBJ(this, this.tutorDoc.gSceneConfig.scenedata[this.name].demoinit.children(), "demoinit");
		}		
		catch(error) {
			console.log("TScene.onCreate Failed: " + error);
		}
	}

	public addChild(obj:DisplayObject) : DisplayObject {

		super.addChild(obj);

		return obj;
	}


	/**
	 *  Must provide valid execution context when operating at Scene level as here parentScene is NULL
	 *  
	 */
	protected doCreateAction() : void
	{
		try
		{
			eval(this.onCreateScript);
		}
		catch(e)
		{
			CUtil.trace("Error in onCreate script: " + this.onCreateScript);
		}
	}
	
	
	public doExitAction() : void
	{
		if(this.onExitScript != null)
		{		
			try
			{
				eval(this.onExitScript);
			}
			catch(e)
			{
				CUtil.trace("Error in onExit script: " + this.onExitScript);
			}
		}
	}
	
	
	/**
	 * polymorphic UI set up
	 */
	protected initUI() : void
	{
		
	}
	
//*************** Effect management - from Audio Stream
	
	/**
	 * 
	 */	
	public effectHandler(evt:CEFActionEvent) : void
	{
		if(this.traceMode) CUtil.trace("Effect Event: " + evt);
		
		(this as any)[evt.prop1](evt.prop2, evt.prop3, evt.prop4, evt.prop5);
	}		
	
	
	/**
	 * 
	 */	
	public scriptHandler(evt:CEFScriptEvent) : void
	{
		var fTest:boolean = true;
		
		if(this.traceMode) CUtil.trace("Effect Event: " + evt);

		// If initializer is featured - execute matching features
		
		if(evt.script.features != undefined)
		{
			// Each element of the fFeature vector contains an id for a feature of the tutor.
			// This permits the tutor to have multiple independently managed features.
			// All identifiers of all the feature sets must be globally unique.
			
			fTest = this.tutorDoc.tutorContainer.testFeatureSet(String(evt.script.features));
		}
		
		// Note "common" elements within the packet will search the SceneConfig space for matches,
		// which may or may not be desirable. 
		if(fTest)		
			this.parseOBJ(this, evt.script.children(), "script");
	}		
	
//*************** Effect management - from Audio Stream

//***************** Logging *******************************		

	/**
	 * encode experiment tag polymorphically
	 * 
	 */
	public logSceneTag() : Object
	{
		//@@ State Logging - return polymorphic tag info
		
		return {'scenetag':this.sceneTag, 'attempt':this.sceneAttempt++};		
		
		//@@ State Logging			
	}			

//***************** Logging *******************************		


//****** Overridden Behaviors
//***************** Automation *******************************		
	
	
	public initAutomation(_parentScene:TSceneBase, sceneAutoObj:any, ObjIdRef:string, lLogger:ILogManager, lTutor:TTutorContainer) : void
	{								

		// parse all the component objects - NOTE: everything must be derived from CEFObject
		//
		let propName:string;
		let childObj:any;
		let wozObj:TObject;

		// Do scripted initialization
		
		this.onCreate();							
		
		// Do Automation Capture

		// Enumerate the child objects - Animate instantiates these as properties of the object 
		// itself and only adds them to the display list as managedChildren in a Tween
		//
		let nonTObj:Array<string> = Object.getOwnPropertyNames(_parentScene);
		
		for(propName of nonTObj) {

			childObj = _parentScene[propName];
			
			// Skip any Tutor container references
			//
			if(childObj instanceof TTutorContainer)
											continue;

			// Have Object determine its inplace size
			//
			if(childObj instanceof TObject)
			{
				//## Mod Apr 14 2014 - maintain linkage to parent scene - used for D.eval execution context
				//  - e.g. button script execution
				// 
				childObj.parentScene = _parentScene;
				
				(childObj as TObject).measure();					
			}
			

			if(childObj instanceof DisplayObject)
			{
				// Record each Object within scene
				//
				sceneAutoObj[childObj.name] = {};
				sceneAutoObj[childObj.name].instance = childObj;										
						
				// Record object in-place position - This is only done for top level objects in scene to record their inplace positions 
				// for inter-scene tweening.
				//
				sceneAutoObj[childObj.name].inPlace = childObj._cloneProps({});

				// sceneAutoObj[childObj.name].inPlace = {X:childObj.x, Y:childObj.y, Width:childObj.width, Height:childObj.height, Alpha:childObj.alpha};	 //** TODO */							

				if(this.traceMode) CUtil.trace("\t\tTScene found subObject named:" + childObj.name + " ... in-place: ");

				// Recurse WOZ Children
				//
				if(childObj instanceof TObject)
				{
					wozObj = childObj as TObject;				// Coerce the Object					
					wozObj.initAutomation(_parentScene, sceneAutoObj[childObj.name], name+".", lLogger, lTutor);
				}
				
				if(this.traceMode) for(var id in sceneAutoObj[childObj.name].inPlace)
				{
					CUtil.trace("\t\t\t\t" + id + " : " + sceneAutoObj[childObj.name].inPlace[id]);
				}						
			}
		}
	}
	
	
	// Walk the WOZ Objects to capture their default state
	//
	public captureDefState(TutScene:any ) : void 
	{
		if(this.traceMode) CUtil.trace("\t*** Start Capture - Walking Top Level Objects***");

		for(var sceneObj in TutScene)
		{			
			if(sceneObj != "instance" && TutScene[sceneObj].instance instanceof TObject)
			{
				if(this.traceMode) CUtil.trace("capturing: " + TutScene[sceneObj].instance.name);
				
				TutScene[sceneObj].instance.captureDefState(TutScene[sceneObj] );										
			}					
		}		
		if(this.traceMode) CUtil.trace("\t*** End Capture - Walking Top Level Objects***");
	}
	
	
	// Walk the WOZ Objects to restore their default state
	//
	public restoreDefState(TutScene:any ) : void 
	{
		if(this.traceMode) CUtil.trace("\t*** Start Restore - Walking Top Level Objects***");

		for(var sceneObj in TutScene)
		{			
			if(sceneObj != "instance" && TutScene[sceneObj].instance instanceof TObject)
			{
				if(this.traceMode) CUtil.trace("restoring: " + TutScene[sceneObj].instance.name);
				
				TutScene[sceneObj].instance.restoreDefState(TutScene[sceneObj] );									
			}					
		}		
		if(this.traceMode) CUtil.trace("\t*** End Restore - Walking Top Level Objects***");
	}
	
	
	// Walk the WOZ Objects to initialize their automation mode
	//
	public setObjMode(TutScene:any, sMode:string) : void 
	{
		if(this.traceMode) CUtil.trace("\t*** Start - Walking Top Level Objects***");

		for(var sceneObj in TutScene)
		{			
			if(sceneObj != "instance" && TutScene[sceneObj].instance instanceof TObject)
			{
				TutScene[sceneObj].instance.setAutomationMode(TutScene[sceneObj], sMode );										
			}					
		}		
		if(this.traceMode) CUtil.trace("\t*** End - Walking Top Level Objects***");
	}
	
	
//***************** Automation *******************************		
//****** Overridden Behaviors
	
	
//***************** Debug *******************************		
		
	public dumpSceneObjs(TutScene:any) : void
	{				
		for(var sceneObj in TutScene)
		{
			if(this.traceMode) CUtil.trace("\tSceneObj : " + sceneObj);
			
			if(sceneObj != "instance" && TutScene[sceneObj].instance instanceof TObject)
			{
				if(this.traceMode) CUtil.trace("\tCEF***");
				
				TutScene[sceneObj].instance.dumpSubObjs(TutScene[sceneObj], "\t");										
			}					
		}		
	}
	
//***************** Debug *******************************		

//****** Overridable Behaviors

	/**
	 * Polymorphic Navigation enabling
	*/
	public updateNav() : void 
	{
		if(this.traceMode) CUtil.trace("UpdateNavigation: ", name, this.fComplete);
		
		// Update the Navigation
		//
		if(!this.fComplete)
			this.tutorDoc.tutorContainer.enableNext(false);		
		else	
			this.tutorDoc.tutorContainer.enableNext(true);		
			
		if(this.tutorDoc.gForceBackButton)
			this.tutorDoc.tutorContainer.enableBack(this.tutorDoc.fEnableBack);																		
	}

	/**
	 * Polymorphic question complete criteria
	*/
	public questionFinished(evt:Event) : void 
	{
		// User selection has been made
		//
		this.fComplete = true;
		
		// Update the Navigation
		//
		this.updateNav();
	}

	
	/**
	 * Polymorphic question complete criteria
	 */
	public questionComplete() : boolean 
	{
		// User selection has been made
		//
		return this.fComplete;
	}

	
//****** Navigation Behaviors

	// Default behavior - Set the Tutor Title and return same target scene
	// Direction can be - "WOZNEXT" , "WOZBACK" , "WOZGOTO"
	// 
	// return values - label of target scene or one of "WOZNEXT" or "WOZBACK"
	//
	public preEnterScene(lTutor:any, sceneLabel:string, sceneTitle:string, scenePage:string, Direction:string ) : string
	{
		if(this.traceMode) CUtil.trace("Base Pre-Enter Scene Behavior: " + sceneTitle);		
		
		// Update the title				
		//
		// lTutor.StitleBar.Stitle.text = sceneTitle;
		// lTutor.StitleBar.Spage.text  = scenePage;

		// Set fComplete and do other demo specific processing here
		// deprecated 
		this.demoBehavior();
		
		// Parse the Tutor.config for preenter procedures for this scene 
		
		// if((this.tutorDoc.gSceneConfig != null) && (this.tutorDoc.gSceneConfig.scenedata[this.name].preenter != undefined))			
		// 								this.parseOBJ(this, this.tutorDoc.gSceneConfig.scenedata[this.name].preenter.children(), "preenter");				

		//@@ Mod May 22 2013 - moved to after the XML spec is executed - If the user uses the back button this should
		//                     override the spec based on fComplete
		// Update the Navigation
		//
		if(this.fComplete)
		this.updateNav();						
		
		// polymorphic UI initialization - must be done after this.parseOBJ 
		//
		this.initUI();				
			
		return sceneLabel;
	}

	
	public deferredEnterScene(Direction:string) : void
	{				
	}
	
	
	public onEnterScene(Direction:string) : void
	{				
		if (this.traceMode) CUtil.trace("Default Enter Scene Behavior:");
		
		// Parse the Tutor.config for onenter procedures for this scene 
		
		// if((this.tutorDoc.gSceneConfig != null) && (this.tutorDoc.gSceneConfig.scenedata[this.name].onenter != undefined))			
		// 								this.parseOBJ(this, this.tutorDoc.gSceneConfig.scenedata[this.name].onenter.children(), "onenter");						
	}
	
	// Direction can be - "NEXT" , "BACK" , "GOTO"
	// 
	public preExitScene(Direction:string, sceneCurr:number ) : string
	{
		if(this.traceMode) CUtil.trace("Default Pre-Exit Scene Behavior:");
		
		// Parse the Tutor.config for onenter procedures for this scene 
		
		// if((this.tutorDoc.gSceneConfig != null) && (this.tutorDoc.gSceneConfig.scenedata[this.name].preexit != undefined))		
		// 								this.parseOBJ(this, this.tutorDoc.gSceneConfig.scenedata[this.name].preexit.children(), "preexit");				
		
		return(CONST.OKNAV);			
	}

	public onExitScene() : void
	{				
		if (this.traceMode) CUtil.trace("Default Exit Scene Behavior:");
		
		// Parse the Tutor.config for onenter procedures for this scene 
		
		// if((this.tutorDoc.gSceneConfig != null) && (this.tutorDoc.gSceneConfig.scenedata[this.name].onexit != undefined))			
		// 								this.parseOBJ(this, this.tutorDoc.gSceneConfig.scenedata[this.name].onexit.children(), "onexit");						
	}
	
//****** DEMO Behaviors

	// Update the Navigation Features on entry
	//
	public demoBehavior() : void
	{
		if(this.traceMode) CUtil.trace("Default demoBehavior: ");		
	}

//****** DEMO Behaviors

//****** Navigation Behaviors
			
//*************** TimeLine/Seek Events		

	public initSeekArrays()
	{
		// place scene specific seek events into arrays	
	}


	public doSeekForward(evt:CEFSeekEvent) : void
	{
		switch(evt.wozSeekSeq)
		{
		}
	}


	public doSeekBackward(evt:CEFSeekEvent) : void
	{
		
	}
	
//*************** TimeLine/Seek Events		
	
//****** Overridable Behaviors
}