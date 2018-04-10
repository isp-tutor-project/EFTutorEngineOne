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

import { CEFRoot } 			from "./CEFRoot";
import { CEFTutorRoot } 	from "./CEFTutorRoot";
import { CEFObjectDyno } 	from "./CEFObjectDyno";
import { CEFAnimator }  	from "./CEFAnimator";
import { CEFNavigator } 	from "./CEFNavigator";
import { CEFScene }  		from "./CEFScene";

import { CEFEvent }     	from "../events/CEFEvent";

import { ILogManager }  	from "../network/ILogManager";

import { CUtil } 			from "../util/CUtil";

import Point     		  = createjs.Point;
import Shape     		  = createjs.Shape;
import Sprite     		  = createjs.Sprite;
import Tween    		  = createjs.Tween;
import ColorMatrixFilter  = createjs.ColorMatrixFilter;
import BlurFilter		  = createjs.BlurFilter;
import DisplayObject      = createjs.DisplayObject;
import Ease			      = createjs.Ease;


//@@ Bug - Note that tweens start automatically so the push onto the running array should be coupled with a stop 
//		   to allow us to control the onFinish proc.

export class CEFObject extends CEFAnimator
{		
	//************ Stage Symbols
	
	
	// Dynamic Scene Elements
	
	public SclickMask:Shape;
	
	//************ Stage Symbols

	
	public sAuto:string       = "UNKNOWN";						// Is the control in automation mode ?
	
	public objID:string;										// Automation ID - unique ID 

	public tweenID:number;
	public bTweenable:boolean;  								// Objects with the same name will tween together. This flag indicates if the object participates in tweening
	public bSubTweenable:boolean;  								// Certain objects have subobject that will require tweening - we only do this when we have to - keep tutorAutoObj object as small as possible
	public bPersist:boolean;									// Some objects persist throughout the life of the session

	//*************** Navigator static constants
	public static readonly CANCELNAV:string  = "CancelNav";
	public static readonly OKNAV:string		 = "OK";

	// basic object characteristics
	//
	private defRot:number;
	private defX:number;
	private defY:number;
	private defWidth:number;
	private defHeight:number;
	private defAlpha:number;
	
	private newSaturation:string;		
	private satFrames:number = 8;					// default to 8 frames to de/saturate
	private satIncrement:number = 1/this.satFrames;
	private curSat:number = 1.0;
	private newSat:number;
	
	private curBlur:number = 1.0;
	private newBlur:string;		
	private blurFrames:number = 8;					// default to 8 frames to de/saturate
	private blurIncrement:number = 1/this.blurFrames;
	private blurTarget:string;
	
	private curGlow:number = 1.0;
	private newGlow:string;
	private glowColor:number;
	private glowStage:string;
	private glowAlpha:number;
	private glowStrength:number;
	private glowFrames:number = 8;					// default to 8 frames to de/saturate
	private glowIncrement:number = 1/this.glowFrames;
	private glowTarget:string;
	
	// RGB to Luminance conversion constants
	
	private static readonly LUMA_R:number = 0.212671;
	private static readonly LUMA_G:number = 0.71516;
	private static readonly LUMA_B:number = 0.072169;

	private _tarObj:string;

	// Factory Object Initialization data for this object - maintains a pointer to the original data source for the object
	
	protected _XMLsrc:string;
	protected _XMLSnapShot:string;
	
	// general logging properties 
	
	protected _isvalid:string        = "false";
	protected _ischecked:string      = "false";
	
	// Object features
	
	protected _activeFeature:string  = "";						//## Added Mar 29 2013 - to support dynamic features
	protected _validFeature:string   = "";						//## Added Sep 28 2012 - to support dynamic features
	protected _invalidFeature:string = "";						//## Added Sep 28 2012 - to support dynamic features	
	
	private _features:string;									//## Mod Aug 13 2013 - to support object unique features (used in scenegraph currently) 

	private static _globals:any = new Object;					//## Added Sep 23 2013 - to support global variables
	
	protected _sceneData:any = new Object;						//## Added Dec 11 2013 - DB based state logging
	public    _phaseData:any = new Object;						//## Added Dec 12 2013 - DB based state logging
	
	// mask specific values		

	public _hasClickMask:boolean = false;
	public _maskColor:string;
	public _maskAlpha:string;		
	
	private _hidden:boolean = false;							// This is the only way to keep object !.visible during a transition 

	// navigator object - used to link objects to logging mechanism - _phaseData
	
	public navigator:CEFNavigator;								// Subsequence Navigator - optional
	

	protected onCreateScript:string = null;						// Support for XML based runtime scripting
	protected onExitScript:string   = null;						// Support for XML based runtime scripting
	
	
	
	// Global logging support - each scene instance and subscene animation instance represent 
	//                          object instances in the log.
	//                          The frameid is a '.' delimited string representing the:
	//
	//     framendx:graphnode.nodemodule.moduleelement... :animationnode.animationelement...iterationNdx
	//
	//			Semantics - each ':' represents the root of a new different (sub)graph	
	//  e.g.
	//
	//	  000001:root.start.SstartSplash...:root.Q0A.CSSbSRule1Part1AS...
	
	private static _framendx:number   = 0;
			
	
	constructor()
	{
		super();
		this.traceMode = false;
		
		if(this.traceMode) CUtil.trace("CEFObject:Constructor");
		
		this.tweenID       = 1;						// Instance ID - Identically named objects and ID's will copy deep-state from each other - considered same instance or just shallow state.			
		this.bTweenable    = true; 					// Objects with the same name will tween together. This flag indicates if the object participates in tweening
		this.bSubTweenable = false; 				// Certain objects have subobjects that require tweening - we only do this when we have to - keep tutorAutoObj object as small as possible
		this.bPersist      = false;					// Some objects persist throughout the life of the session
	}
	

