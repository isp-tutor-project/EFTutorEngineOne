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
/// <reference types= "easeljs"/>

/// <reference path = "CEFScene.ts"/>
/// <reference path = "CEFNavigator.ts"/>
/// <reference path = "../util/CUtil.ts"/>
/// <reference path = "../network/ILogManager.ts"/>




namespace TutorEngineOne {

//** Imports

import MovieClip     		  = createjs.MovieClip;
import DisplayObject 		  = createjs.DisplayObject;
import DisplayObjectContainer = createjs.Container;


var EFengine:any;


export class CEFRoot extends MovieClip
{				
	public traceMode:boolean;
	
	public wozName:string;
	private _listenerArr:Array<Function|Object> = new Array;	// Array of listeners on this object - 
		
	public static STAGEWIDTH:number  = 1024;  
	public static STAGEHEIGHT:number = 768;  

//*** parent scene linkage
	public parentScene:CEFScene;
	
//*** global scene graph XML declaration
		
	public static gSceneConfig:any;								// The factory definition object used to create the scene structure
	public static gSceneGraphDesc:any;							// The factory definition object used to create the scene Graph		
	public static gAnimationGraphDesc:any;						// The factory definition object used to create animation graphs for specified scenes
	
//*** Demo configuration
	
	public static fRemoteMode:boolean	  = false;				// Used to control SWFLoader security domain
	public static fDemo:boolean  	 	  = true;				// Controls the insertion of the demo selection scene 
	public static fDebug:boolean 	 	  = true;				// Controls whether the server connection is used			
	public static fLog:boolean   	   	  = false;				// Controls whether logging is used or not		Note: Affects ILogManager constructor
	public static fDeferDemoClick:boolean = true;				// defer demo button clicks while scene changes are in progress
	
//********
	
	public static fTutorPart:string = "Intro & Ramp Pre-test";	// Goes in to the xml header to indicate the portion of the tutor the file represents - deprecated Jun 6 2013 - see CLogManager 
	public static fFullSignIn:boolean = false;					// Set dynamically based upon Feature Set		
	
//****************		
	
	public static fSkipAssess:boolean      = false;				// Controls where to go after the ramp test - user trials support 	
	public static fEnableBack:boolean      = true;				// force all back buttons to enabled
	public static fForceBackButton:boolean = true;				//@@ Mod May 22 2013 - Prepost module integration - back button behaves different in prepost then anywhere else
																//                     So in general outside the prepost we force the back button to off
	public static fSkillometer:boolean 	   = false;				//@@ Mod Mar2 2012 - support for showing skillometer in loader

//********
	
	public static sessionAccount:any	   = new Object();		//@@ Mod Dec 03 2013 - session Account data  
	
	public static fSessionID:string;							// Unique session identifier
	public static fSessionTime:number;
	public static serverUserID:number = 0;						// Numeric user ID assigned by the logging server DB
	
	public static fPlaybackMode:boolean = false;
	
	public static WOZREPLAY:string  = "rootreplay";
	public static WOZCANCEL:string  = "rootcancel";
	public static WOZPAUSING:string = "rootpause"; 
	public static WOZPLAYING:string = "rootplay"; 

	public static gTutor:any;									// Root Tutor object - @@Mod Aug 7 2013 - public so scenegraph can access  		
	
	private static logR:ILogManager;							// Logging service connection
	private static SceneData:string = "<data/>";				// Root Tutor data cache				
	
	private static _wozInstance:number = 1;		
	private static _gNavigator:CEFNavigator;
	
//********
	
	
	/**
	 * Root Object constructor 
	 * 
	 */		
	constructor()
	{
		super();

		this.traceMode = false;
		
		if (this.traceMode) CUtil.trace("CEFRoot:Constructor");		
		
		// By default we set the woz name to the object name.
		// Sub-classes can modify wozName to have objects behave independently in CWOZTransitions
		//
		this.wozName = "CEF" + CEFRoot._wozInstance.toString();
		
		CEFRoot._wozInstance++;			
	}
	
	public Destructor() : void
	{
		if(this.traceMode) CUtil.trace("CEFRoot Destructor:");						

		// parse all the component objects - NOTE: everything must be derived from CWOZObject
		//
		let subObj:DisplayObject;
		
		for(let i1:number = 0 ; i1 < this.numChildren ; i1++)
		{
			subObj = this.getChildAt(i1) as DisplayObject;
			
			// Recurse WOZ Children
			//
			if(subObj instanceof CEFRoot)
			{
				subObj.Destructor();
			}								
		}		 
	}

	
//***************** Automation *******************************		

