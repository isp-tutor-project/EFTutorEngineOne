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
//  File:      CEFScene.as
//                                                                        
//  Purpose:   CEFScene object implementation
//                                                                        
//  Author(s): Kevin Willows                                                           
//  
//  History: File Creation Apr 21 2008  
//                                                                        
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//  THE SOFTWARE.
//  THE SOFTWARE.
//
//*********************************************************************************


import { CEFRoot } 			from "./CEFRoot";
import { CEFObject } 		from "./CEFObject";

import { CEFActionEvent } 	from "../events/CEFActionEvent";
import { CEFScriptEvent } 	from "../events/CEFScriptEvent";
import { CUtil } 			from "../util/CUtil";

import { ILogManager } from "../network/ILogManager";
import { CEFTutorRoot } from "./CEFTutorRoot";
import { CEFSeekEvent } from "../events/CEFSeekEvent";

import DisplayObject      = createjs.DisplayObject;


export class CEFScene extends CEFObject
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
	public CEFScene():void
	{
		this.traceMode = false;
		if(this.traceMode) CUtil.trace("CEFScene:Constructor");			
	}

	
	public onCreate() : void
	{
		// Parse the Tutor.config for create procedures for this scene 
		
		if((CEFScene.gSceneConfig != null) && (CEFScene.gSceneConfig.scenedata[name].create != undefined))
			this.parseOBJ(this, CEFScene.gSceneConfig.scenedata[name].create.children(), "create");

		//## Mod May 04 2014 - support declarative button actions from scenedescr.xml <create>
		if(this.onCreateScript != null)
					this.doCreateAction();
		
		//## Mod Oct 25 2012 - support for demo scene-initialization
		
		if((CEFScene.gSceneConfig != null) && (CEFScene.gSceneConfig.scenedata[name].demoinit != undefined))
			this.parseOBJ(this, CEFScene.gSceneConfig.scenedata[name].demoinit.children(), "demoinit");
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
			
			fTest = CEFRoot.gTutor.testFeatureSet(String(evt.script.features));
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
	
	
	public initAutomation(_parentScene:CEFScene, scene:any, ObjIdRef:string, lLogger:ILogManager, lTutor:CEFTutorRoot) : void
	{								
		// parse all the component objects - NOTE: everything must be derived from CEFObject
		//
		var sceneObj:DisplayObject;
		var wozObj:CEFObject;
		var wozRoot:CEFRoot;

		// Do XML initialization
		
		this.onCreate();							
		
		// Do Automation Capture
		
		for(var i1:number = 0 ; i1 < this.numChildren ; i1++)
		{
			sceneObj = this.getChildAt(i1) as DisplayObject;
			
			// Record each Object within scene
			//
			scene[sceneObj.name] = new Object;
			scene[sceneObj.name].instance = sceneObj;										
			
			// Have Object determine its inplace size
			//
			if(sceneObj instanceof CEFObject)
			{
				//## Mod Apr 14 2014 - maintain linkage to parent scene - used for D.eval execution context - e.g. button script execution
				sceneObj.parentScene = _parentScene;
				
				(sceneObj as CEFObject).measure();					
			}
			
			// Record object in-place position - This is only done for top level objects in scene to record their inplace positions 
			// for inter-scene tweening.
			//
			// scene[sceneObj.name].inPlace = {X:sceneObj.x, Y:sceneObj.y, Width:sceneObj.width, Height:sceneObj.height, Alpha:sceneObj.alpha};	 //** TODO */							

			if(this.traceMode) CUtil.trace("\t\tCEFScene found subObject named:" + sceneObj.name + " ... in-place: ");

			// Recurse WOZ Children
			//
			if(sceneObj instanceof CEFObject)
			{
				wozObj = sceneObj as CEFObject;				// Coerce the Object					
				wozObj.initAutomation(_parentScene, scene[sceneObj.name], name+".", lLogger, lTutor);
			}
			
			if(this.traceMode) for(var id in scene[sceneObj.name].inPlace)
			{
				CUtil.trace("\t\t\t\t" + id + " : " + scene[sceneObj.name].inPlace[id]);
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
			if(sceneObj != "instance" && TutScene[sceneObj].instance instanceof CEFObject)
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
			if(sceneObj != "instance" && TutScene[sceneObj].instance instanceof CEFObject)
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
			if(sceneObj != "instance" && TutScene[sceneObj].instance instanceof CEFObject)
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
			
			if(sceneObj != "instance" && TutScene[sceneObj].instance instanceof CEFObject)
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
			CEFRoot.gTutor.enableNext(false);		
		else	
			CEFRoot.gTutor.enableNext(true);		
			
		if(this.gForceBackButton)
			CEFRoot.gTutor.enableBack(CEFRoot.fEnableBack);																		
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
		if(this.traceMode) CUtil.trace("Default Pre-Enter Scene Behavior: " + sceneTitle);		
		
		// Update the title				
		//
		lTutor.StitleBar.Stitle.text = sceneTitle;
		lTutor.StitleBar.Spage.text  = scenePage;

		// Set fComplete and do other demo specific processing here
		// deprecated 
		this.demoBehavior();
		
		// Parse the Tutor.config for preenter procedures for this scene 
		
		if((CEFScene.gSceneConfig != null) && (CEFScene.gSceneConfig.scenedata[name].preenter != undefined))			
										this.parseOBJ(this, CEFScene.gSceneConfig.scenedata[name].preenter.children(), "preenter");				

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
		
		if((CEFScene.gSceneConfig != null) && (CEFScene.gSceneConfig.scenedata[name].onenter != undefined))			
										this.parseOBJ(this, CEFScene.gSceneConfig.scenedata[name].onenter.children(), "onenter");						
	}
	
	// Direction can be - "NEXT" , "BACK" , "GOTO"
	// 
	public preExitScene(Direction:string, sceneCurr:number ) : string
	{
		if(this.traceMode) CUtil.trace("Default Pre-Exit Scene Behavior:");
		
		// Parse the Tutor.config for onenter procedures for this scene 
		
		if((CEFScene.gSceneConfig != null) && (CEFScene.gSceneConfig.scenedata[name].preexit != undefined))		
										this.parseOBJ(this, CEFScene.gSceneConfig.scenedata[name].preexit.children(), "preexit");				
		
		return(CEFObject.OKNAV);			
	}

	public onExitScene() : void
	{				
		if (this.traceMode) CUtil.trace("Default Exit Scene Behavior:");
		
		// Parse the Tutor.config for onenter procedures for this scene 
		
		if((CEFScene.gSceneConfig != null) && (CEFScene.gSceneConfig.scenedata[name].onexit != undefined))			
										this.parseOBJ(this, CEFScene.gSceneConfig.scenedata[name].onexit.children(), "onexit");						
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