	public onCreate() : void
	{
		// Parse the Tutor.config for create procedures for this scene 
		
		if((CEFRoot.gSceneConfig != null) && (CEFRoot.gSceneConfig.objectdata[name] != undefined))
						this.parseOBJ(this, CEFRoot.gSceneConfig.objectdata[name].children(), name);
		
		//## Mod May 04 2014 - support declarative button actions from scenedescr.xml <create>
		if(this.onCreateScript != null)
					this.doCreateAction();
	}					

	
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
	
	public incFrameNdx() : void
	{
		CEFObject._framendx++;
	}

	/**
	 * This is a mechanism to keep woz objects !.visible through a transition
	 *  
	 */
	public set hidden(hide:boolean)
	{
		this._hidden = hide;
		
		if(this._hidden)
		{			
			this.visible = false;
			this.alpha   = 0;
		}
	}
	
	public get hidden() : boolean
	{
		return this._hidden; 
	}
	
	public set features(newFTR:string)
	{
		this._features = newFTR; 
	}
	
	public get features() : string
	{
		return this._features; 
	}
	
	public setANDFeature(newFTR:string) : void
	{
		if(this._features.length != 0)
			this._features += ",";
		
		this._features += newFTR;
	}
	
	public setORFeature(newFTR:string) : void
	{
		if(this._features.length != 0)
			this._features += ":";
		
		this._features += newFTR;
	}
	
	public unSetFeature(ftr:string) : void
	{
		let feature:string;
		let featArray:Array<string> = new Array;
		let updatedFTRset:string = "";
		
		if(this._features.length > 0)
			featArray = this._features.split(":");
		
		// Add instance features 
		
		for (let feature of featArray)
		{
			if(feature != ftr)
			{
				if(updatedFTRset.length != 0)
							updatedFTRset += ":";
				
				updatedFTRset += ftr;
			}
		}	
		
		this._features = updatedFTRset;
	}
	
	
//*************** Dynamic object creation
	
	
	public buildObject(objectClass:string, objectName:string) : CEFObject
	{
		let newObject:CEFObject;
		let maskDim:Point;
		
		let ClassRef:any = CEFRoot.getDefinitionByName(objectClass);
		
		newObject = new ClassRef();						
		newObject.name = objectName;
		
		newObject.onCreate();		// perform object initialization
		
//			iniVisible = newObject.visible;
//			
//			newObject.visible = false;
		this.addChild(newObject);
		
		if(newObject._hasClickMask)
		{
			maskDim = newObject.globalToLocal(0, 0);
			
			newObject.SclickMask.x = maskDim.x;
			newObject.SclickMask.y = maskDim.y;
			
			newObject.SclickMask.graphics.setStrokeStyle(0);							// we don't need a border so leave default - NaN
			newObject.SclickMask.graphics.beginFill(newObject._maskColor); //, newObject._maskAlpha);
			
			newObject.SclickMask.graphics.drawRect( 0, 0, CEFObject.STAGEWIDTH, CEFObject.STAGEHEIGHT);			
			newObject.SclickMask.graphics.endFill();									
		}			
		
		return newObject;
	}

	
	/*
	* 
	*/
	public buildMask() : void
	{			
	}
	
	
	public get activeFeature() : string 
	{
		return "";
	}
	
	
	public set activeFeature(value:string) 
	{
		
	}
	

	
//*************** Effect management - from Audio Stream
		
	public clearAllEffects(fHide:boolean = true) : void
	{
		this.stopTransitions();
		
		removeEventListener(CEFEvent.ENTER_FRAME, this.saturationTimer);
		removeEventListener(CEFEvent.ENTER_FRAME, this.blurTimer);	
		removeEventListener(CEFEvent.ENTER_FRAME, this.flashTimer);
		
		this.filters = null;
		
		if(fHide)
			this.alpha   = 0;
	}		
	
	/**
	 * 
	 */	
	public moveChild(tarObj:string, moveX:string, moveY:string, duration:string = "0.5") : void
	{
		// push the tweens on to the run stack 
		//
		if(moveX != "")
			this.Running.push(new Tween((this as any)[tarObj]).to({x:moveX}, Number(duration), Ease.cubicInOut));
		if(moveY != "")
			this.Running.push(new Tween((this as any)[tarObj]).to({y:moveY}, Number(duration), Ease.cubicInOut));
	}

	
	/**
	 * 
	 */	
	public moveOriginChild(tarObj:string, regx:string, regy:string, duration:string = "0.5") : void
	{
		// push the tweens on to the run stack 
		//
		if(regx != "")
			this.Running.push(new Tween((this as any)[tarObj]).to({regX:regx}, Number(duration), Ease.cubicInOut));
		if(regy != "")
			this.Running.push(new Tween((this as any)[tarObj]).to({regY:regy}, Number(duration), Ease.cubicInOut));
	}

	
	/**
	 * 
	 */	
	public scaleChild(tarObj:string, scalex:string, scaley:string, duration:string = "0.5") : void
	{
		// push the tweens on to the run stack 
		//
		if(scalex != "")
			this.Running.push(new Tween((this as any)[tarObj]).to({scaleX:scalex}, Number(duration), Ease.cubicInOut));
		if(scaley != "")
			this.Running.push(new Tween((this as any)[tarObj]).to({scaleY:scaley}, Number(duration), Ease.cubicInOut));
	}
			
	/**
	 *@@ TODO: Check if this needs to be incorporated into the pause mechanism 
		*/	
	public saturateChild(tarObj:string, newState:string, duration:string = "0.08") : void
	{
		(this as any)[tarObj].saturateObj(newState, duration);
	}
	
	/**
	 *@@ TODO: Check if this needs to be incorporated into the pause mechanism 
		*/	
	public saturateChildTo(tarObj:string, newSat:number, duration:string = "0.08") : void
	{
		(this as any)[tarObj].saturateObjTo(newSat, duration);
	}
	