	public captureXMLStructure(parentXML:string, iDepth:number) : void
	{								
		// parse all the component objects - NOTE: everything must be derived from CWOZObject
		//
		let element:any;
		let elementOBJ:any = {};
		let elClass:string;
		let elwozname:string;
		
		for(let i1:number = 0 ; i1 < this.numChildren ; i1++)
		{
			element = this.getChildAt(i1) as DisplayObject;
			
			if(this.traceMode) CUtil.trace("\t\tCEFScene found subObject named:" + element.name + " ... in-place: ");

			// elClass = this.getQualifiedClassName(element);
			
			// Recurse WOZ Children
			//
			if(element instanceof CEFRoot)
			{
				elwozname = (element as CEFRoot).wozName;
			}
			else
			{
				elwozname = "null";
			}
			
			elementOBJ = new String("<obj " +" class=\"" + elClass +"\" name=\"" + element.name + "\" x=\"" + element.x + "\" y=\"" + element.y + "\" w=\"" + element.width + "\" h=\"" + element.height + "\" r=\"" + element.rotation + "\" a=\"" + element.alpha + "\"/>");
			
			// Limit the depth of recursion - optional
			
			if((iDepth < 1) && (element instanceof CEFRoot))
				(element as CEFRoot).captureXMLStructure(elementOBJ, iDepth+1);

			// parentXML.appendChild(elementOBJ);
		}
		
	}
	
	
//************** SceneConfig Initialization 

	/*
	* 
	*/
	public resetXML() : void
	{
	}		
	
	/*
		* 
		*/
	public loadXML(propVector:Object) : void
	{
	}
	
	/*
		* 
		*/
	public saveXML() : string
	{
		let stateVector:string;
		
		return stateVector;
	}

	// @@@@@@@@@@@
	public getSymbolClone(_cloneOf:string, _named:string) :string
	{
		let xClone:string = ""; 	// CEFRoot.gSceneConfig.scenedata[_cloneOf].create.symbol.(@wozname==_named).table[0];
		
		CUtil.trace(xClone);
		
		return xClone;			
	}
	
//************** SceneConfig Initialization 

//***************** Automation *******************************				
	
//***************** Globals ****************************


	public get gData():string
	{
		return CEFRoot.SceneData;
	}

	public set gData(dataXML:string) 
	{			
		CEFRoot.SceneData = dataXML;
	}

	//@@ Mod May 16 2013 - support for prepost upgrade
	
	public get gPhase():string
	{
		return CEFRoot.fTutorPart;
	}
	
	public set gPhase(phase:string) 
	{
		CEFRoot.fTutorPart = phase;
	}
	
	//@@ Mod May 07 2012 - support for relative module pathing
	
	public get gLogR(): ILogManager
	{
		return CEFRoot.logR;
	}

	public set gLogR(logr:ILogManager) 
	{
		if(this.traceMode) CUtil.trace("Connecting Logger: ");
		
		CEFRoot.logR = logr;
	}

	
	/*
	*	restore scenedata XML to allow reuse of scene 
	*/
	public resetSceneDataXML() : void
	{			
		//CEFRoot.sceneConfig.replace("scenedata", sceneDataArchive);
	}			
	

	public get gForceBackButton() : boolean 
	{		
		return CEFRoot.fForceBackButton;
	}
			
	public set gForceBackButton(fForce:boolean)
	{		
		CEFRoot.fForceBackButton = fForce;
	}
	
	public get gNavigator() : CEFNavigator 
	{		
		return CEFRoot._gNavigator;
	}
	
	public set gNavigator(navObject:CEFNavigator)
	{		
		CEFRoot._gNavigator = navObject;
	}
	
	
//***************** Globals ****************************

//****** Overridable Behaviors

//*************** Logging state management
	
//******** Experimenter LOG

	/**
	 * encode experiment state polymorphically
	 * @return An XML object representing the current object state - for the experimenter
	 */
	public logState() :string
	{
		//@@ State Logging			
		return "<null/>";
		//@@ State Logging			
	}			

//******** Experimenter LOG

//*************** Logging state management

	/**
	 * Check object status - Has user completed object initialization
	 * @return int : 1 if object has been fully user (defined - completed - setup) - 0 otherwise
	 */
	public IsUserDefined() : number
	{
		let iResult:number = 0;
		
		return iResult;
	}
	
	//@@ Mod Jun 3 2013 - changed nethod to getter to support XML logging in scenegraph spec  
	//
	public get captureLOGString() :string
	{		
		return "";					
	}		
	
	/**
	 * Capture an XML instance of the scene state for logging purposes
	 * @return
	 */
	public captureLOGState() :string
	{		
		return "<null />";
	}		
	
	/**
	 * Provides a safe way to check for property existance on sealed classes
	 * Watch uses - ActionScript worked differently - 
	 * hasOwnProperty checks class
	 * in checks prototype chain.
	 * @param	prop - String name of the property to check
	 * @return  true - property is extant :   false - property is not extant
	 */
	public isDefined(prop:string) : boolean
	{
		let fResult:boolean;
		
		try
		{			
			if(this.hasOwnProperty(prop))
			{
				fResult = true;			
			}
		}
		catch(err)
		{
			if(this.traceMode) CUtil.trace(prop + " is Undefined");
			fResult = false;
		}	
		
		return fResult;
	}
	
//*********** PLAY PAUSE STOP 		


