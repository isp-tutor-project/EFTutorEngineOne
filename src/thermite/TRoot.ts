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

import { TSceneBase }     		from "./TSceneBase";

import { TTutorContainer } 	from "../thermite/TTutorContainer";
import { CEFNavigator } 	 	from "../core/CEFNavigator";

import { ILogManager }  		from "../managers/ILogManager";


import { CONST }        		from "../util/CONST";
import { CUtil } 				from "../util/CUtil";


import MovieClip     		  = createjs.MovieClip;
import DisplayObject 		  = createjs.DisplayObject;
import DisplayObjectContainer = createjs.Container;




export class TRoot extends MovieClip
{				
	public traceMode:boolean;
	
	public wozName:string;
	public static _wozInstance:number = 1;		

	public tutorDoc:IEFTutorDoc;

	protected _listenerArr:Array<Function|Object>;				// Array of listeners on this object - 
		

//*** parent scene linkage
	public parentScene:TSceneBase;
	
	// This is a special signature to avoid typescript error "because <type> has no index signature."
	// on this[<element name>]
	// 
	[key: string]: any;
	
	
	/**
	 * Root Object constructor 
	 * 
	 */		
	constructor()
	{
		super();
        this.init0();
	}

	/*  ###########  START CREATEJS SUBCLASS SUPPORT ##########  */
	/* ######################################################### */

	public TRootInitialize() {
        MovieClip.call(this);

        this.init0();
    }

    public initialize() {
        MovieClip.call(this);
		
        this.init0();
    }

    private init0() {

		this._listenerArr = new Array;
		this.traceMode = true;
		
		if (this.traceMode) CUtil.trace("TRoot:Constructor");		
		
		// By default we set the woz name to the object name.
		// Sub-classes can modify wozName to have objects behave independently in CEFTransitions
		//
		this.wozName = "CEF" + TRoot._wozInstance.toString();
		
		TRoot._wozInstance++;					
    }

	/* ######################################################### */
	/*  ###########  END CREATEJS SUBCLASS SUPPORT ###########   */


	
	public Destructor() : void
	{
		if(this.traceMode) CUtil.trace("TRoot Destructor:");						

		// parse all the component objects - NOTE: everything must be derived from CEFObject
		//
		let subObj:DisplayObject;
		
		for(let i1:number = 0 ; i1 < this.numChildren ; i1++)
		{
			subObj = this.getChildAt(i1) as DisplayObject;
			
			// Recurse WOZ Children
			//
			if(subObj instanceof TRoot)
			{
				subObj.Destructor();
			}								
		}		 
	}



//***************** Automation *******************************		

	public captureXMLStructure(parentXML:string, iDepth:number) : void
	{								
		// parse all the component objects - NOTE: everything must be derived from CEFObject
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
			if(element instanceof TRoot)
			{
				elwozname = (element as TRoot).wozName;
			}
			else
			{
				elwozname = "null";
			}
			
			elementOBJ = new String("<obj " +" class=\"" + elClass +"\" name=\"" + element.name + "\" x=\"" + element.x + "\" y=\"" + element.y + "\" w=\"" + element.width + "\" h=\"" + element.height + "\" r=\"" + element.rotation + "\" a=\"" + element.alpha + "\"/>");
			
			// Limit the depth of recursion - optional
			
			if((iDepth < 1) && (element instanceof TRoot))
				(element as TRoot).captureXMLStructure(elementOBJ, iDepth+1);

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
		let xClone:string = ""; 	// this.tutorDoc.gSceneConfig.scenedata[_cloneOf].create.symbol.(@wozname==_named).table[0];
		
		CUtil.trace(xClone);
		
		return xClone;			
	}
	
//************** SceneConfig Initialization 

//***************** Automation *******************************				


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
	public gotoAndStop(frame:string|number):void 
	{
		if(this.traceMode) CUtil.trace(this.name + " is stopped at : " + frame);		
		
		if(this.tutorDoc.tutorContainer) this.tutorDoc.tutorContainer.playRemoveThis(this);
		
		super.gotoAndStop(frame);
	}
	
	/**
	 * Overload the stop so that we can track what movies are playing and which aren't
	 * 
	 */
	public stop(): void	
	{
		if(this.traceMode) CUtil.trace(name + " is stopped");
		
		if(this.tutorDoc.tutorContainer) this.tutorDoc.tutorContainer.playRemoveThis(this);

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
		
		if(this.tutorDoc.tutorContainer) this.tutorDoc.tutorContainer.playAddThis(this);
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
		
		if(this.tutorDoc.tutorContainer) this.tutorDoc.tutorContainer.playAddThis(this);
		super.play();
	}
			
	/**
	 * wozPlay allows late binding to the Tutor object - use for scene object etc that are created after initAutomation call
	 * 
	 */
	public bindPlay(tutor:TTutorContainer ): void	
	{
		if(this.traceMode) CUtil.trace(name + " is playing");

		//@@
		if(name == "SgenericPrompt")
					CUtil.trace("SgenericPrompt Play Found in BindPlay");
		//@@
		
		if(this.tutorDoc.tutorContainer) this.tutorDoc.tutorContainer.playAddThis(this);
		super.play();
	}
	
	public setTopMost() : void 
	{			
		let topPosition:number;
		
		try
		{
			if(this.tutorDoc.tutorContainer) 
			{
				topPosition = this.tutorDoc.tutorContainer.numChildren - 1;
				this.tutorDoc.tutorContainer.setChildIndex(this, topPosition);				
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
		
		this.tutorDoc.fSessionTime = CUtil.getTimer();
	}

	public get sessionTime() :string
	{
		let curTime:Number;
		
		curTime = (CUtil.getTimer() - this.tutorDoc.fSessionTime) / 1000.0;
		
		return curTime.toString();
	}



//************ Session Timing


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