	/**
	 *@@ TODO: Check if this needs to be incorporated into the pause mechanism 
		*/	
	public saturateObj(newState:string, duration:string = "0.08") : void
	{
		this.newSaturation = newState;
		
		if(this.newSaturation == "mono")
		{
			this.curSat = 1.0;
			this.newSat = 0.0
		}
		else
		{
			this.curSat = 0.0;
			this.newSat = 1.0;
		}
			
		this.satIncrement  = 1.0/12;
		
		addEventListener(CEFEvent.ENTER_FRAME, this.saturationTimer);	
	}
	
	/**
	 *@@ TODO: Check if this needs to be incorporated into the pause mechanism 
		*/	
	public saturateObjTo(_newSat:number, duration:string = "0.08") : void
	{
		let dynRange:number;
		
		if(_newSat > this.curSat) 
		{
			this.newSaturation = "color";
		}
		else
		{
			this.newSaturation = "mono";
		}
		
		this.newSat   = _newSat;
		dynRange = Math.abs(_newSat - this.curSat);
		
		this.satIncrement  = dynRange/12;
		
		addEventListener(CEFEvent.ENTER_FRAME, this.saturationTimer);	
	}
	
	/**
	 * 
	 */	
	private saturationTimer(evt:Event) : void
	{
		// If transitioning to full saturation - incrementally increase the sat level
		
		if(this.newSaturation == "color")
		{
			this.curSat += this.satIncrement;
			
			if(this.curSat >= this.newSat) 
			{
				this.curSat = this.newSat;
				removeEventListener(CEFEvent.ENTER_FRAME, this.saturationTimer);				
			}
		}
		
		// If transitioning to monochrome - incrementally decrease the sat level
		
		else if(this.newSaturation == "mono")
		{
			this.curSat -= this.satIncrement;
			
			if(this.curSat <= this.newSat) 
			{
				this.curSat = this.newSat;
				removeEventListener(CEFEvent.ENTER_FRAME, this.saturationTimer);				
			}				
		}
		
		// Bad parameter
		
		else
		{
			this.curSat = 1.0;
			removeEventListener(CEFEvent.ENTER_FRAME, this.saturationTimer);		
		}
		
		this.filters = new Array(this.adjustSaturation(Number(this.curSat)));			
	}
	
	/**
	 * Function: adjustSaturation
	 * 
	 * Parameters:
	 * s - typical values come in the range 0.0 ... 2.0 where
	 * 0.0 means 0% Saturation
	 * 0.5 means 50% Saturation
	 * 1.0 is 100% Saturation (aka no change)
	 * 2.0 is 200% Saturation
	 *
	 * Other values outside of this range are possible
	 * -1.0 will invert the hue but keep the luminance
	 * 
	 */		
	public adjustSaturation( s:number = 1 ): ColorMatrixFilter
	{		
		let sInv:number;
		let irlum:number;
		let iglum:number;
		let iblum:number;
		
		sInv = (1 - s);
		irlum = (sInv * CEFObject.LUMA_R);
		iglum = (sInv * CEFObject.LUMA_G);
		iblum = (sInv * CEFObject.LUMA_B);
		
		return new ColorMatrixFilter([(irlum + s), iglum, iblum, 0, 0, 
			irlum, (iglum + s), iblum, 0, 0, 
			irlum, iglum, (iblum + s), 0, 0, 
			0, 0, 0, 1, 0]);			
	}		
	
	/**
	 *@@ TODO: Check if this needs to be incorporated into the pause mechanism 
		*/	
	public blurChild(tarObj:string, duration:string = "12") : void
	{
		(this as any)[tarObj].blurObj(duration);
	}
	
	/**
	 *@@ TODO: Check if this needs to be incorporated into the pause mechanism 
		*/	
	public blurObj(duration:string = "12") : void
	{
		this.blurIncrement  = 255.0/Number(duration);
		this.curBlur        = 0;
		
		addEventListener(CEFEvent.ENTER_FRAME, this.blurTimer);	
	}
	
	/**
	 * 
	 */	
	private blurTimer(evt:Event) : void
	{
		// If transitioning to full saturation - incrementally increase the sat level
		
		this.curBlur += this.blurIncrement;
		
		if(this.curBlur >= 255) 
		{
			removeEventListener(CEFEvent.ENTER_FRAME, this.blurTimer);	
			dispatchEvent(new Event("blur_complete"));
			
			this.filters = null;
			this.alpha   = 0;
		}
		else			
			this.filters = new Array(new BlurFilter(this.curBlur,this.curBlur));			
	}
	
	/**
	 *@@ TODO: Check if this needs to be incorporated into the pause mechanism 
		*/	
	public flashChild(tarObj:string, _glowColor:number, duration:string = "8") : void
	{
		(this as any)[tarObj].flashObj(_glowColor, duration);
	}
	
	/**
	 *@@ TODO: Check if this needs to be incorporated into the pause mechanism 
		*/	
	public flashObj(_glowColor:number, duration:string = "8") : void
	{
		this.glowStage      = "color";
		this.glowColor      = _glowColor;
		this.glowStrength   = 2.0;
		this.glowAlpha      = 1.0;
		this.glowIncrement  = 175.0/Number(duration);
		this.curGlow        = 0;			
		
		if(this.traceMode) CUtil.trace("start Object Flash");
		
		addEventListener(CEFEvent.ENTER_FRAME, this.flashTimer);	
	}
	