	/**
	 * Overload the play so that we can start and stop from array references
	 * 
	 */
	public superPlay(): void	
	{
		if(this.traceMode) CUtil.trace(name + " Super Play");
		
		//@@
		if(name == "SgenericPrompt")
			CUtil.trace("SgenericPrompt Play Found in superPlay");
		//@@
		
		super.play();
	}
			
	/**
	 * Overload the play so that we can start and stop from array references
	 * 
	 */
	public superStop(): void	
	{
		if(this.traceMode) CUtil.trace(name + " Super Stop");
		
		super.stop();
	}
			
	/**
	 * Overload the gotoAndStop so that we can track what movies are playing and which aren't
	 * 
	 */
	public gotoAndStop(frame:Object, scene:string = null):void 
	{
		if(this.traceMode) CUtil.trace(name + " is stopped at : " + frame + ":" + scene);		
		
		if(CEFRoot.gTutor) CEFRoot.gTutor.playRemoveThis(this);
		
		super.gotoAndStop(frame + ":" + scene);
	}
	
	/**
	 * Overload the stop so that we can track what movies are playing and which aren't
	 * 
	 */
	public stop(): void	
	{
		if(this.traceMode) CUtil.trace(name + " is stopped");
		
		if(CEFRoot.gTutor) CEFRoot.gTutor.playRemoveThis(this);

		super.stop();
	}
	
	/**
	 * Overload the gotoAndPlay so that we can track what movies are playing and which aren't
	 * 
	 */
	public gotoAndPlay(frame:Object, scene:string = null):void 
	{
		if(this.traceMode) CUtil.trace(name + " is playing at : " + frame + ":" + scene);
		
		//@@
		if(name == "SgenericPrompt")
			CUtil.trace("SgenericPrompt Play Found in gotoAndPlay");
		//@@
		
		if(CEFRoot.gTutor) CEFRoot.gTutor.playAddThis(this);
		super.gotoAndPlay(frame + ":" + scene);
	}
	
	/**
	 * Overload the play so that we can track what movies are playing and which aren't
	 * 
	 */
	public play(): void	
	{
		if(this.traceMode) CUtil.trace(name + " is playing");
		
		//@@
		if(name == "SgenericPrompt")
			CUtil.trace("SgenericPrompt Play Found in Play");
		//@@
		
		if(CEFRoot.gTutor) CEFRoot.gTutor.playAddThis(this);
		super.play();
	}
			
	/**
	 * wozPlay allows late binding to the Tutor object - use for scene object etc that are created after initAutomation call
	 * 
	 */
	public bindPlay(tutor:CEFTutorRoot ): void	
	{
		if(this.traceMode) CUtil.trace(name + " is playing");

		//@@
		if(name == "SgenericPrompt")
					CUtil.trace("SgenericPrompt Play Found in BindPlay");
		//@@
		
		if(CEFRoot.gTutor) CEFRoot.gTutor.playAddThis(this);
		super.play();
	}
	
	public setTopMost() : void 
	{			
		let topPosition:number;
		
		try
		{
			if(CEFRoot.gTutor) 
			{
				topPosition = CEFRoot.gTutor.numChildren - 1;
				CEFRoot.gTutor.setChildIndex(this, topPosition);				
			}
		}
		catch(err)
		{
			// Just ignore if we aren't a child yet 
		}
	}
	
	
//*********** PLAY PAUSE STOP 		

//************ Session Timing

	public startSession() : void 
	{
		// Init the start time of the session
		
		CEFRoot.fSessionTime = CUtil.getTimer();
	}

	public get sessionTime() :string
	{
		let curTime:Number;
		
		curTime = (CUtil.getTimer() - CEFRoot.fSessionTime) / 1000.0;
		
		return curTime.toString();
	}



//************ Session Timing

//****** Overridable Behaviors


	public instantiateObject(objectClass:string) : DisplayObject
	{			
		let tarObject:any;
		
		let ClassRef:any = this.getDefinitionByName(objectClass);
		
		tarObject = new ClassRef;
		
		return tarObject;			
	}


	public getDefinitionByName(className:string) : any {

		let classConstructor:Function;

		classConstructor = EFengine.efLibrary[className];

		return classConstructor;
	}


//***************** Debug *******************************		
	
	
	public dumpStage(_obj:DisplayObjectContainer, _path:string ) : void
	{					
		let sceneObj:DisplayObject;
		
		for(let i1:number = 0 ; i1 < _obj.numChildren ; i1++)
		{
			sceneObj   = _obj.getChildAt(i1) as DisplayObject;				
			
			if(sceneObj)
			{
				CUtil.trace(_path+"."+sceneObj["name"] + " visible : " + ((sceneObj.visible)? " true":" false"));
				
				if(sceneObj as DisplayObjectContainer)
					this.dumpStage(sceneObj as DisplayObjectContainer, _path+"."+sceneObj["name"]);
			}
		}	
	}
			
//***************** Debug *******************************		
	
}
}