	/**
	 * 
	 */	
	private flashTimer(evt:Event) : void
	{
		
		if(this.glowStage == "color") 
		{
			this.curGlow      += this.glowIncrement;
			this.glowStrength += .1;
			
			if(this.curGlow >= 175)
			{
				this.glowStage    = "alpha";
			}
		}
		
		else if(this.glowStage == "alpha")  
		{
			if(this.glowAlpha <= 0.0)
			{
				if(this.traceMode) CUtil.trace("end Object Flash");
				
				removeEventListener(CEFEvent.ENTER_FRAME, this.flashTimer);
				dispatchEvent(new Event("glow_complete"));
		
				this.glowStage    = "done";
				this.filters = null;
			}
			
			this.glowAlpha -= .05;
		}
		
		// if(this.glowStage != "done")
		// 	this.filters = new Array(new GlowFilter(glowColor, glowAlpha, curGlow,curGlow, glowStrength));			
	}
	
	
	/**
	 * 
	 */	
	public showChild(tarObj:string, alphaTo:number = -1, autoStart:boolean = false) : void
	{
		// push the tweens on to the run stack 
		//
		(this as any)[tarObj].visible = true;
		
		if(alphaTo != -1)
			(this as any)[tarObj].alpha = alphaTo;
	}

	
	/**
	 * 
	 */	
	public hideChild(tarObj:string) : void
	{
		// push the tweens on to the run stack 
		//
		(this as any)[tarObj].visible = false;
	}
	
	
	/**
	 * 
	 */	
	public fadeChildOff(tarObj:string, autoStart:boolean = false, duration:string = "0.5" ) : void
	{
		
		this._tarObj = tarObj;
		
		this.Running.push(new Tween((this as any)[tarObj]).to({alpha:0}, Number(duration), Ease.cubicInOut));

		if(autoStart)
			this.startTransition(this.hideDone);							
	}

	/**
	 * Object specific finalization behaviors - invoked through  reference in xnFinished
	 */
	private hideDone() : void
	{			
		(this as any)[this._tarObj].visible = false;
	}						
	
	
	/**
	 * 
	 */	
	public fadeChild(tarObj:string, alphaTo:string, autoStart:boolean = false, duration:string = "0.5") : void
	{
		// push the tweens on to the run stack 
		//
		(this as any)[tarObj].visible = true;
					
		switch(alphaTo)
		{
			case "off":
			case "on":
				if(this.traceMode) CUtil.trace("Fading : ", tarObj, alphaTo);
				
				this.Running.push(new Tween((this as any)[tarObj]).to({alpha:(alphaTo == "on")? 1:0}, Number(duration), Ease.cubicInOut));

				if(autoStart == true)
					this.startTransition(this.twnDone);
				break;
			
			default:
				if(this.traceMode) CUtil.trace("fadeChild: Parameter error - should be 'on' or 'off' - is: ", alphaTo );
				break;
		}
	}

	
	/**
	 * 
	 */	
	public fadeChildTo(tarObj:string, alphaTo:number, autoStart:boolean = false, duration:string = "0.5") : void
	{
		// push the tweens on to the run stack 
		//
		(this as any)[tarObj].visible = true;
		
		if(this.traceMode) CUtil.trace("Fading To: ", tarObj, alphaTo);

		   this.Running.push(new Tween((this as any)[tarObj]).to({alpha:alphaTo}, Number(duration), Ease.cubicInOut));
		
		if(autoStart == true)
			this.startTransition(this.twnDone);										
	}

	
	/**
	 * Object specific finalization behaviors - invoked through  reference in xnFinished
	 */
	public twnDone( ) : void
	{	
	}				
		
	
	/**
	 * 
	 */	
	public startTween(xnF = this.twnDone) : void
	{
		if(this.Running.length > 0)
			this.startTransition((xnF == null)? this.twnDone:xnF);				
	}
	
	
//*************** Effect management - from Audio Stream
		
//*************** Deep state management

	public deepStateCopy(src:CEFObject) : void
	{
		this.rotation  		= src.rotation;
		this.x         		= src.x;
		this.y         		= src.y;
		this.scaleX     	= src.scaleX;
		this.scaleY    		= src.scaleY;
		this.alpha    		= src.alpha;		
		this.visible   		= src.visible;
		this.bPersist  		= src.bPersist;
		this.activeFeature 	= src.activeFeature;
	}	
	
	public shallowStateCopy(tar:DisplayObject, src:DisplayObject ) : void
	{			
		tar.rotation  = src.rotation;
		tar.x         = src.x;
		tar.y         = src.y;
		tar.scaleX     = src.scaleX;
		tar.scaleY    = src.scaleY;
		tar.alpha     = src.alpha;		
		tar.visible   = src.visible;
	}				

//*************** Deep state management
	
	
	// Walk the WOZ Objects to capture their default state
	//
	public captureDefState(tutObject:any ) : void 
	{
		this.defRot    = this.rotation;
		this.defX      = this.x;
		this.defY      = this.y;
		this.defWidth  = this.scaleX;
		this.defHeight = this.scaleY;
		this.defAlpha  = this.alpha;			
		
		for(let subObject in tutObject)
		{			
			if(subObject != "instance" && tutObject[subObject].instance instanceof CEFObject)
			{
				if(this.traceMode) CUtil.trace("capturing: " + tutObject[subObject].instance.name);
				
				tutObject[subObject].instance.captureDefState(tutObject[subObject] );										
			}					
		}		
	}
	
	
	// Walk the WOZ Objects to restore their default state
	//
	public restoreDefState(tutObject:any ) : void 
	{
		this.rotation = this.defRot; 
		this.scaleX    = this.defWidth;
		this.scaleY   = this.defHeight;
		this.x        = this.defX;
		this.y        = this.defY;
		this.alpha    = this.defAlpha;			
		
		for(let subObject in tutObject)
		{			
			if(subObject != "instance" && tutObject[subObject].instance instanceof CEFObject)
			{
				if(this.traceMode) CUtil.trace("restoring: " + tutObject[subObject].instance.name);
				
				tutObject[subObject].instance.restoreDefState(tutObject[subObject] );										
			}					
		}					
	}
	
			
	public isTweenable() : boolean
	{
		return this.bTweenable;
	}		
	
	
	public isSubTweenable() : boolean
	{
		return this.bSubTweenable;
	}		

//*************** Logging state management

	public captureLogState(obj:Object = null) : Object
	{
		if(obj == null) obj = new Object;
		
		return obj;
	}		
	
	public captureXMLState() : string
	{
		let nullXML:string = '<null/>';
		
		return nullXML;
	}		

	public restoreXMLState(xmlState:string) : void
	{
	}		
	
	public compareXMLState(xmlState:string) : boolean
	{
		return false;
	}		

	public createLogAttr(objprop:string, restart:boolean = false) : string
	{
		let sResult:string;
		
		if(!this.hasOwnProperty(objprop)) sResult = "undefined";
									 else sResult = (this as any)[objprop];		
		return sResult; 
	}
		
	
//*************** Logging state management


//***************** Automation *******************************
	
	/**
	 * Designed to be overridden by objects that require redraw in order for their size to be determined
	 * e.g. CEFRect 
	 * 
	 */
	public measure() : void
	{
	}
	
	
	public initAutomation(_parentScene:CEFScene, sceneObj:any, ObjIdRef:string, lLogger:ILogManager, lTutor:CEFTutorRoot) : void
	{								
		if(this.traceMode) CUtil.trace("CEFObject initAutomation:");						

		// parse all the component objects - NOTE: everything must be derived from CEFObject
		//
		let subObj:DisplayObject;
		let wozObj:CEFObject;
		
		this.objID = ObjIdRef+name;					// set the objects ID
					
		for(let i1:number = 0 ; i1 < this.numChildren ; i1++)
		{
			subObj = this.getChildAt(i1) as DisplayObject;
							
			// Record each Sub-Object - only maintain pointers
			//
			sceneObj[subObj.name] = new Object;
			sceneObj[subObj.name].instance = subObj;										

			// Have Object determine its inplace size
			//
			if(subObj instanceof CEFObject || subObj instanceof CEFObjectDyno)
			{					
				//## Mod Apr 14 2014 - maintain linkage to parent scene - used for D.eval execution context - e.g. button script execution
				(subObj as CEFRoot).parentScene = _parentScene;
				
				if(subObj instanceof CEFObject)
					(subObj as CEFObject).measure();
			}
			
			// Record object in-place position - This is only done for top level objects in scene to record their inplace positions 
			// for inter-scene tweening.
			//
			sceneObj[subObj.name]['inPlace'] = {X:subObj.x, Y:subObj.y, Width:subObj.scaleX, Height:subObj.scaleY, Alpha:subObj.alpha};								

			if(this.traceMode) CUtil.trace("\t\tCEFObject found subObject named:" + subObj.name );
			
			// Recurse WOZ Children
			//
			if(subObj instanceof CEFObject)
			{
				wozObj = subObj as CEFObject;					// Coerce the Object					
				wozObj.initAutomation(_parentScene, sceneObj[subObj.name], this.objID + ".", lLogger, lTutor);
			}								
			// Recurse WOZ Children
			//
			if(subObj instanceof CEFObjectDyno)
			{
				let wozDynoObj:CEFObjectDyno = subObj as CEFObjectDyno;				// Coerce the Object					
				wozDynoObj.initAutomation(_parentScene, sceneObj[subObj.name], this.objID + ".", lLogger, lTutor);
			}								
		}		 
	}
	

	// Walk the WOZ Objects to initialize their automation mode
	// to do any special initialization - but call super to propogate
	//
	public setAutomationMode(sceneObj:any, sMode:string) : void 
	{
		// Initialize the mode variable
		//
		this.sAuto = sMode;
		
		// Propogate to any children
		//
		for(let subObj in sceneObj)
		{
			if(subObj != "instance" && sceneObj[subObj].instance instanceof CEFObject)
			{
				sceneObj[subObj].instance.setAutomationMode(sceneObj[subObj], sMode );										
			}					
		}		
	}
	
		
//***************** Automation *******************************		


//***************** Debug *******************************		
		
	public dumpSubObjs(sceneObj:any, Indent:string) : void
	{				
		for(let subObj in sceneObj)
		{
			if(this.traceMode) CUtil.trace(Indent + "\tsubObj : " + subObj);

			if(subObj != "instance")
			{
				let ObjData:any = sceneObj[subObj]; // Convenience Pointer
				
				if(sceneObj[subObj].instance instanceof CEFObject)
				{
					if(this.traceMode) CUtil.trace(Indent + "\t");						
					
					let wozObj:CEFObject = sceneObj[subObj].instance;
				
					if(ObjData['inPlace'] != undefined)
					{
						if(this.traceMode) CUtil.trace(Indent + "\tCEF* Object: " + " x: " + wozObj.x + " y: " + wozObj.y + " width: " + wozObj.scaleX + " height: " + wozObj.scaleY + " alpha: " + wozObj.alpha + " visible: " + wozObj.visible + " name: " + wozObj.name );													
						if(this.traceMode) CUtil.trace(Indent + "\tIn-Place Pos: " + " X: " + ObjData['inPlace'].X + " Y: " + ObjData['inPlace'].Y + " Width: " + ObjData['inPlace'].scaleX + " Height: " + ObjData['inPlace'].scaleY + " Alpha: " + ObjData['inPlace'].Alpha );
					}
					sceneObj[subObj].instance.dumpSubObjs(sceneObj[subObj], Indent + "\t");												
				}
				else 
				{
					let disObj:DisplayObject = sceneObj[subObj].instance;
				
					if(ObjData['inPlace'] != undefined)
					{
						if(this.traceMode) CUtil.trace(Indent + "\tFlash Object: " + " x: " + disObj.x + " y: " + disObj.y + " width: " + disObj.scaleX + " height: " + disObj.scaleY + " alpha: " + disObj.alpha + " visible: " + disObj.visible + " name: " + disObj.name );						
						if(this.traceMode) CUtil.trace(Indent + "\tIn-Place Pos: " + " X: " + ObjData['inPlace'].X + " Y: " + ObjData['inPlace'].Y + " Width: " + ObjData['inPlace'].scaleX + " Height: " + ObjData['inPlace'].scaleY + " Alpha: " + ObjData['inPlace'].Alpha );
					}
				}
				
			}
			else
			{					
				if(this.traceMode) CUtil.trace(Indent + "Parent Object : " + sceneObj + " visible: " + sceneObj[subObj].visible );
			}						
		}		
	}

	public set isChecked(sval:string) 
	{
		this._ischecked = sval;			
	}
	
	public get isChecked() : string
	{
		return this._ischecked;
	}
	
	public set checked(bval:boolean)
	{
		this._ischecked = (bval)? "true":"false";			
	}
	
	public get checked() : boolean
	{			
		return (this._ischecked == "true")? true:false;						
	}
	
	
	public set isValid(sval:string)
	{
		this._isvalid = sval;
	}
	
	public get isValid(): string 
	{
		return this._isvalid;
	}

	
	
	public assertFeatures() : string			//## Added Sep 28 2012 - to support dynamic features
	{	
		return "";
	}
	
	public retractFeatures() : void			//## Added Sep 28 2012 - to support dynamic features
	{	
	}
	
	public get tallyValid(): string 
	{
		return "0";
	}

	
	public assertFeature(_feature:string) : void			//## Added Feb 27 2013 - to support dynamic features
	{	
		if(_feature != "")
			CEFRoot.gTutor.addFeature = _feature;
	}
	
	public retractFeature(_feature:string) : void			//## Added Feb 27 2013 - to support dynamic features
	{	
		if(_feature != "")
			CEFRoot.gTutor.delFeature = _feature;
	}


//****************** START Globals		
	
	public static initGlobals() : void
	{
		CEFObject._globals = new Object;
	}
	
	
	public incrGlobal(_id:string, _max:number = -1, _cycle:number = 0) : number			//## Added Feb 10 2014 - global counter support
	{	
		let result:any;
		
		if(CEFObject._globals.hasOwnProperty(_id))
		{		
			CEFObject._globals[_id]++;
			
			result = CEFObject._globals[_id];
			
			// Roll over at max value > -1 will never roll
			
			if(CEFObject._globals[_id] == _max)
					CEFObject._globals[_id] = _cycle;
		}
		else
			result = CEFObject._globals[_id] = 1;
		
		return result; 
	}
	
	public assertGlobal(_id:string, _value:any) : void				//## Added Sep 23 2013 - to support global variables
	{	
		CEFObject._globals[_id] = _value;
	}
	
	public retractGlobal(_id:string) : void						//## Added Sep 23 2013 - to support global variables
	{	
		CEFObject._globals[_id] = "";
	}
	
	public queryGlobal(_id:string) : any							//## Added Sep 23 2013 - to support global variables
	{	
		let result:any;
		
		if(CEFObject._globals.hasOwnProperty(_id))
		{		
			result = CEFObject._globals[_id];
		}
		else result = "null";
		
		return result; 
	}		

	public set globals(gval:Object) 
	{
		CEFObject._globals = gval;			
	}
	
	public get globals() : Object
	{			
		return CEFObject._globals;						
	}
	
	
//****************** END Globals		
	
	
	public set valid(bval:boolean) 
	{
		this._isvalid = (bval)? "true":"false";			
	}
	
	public get valid() : boolean
	{			
		return (this._isvalid == "true")? true:false;						
	}
	
//***************** Debug *******************************		


//***********  Live behaviors
//***********  WOZ event stream - WOZ controls only listen for these events
	
	
	public wozMouseClick(evt:CEFEvent)
	{
		this.dispatchEvent(evt);
	}
	
	public wozMouseMove(evt:CEFEvent)
	{
		this.dispatchEvent(evt);
	}
	
	public wozMouseDown(evt:CEFEvent)
	{
		this.dispatchEvent(evt);
	}
	
	public wozMouseUp(evt:CEFEvent)
	{
		this.dispatchEvent(evt);
	}

	public wozMouseOver(evt:CEFEvent)
	{
		this.dispatchEvent(evt);
	}
	
	public wozMouseOut(evt:CEFEvent)
	{
		this.dispatchEvent(evt);
	}

	wozKeyDown(evt:CEFEvent):void
	{
		this.dispatchEvent(evt);
	}
	
	wozKeyUp(evt:CEFEvent):void
	{
		this.dispatchEvent(evt);
	}		

//*************** overridable functions - polymorphic behaviors

	
//*************** Creation / Initialization
				
		/**
		 * 
		 * @param	baseObj
		 * @param	objArray
		 * @return
		 */
		protected decodeTarget(baseObj:DisplayObject, objArray:Array<any> ) : DisplayObject
		{
			var tmpObject:DisplayObject = baseObj;
			var subObject:string;
			
			subObject = objArray.shift();
			
			if(this.traceMode) CUtil.trace("decoding: " + subObject );
			
			if(subObject != "this")
			{
				tmpObject = (baseObj as any)[subObject];
				
				if(objArray.length)
					tmpObject = this.decodeTarget(tmpObject, objArray);
			}
			
			return tmpObject;	
		}
		
		
		/**
		 * 
		 * @param	tarObj
		 * @param	tarXML
		 */
		private parseOBJLog(tarObj:DisplayObject, element:any) : void
		{		
			var objArray:Array<any>;
			var dataStr:string;
			var attrName:string;
			
			if(this.traceMode) CUtil.trace("Processing: " + element.localName() + " - named: " + element.named);
			
			objArray = element.objname.split(".");
			
			if(this.traceMode) CUtil.trace("Target Array: " + objArray[0]);
			
			if(objArray.length)
				tarObj = this.decodeTarget(tarObj, objArray);

			//@@ Mod Jun 03 2013 - Support for method based logging
			//
			// If there is a single property process it
			
			if (element.objprop != undefined)
			{
				// process the logging instruction
				
				//@@ Mod Mar 13 2012 - removed phase and use @logid as direct child of state - avoids conflict with deprecated logging
				//                     method used in tutor
				
				dataStr = (tarObj as CEFObject).createLogAttr(element.objprop);				
			}
				
			//@@ Mod Jun 03 2013 - Support for method based logging
			//
			// If there is a single command process it 
				
			else if (element.objmethod != undefined)
			{
				dataStr = (tarObj as CEFObject).runXMLFunction(tarObj, element);
			}

			// NOTE: Phase State Attribute names: 
			// currently simplified frameid + scenename + logattr + iteration
			// TODO: support graph style encoding see framendx definition above for details

			// Construct the unique log attribute name - 			
			attrName = this.constructLogName(element.logattr);
			
			this.navigator._phaseData[attrName] = new Object;			
			
			// update the phase specific log data - save in log progress packet - uses compound attribute name			
			this.navigator._phaseData[attrName]['value'] = dataStr;
			
			this.navigator._phaseData[attrName]["start"] = CEFRoot.gTutor.timeStamp.getStartTime("dur_"+name);
			
			this.navigator._phaseData[attrName]["duration"] = CEFRoot.gTutor.timeStamp.createLogAttr("dur_"+name);
			
			// Simple Scene state record - some values set in CEFSceneSequence.onExitScene 
			
			this._sceneData[element.logattr] = dataStr;
			
			// NOTE: if you don't use toString it will emit an XMLList object for some unknown reason.
			
			this._sceneData['phasename'] = element.logid.toString();
						
			try
			{
				this._sceneData['Rule0'] = CEFRoot.gTutor.ktSkills['rule0'].queryBelief();			
				this._sceneData['Rule1'] = CEFRoot.gTutor.ktSkills['rule1'].queryBelief();			
				this._sceneData['Rule2'] = CEFRoot.gTutor.ktSkills['rule2'].queryBelief();
			}
			catch(err)
			{
				CUtil.trace("Error - CVS Skills not defined:" + err);
			}
	
			
// Use this if you want to keep kt history data centralized in the user account
//			
//			try
//			{
//				if(navigator._phaseData.skills == null)
//					navigator._phaseData.skills = new Object;
//				
//				attrName = constructLogName("Rule0");
//				navigator._phaseData.skills[attrName] = gTutor.ktSkills["rule0"].queryBelief();			
//				
//				attrName = constructLogName("Rule1");
//				navigator._phaseData.skills[attrName] = gTutor.ktSkills["rule1"].queryBelief();						
//				
//				attrName = constructLogName("Rule2");
//				navigator._phaseData.skills[attrName] = gTutor.ktSkills["rule2"].queryBelief();			
//			}
//			catch(err:Error)
//			{
//				trace("Error - CVS Rules not defined: 2" + err);
//			}
			
			
			return;			
		}
		
		
		/**
		 * 
		 */
		private constructLogName(attr:string) :string
		{
			var attrName:string = "L00000";
			var frame:string;
			
			frame = CEFObject._framendx.toString();
			
			// Note: name here is the scene name itself which is the context in which we are executing
			
			//attrName = attrName.slice(0, 6-frame.length) + frame + "_" + name +"_" + attr + "_" + gTutor.gNavigator.iteration.toString(); 
			
			attrName = name +"_" + attr + "_" + CEFRoot.gTutor.gNavigator.iteration.toString();
			
			return attrName;
		}
		
		
		/**
		 * 
		 * @param	tarObj
		 * @param	tarXML
		 */
		private setXMLProperty(tarObj:DisplayObject, tarXML:any) : void
		{		
			if(this.traceMode) CUtil.trace("Processing: " + tarXML.localName() + " - named: " + tarXML.named + "- value: " + tarXML.value);
			
			if(tarObj.hasOwnProperty(tarXML.prop))
			{
				// This sequence of conversions is critical for correct type assignments (automatic conversions - see built in types e.g Boolean)
				
				var parmDef:Array<string> = tarXML.value.split(":");						
				
				if(parmDef[1] != "null")
				{
					//## Mod Feb 16 2012 - added support for array of comma delimited string initializers
					
					if(parmDef[1] == "Array")
					{
						(tarObj as any)[tarXML.prop] =  parmDef[0].split(",");						
					}
					else
					{
						var tClass:any = CEFRoot.getDefinitionByName(parmDef[1]) as any;
						
						var value:string = parmDef[0];
						
						(tarObj as any)[tarXML.prop] =  new tClass(value);
					}
				}
				else
					(tarObj as any)[tarXML.prop] =  null;
			}
		}
		
		
		/**
		 * 
		 * @@ Mod Jun 03 2013 - Support return values. For logging
		 * 
		 * @param	tarObj
		 * @param	tarXML
		 */
		private runXMLFunction(tarObj:DisplayObject, tarXML:any) : any
		{
			var i1:number = 1;
			var tClass:any;
			var value:string;
			var objArray:Array<any>;
			var parmDef:Array<string>;
			var parms:Array<any> = new Array;
			
			// unmarshal the typed parameter array from the XML representation
			
			while (tarXML["parm" + i1] != undefined)
			{
				parmDef = tarXML["parm" + i1].split(":");			
				
				// A displayobject on stage
				
				if(parmDef[1] == "symbol")
				{
					objArray = parmDef[0].split(".");
					
					if(objArray.length)
						parms.push(this.decodeTarget(tarObj, objArray));					
				}
					
					// a Builtin class
					
				else if(parmDef[1] != "null")
				{
					tClass = CEFRoot.getDefinitionByName(parmDef[1]) as any;
					
					value = parmDef[0];
					
					parms.push(new tClass(value));
				}
					
					// otherwise push a null
				else
					parms.push(null);
				
				i1++;
			}	
			
			// Apply the command - this expands the parameter array
			if(tarXML.cmnd != undefined)			
				return (tarObj as any)[tarXML.cmnd].apply(tarObj, (parms));
			
			if(tarXML.objmethod != undefined)			
				return (tarObj as any)[tarXML.objmethod].apply(tarObj, (parms));
		}
		
		
		/**
		 * 
		 * @param	tarObj
		 * @param	tarXML
		 */
		public parseOBJ(tarObj:DisplayObject, tarXML:any, xType:string) : void
		{
			var tarObject:DisplayObject;
			var childList:any;
			var objArray:Array<any>;
			var element:any;
			
			if(this.traceMode) CUtil.trace("Parsing:" + tarXML[0].localName() + " - named: " + tarXML[0].named + " - Count: " + tarXML.length());
			
			for (element of tarXML)				
			{
				// reset tarObject - it may change on each iteration
				
				tarObject = tarObj;				
				
				// If initializer is featured - execute matching features
				
				if(element.features != undefined)
				{
					// Each element of the fFeature vector contains an id for a feature of the tutor.
					// This permits the tutor to have multiple independently managed features.
					// All identifiers of all the feature sets must be globally unique.
					
					if(!CEFRoot.gTutor.testFeatureSet(String(element.features)))
						continue;
				}
				
				try
				{				
					switch(element.localName())
					{					
						case "common":
							this.parseOBJ(tarObj, CEFObject.gSceneConfig.scenedata[element.text()][xType].children(), xType);
							break;
															
						case "log":
							this.parseOBJLog(tarObject, element);
							break;
						
						case "obj":
							
							if(this.traceMode) CUtil.trace("Processing: " + element.localName() + " - named: " + element.named);

							try
							{							
								objArray = element.named.split(".");
								
								if(this.traceMode) CUtil.trace("Target Array: " + objArray[0]);
								
								if(objArray.length)
									tarObject = this.decodeTarget(tarObject, objArray);
							
								// process any children if they exist
								
								childList = element.children();
								
								if(childList.length > 0)	
								this.parseOBJ(tarObject, childList, "obj" );
								
								// If there is a single property process it now
								
								if (element.prop != undefined)
								{
									this.setXMLProperty(tarObject, element);						
								}
									
									// If there is a single command process it now
									
								else if (element.cmnd != undefined)
								{
									this.runXMLFunction(tarObject, element);						
								}
							}
							catch(err)
							{
								if(this.traceMode) CUtil.trace("Invalid 'obj' target");
							}
							
							break;
						
						case "props":
							
							if(this.traceMode) CUtil.trace("Processing: " + element.localName() + " - named: " + element.named + "- value: " + element.value);
							
							this.setXMLProperty(tarObject, element);						
							
							break;
						
						case "cmnds":
							
							if(this.traceMode) CUtil.trace("Processing: " + element.localName() + " - named: " + element.named + "- value: " + element.value);
							
							this.runXMLFunction(tarObject, element);					
							
							break;
						
						case "symbol":
							
							//@@ mod Jan 22 2013 - enhanced to support nested children

							try
							{
								objArray = element.named.split(".");
								
								if(this.traceMode) CUtil.trace("Target Array: " + objArray[0]);
								
								if(objArray.length)
									tarObject = this.decodeTarget(tarObject, objArray);								
							}
							catch(err)
							{
								CUtil.trace("ParseXML Symbol named: " + element.named + " not found.");
								tarObject = null;
							}
							
							if(tarObject != null)
							{
								(tarObject as CEFObject).loadXML(element);
							}
							
							break;
						
						case "object":
							
							if(this.hasOwnProperty(element.named) && ((this as any)[element.named] != null))
							(this as any)[element.named].parseXML((this as any)[element.named], CEFObject.gSceneConfig.objectdata[element.named].children(), "object");
							
							break;
						
						case "initself":
							
							this.loadXML(element);
							
							break;											
					}
				}
				catch(err)							
				{
					CUtil.trace("CEFObject:parseXML: " + err);
				}					
			}
		}
		
		
		/*
		* 
		*/
		public loadOBJ(xmlSrc:any) : void
		{
			// Keep a pointer to the object spec
			
			this._XMLsrc = xmlSrc;
			
			if(xmlSrc.wozname != undefined)						
				this.wozName = xmlSrc.wozname;			
			
			if(xmlSrc.x != undefined)						
			this.x = Number(xmlSrc.x);
			
			if(xmlSrc.y != undefined)						
			this.y = Number(xmlSrc.y);

			if(xmlSrc.visible != undefined)
			{
				this.visible = (xmlSrc.visible == "true")? true:false;
			}
			
			if(xmlSrc.alpha != undefined)						
			this.alpha = Number(xmlSrc.alpha);
			
			if(xmlSrc.mask != undefined)
			{
				this._hasClickMask = true;
				
				// this.SclickMask = new Sprite;
				
				this.addChildAt(this.SclickMask,0);
				
				// this._maskColor = Number(xmlSrc.mask.color);
				// this._maskAlpha = Number(xmlSrc.mask.alpha);
			}
			
			if(xmlSrc.oncreate != undefined)		
			{
				try
				{
					// Note: it is imperitive that we precompile the script -
					//       Doing it on each invokation causes failures
					// onCreateScript = D.parseProgram(xmlSrc.oncreate);
				}
				catch(err)
				{
					CUtil.trace("Error: onCreateScript Invalid: " + xmlSrc.oncreate);
				}
			}
			
			if(xmlSrc.onexit != undefined)		
			{
				try
				{
					// Note: it is imperitive that we precompile the script -
					//       Doing it on each invokation causes failures
					// onExitScript = D.parseProgram(xmlSrc.onexit);
				}
				catch(err)
				{
					CUtil.trace("Error: onExitScript Invalid: " + xmlSrc.onExitScript);
				}
			}			
			
			
			super.loadXML(xmlSrc);				
		}
}