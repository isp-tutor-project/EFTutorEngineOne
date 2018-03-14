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
//  File:      CEFCursorProxy.cpp
//                                                                        
//  Purpose:   CEFCursorProxy implementation
//                                                                        
//  Author(s): Kevin Willows                                                           
//  
// History: File Creation Apr 14 2008  
//                                                                        
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHERf
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//
//*********************************************************************************

import { CEFRoot }       	from "./CEFRoot";
import { CEFObject }     	from "./CEFObject";

import { CUtil } 			from "../util/CUtil";


import MovieClip     	  = createjs.MovieClip;
import Point     		  = createjs.Point;
import Tween     		  = createjs.Tween;
import { CEFMouseEvent } from "../events/CEFMouseEvent";



// Cursor replacement

export class CEFCursorProxy extends CEFRoot
{
	//************ Stage Symbols
	
	public Sstandard:MovieClip;
	public Ssmallhand:MovieClip;
	public Shand:MovieClip;
	public Sautomate:MovieClip;
	public Ssparkle:MovieClip;
	
	//************ Stage Symbols
	
	curObject:CEFObject = null;
	actObject:CEFObject = null;
	cLocation:Point = new Point;
	sAuto:string;
	tween:Tween;
	lastFrameTime:number;

	fSparkler:boolean    = true;
	fSparklerTest:boolean = false;
	fSparklerDrag:boolean = false;
	
	//** Bandwidth conservation 
	
	public fLiveLog:boolean = false;
	
	static readonly WOZLIVE:string		= "WOZLIVE";
	static readonly WOZREPLAY:string	= "WOZREPLAY";		
	
	constructor() : void
	{
		super();

		this.traceMode = false;
		
		if(this.traceMode) CUtil.trace("CEFCursorProxy:Constructor");
			
		this.name = "WOZvCursor";	
		
		this.setCursorStyle("Sstandard");
	}
	
	// 
	//
	public setCursorStyle(style:string ) : void 
	{											
		this.Sstandard.visible  = false;
		this.Ssmallhand.visible = false;
		this.Shand.visible      = false;
		this.Sautomate.visible  = false;
			
		this[style].visible = true;
	}					
			
//***************** Automation *******************************		

	public initWOZCursor(sMode:string) : void
	{			
		if(this.traceMode) CUtil.trace("Initializing WOZ Cursor Automation:");
	
		// This is done out of the normal context for sAuto (see initAutomationMode)
		// Mouse is special
		//
		this.sAuto = sMode;
	
		// Input is being driven by user input
		//
		if(sMode == WOZLIVE)
		{
			this.stage.addEventListener(CEFMouseEvent.MOUSE_MOVE  , liveMouseMove);
			this.stage.addEventListener(MouseEvent.MOUSE_DOWN  , liveMouseDown);
			this.stage.addEventListener(MouseEvent.MOUSE_UP    , liveMouseUp);		
			this.stage.addEventListener(MouseEvent.DOUBLE_CLICK, liveMouseDblClick);		
		}
		// Input is being driven by log input
		//
		else if(sMode == WOZREPLAY)
		{
			this.stage.removeEventListener(MouseEvent.MOUSE_MOVE  , liveMouseMove);
			this.stage.removeEventListener(MouseEvent.MOUSE_DOWN  , liveMouseDown);
			this.stage.removeEventListener(MouseEvent.MOUSE_UP    , liveMouseUp);						
			this.stage.removeEventListener(MouseEvent.DOUBLE_CLICK, liveMouseDblClick);		
		}			
					
		// Show the woz cursor 
		//
		//show(true);
	}
	
	
	public decodeTarget(baseObj:CEFRoot, objArray:Array ) : CEFObject
	{
		let tmpObject:CEFObject = null;
		let subObject:string;
		
		subObject = objArray.shift();
		
		if(this.traceMode) CUtil.trace("decoding: " + subObject );
		
//			if((subObject == "Cell10"))
//							trace("test point");
		
		if((subObject != "null") && (subObject != "none"))
		{
			tmpObject = baseObj[subObject];
		
			if(objArray.length)
			tmpObject = this.decodeTarget(tmpObject, objArray);
		}
		
		return tmpObject;	
	}

	
//********************** Playback 


	public initPlayBack() : void
	{
		this.lastFrameTime = 0;
	}
	
	public playBackAction(wozEvt:XML ) : void
	{
		let traceAction:boolean = false;
		
		let tarObject:CEFObject;
		let objArray:Array;
					
		if (traceAction) trace("PlayBack Action: " + wozEvt);
		
		if(wozEvt.CEFMouseEvent != undefined)
		{
			x = wozEvt.CEFMouseEvent.@localX;
			y = wozEvt.CEFMouseEvent.@localY;
			
			//*** Click indicator *************
			//
			if(fSparklerTest)
			{
				fSparklerTest = false;
				if(wozEvt.CEFMouseEvent.CEFEvent.@type.toString() == CEFMouseEvent.WOZMOVE) fSparklerDrag = true;
			}

			if((wozEvt.CEFMouseEvent.CEFEvent.@type.toString() == CEFMouseEvent.WOZDOWN) && fSparkler)
			{
				fSparklerDrag = false;
				fSparklerTest = true;
				Ssparkle.gotoAndPlay(2);			
			}
						
			if((wozEvt.CEFMouseEvent.CEFEvent.@type.toString() == CEFMouseEvent.WOZUP) && fSparklerDrag)
																							Ssparkle.gotoAndPlay(10);			
			//
			//*** Click indicator *************
	
	
			if(traceAction) trace("Splitting: " + wozEvt.CEFMouseEvent.CEFEvent.@target + " EVT TYPE: " +  wozEvt.CEFMouseEvent.CEFEvent.@type);
			
			objArray = wozEvt.CEFMouseEvent.CEFEvent.@target.split(".");
						
			if(traceAction) trace("Target Array: " + objArray[0]);
						
			tarObject = decodeTarget(gTutor, objArray);

			if(tarObject)
			{
				if(traceAction) trace("Automation Target: " + tarObject + " Event: " + wozEvt.CEFMouseEvent.CEFEvent.@type);
							
				let evt:CEFMouseEvent = new CEFMouseEvent(tarObject.objID, wozEvt.CEFMouseEvent.CEFEvent.@type, true, false, wozEvt.CEFMouseEvent.@localX, wozEvt.CEFMouseEvent.@localY);						
				
				tarObject.dispatchEvent(evt);										
			}
			
		}
		
		
		else if(wozEvt.CEFTextEvent != undefined)
		{	
			if(traceAction) trace("Splitting: " + wozEvt.CEFTextEvent.CEFEvent.@target + " EVT TYPE: " +  wozEvt.CEFTextEvent.CEFEvent.@type);
			
			if(wozEvt.CEFTextEvent.CEFEvent.@type == CEFTextEvent.WOZINPUTTEXT)
			{
				objArray = wozEvt.CEFTextEvent.CEFEvent.@target.split(".");
							
				if(traceAction) trace("Target Array: " + objArray[0]);
							
				tarObject = decodeTarget(gTutor, objArray);

				if(tarObject)
				{
					if(traceAction) trace("Automation Target: " + tarObject + " Event: " + wozEvt.CEFTextEvent.CEFEvent.@type);
								
					let tEvt:CEFTextEvent = new CEFTextEvent(tarObject.objID, wozEvt.CEFTextEvent.CEFEvent.@type, wozEvt.CEFTextEvent.@index1, wozEvt.CEFTextEvent.@index2, wozEvt.CEFTextEvent.@text, true, false );						
					
					tarObject.dispatchEvent(tEvt);										
				}
			}
		}
		
	}
		
		
	public playBackMove(nextMove:XML, frameTime:number ) : void
	{			
		let relTime:number = (frameTime - lastFrameTime) / (nextMove.@time - lastFrameTime);

		if (this.traceMode) trace("PlayBack Move");
		
		x += relTime * (nextMove.CEFMouseEvent.@localX - x);
		y += relTime * (nextMove.CEFMouseEvent.@localY - y);
		
		// update the frametime last used 
		//
		lastFrameTime = frameTime;
		
		if(this.traceMode) trace("-- Target X: " + nextMove.CEFMouseEvent.@localX + " -- Target Y: " + nextMove.CEFMouseEvent.@localY);
		if(this.traceMode) trace("-- Mouse  X: " + x + " -- Mouse  Y: " + y);
	}
		
		
//********************** Playback 


	public replayEvent(xEvt:XMLList ) : void
	{
		let tarObject:CEFObject;
		let objArray:Array;
		
		x = xEvt.@localX;
		y = xEvt.@localY;
		
		//*** Click indicator *************
		//
		if(fSparklerTest)
		{
			fSparklerTest = false;
			if(xEvt.CEFEvent.@type.toString() == CEFMouseEvent.WOZMOVE) fSparklerDrag = true;
		}

		if((xEvt.CEFEvent.@type.toString() == CEFMouseEvent.WOZDOWN) && fSparkler)
		{
			fSparklerDrag = false;
			fSparklerTest = true;
			Ssparkle.gotoAndPlay(2);			
		}
					
		if((xEvt.CEFEvent.@type.toString() == CEFMouseEvent.WOZUP) && fSparklerDrag)
																	Ssparkle.gotoAndPlay(10);			
		//
		//*** Click indicator *************
																	
																	
		if(this.traceMode) trace("Splitting: " + xEvt.CEFEvent.@target + " EVT TYPE: " +  xEvt.CEFEvent.@type);
		
		objArray = xEvt.CEFEvent.@target.split(".");
					
		if(this.traceMode) trace("Target Array: " + objArray[0]);
					
		tarObject = decodeTarget(gTutor, objArray);

		if(tarObject)
		{
			if(this.traceMode) trace("Automation Target: " + tarObject + " Event: " + xEvt.CEFEvent.@type);
						
//			if((tarObject.name == "Cell10"))// && (xEvt.CEFEvent.@type == CEFMouseEvent.WOZDOWN))
//							trace("test point");
						
			let evt:CEFMouseEvent = new CEFMouseEvent(tarObject.objID, xEvt.CEFEvent.@type, true, false, xEvt.@localX, xEvt.@localY);						
			
			tarObject.dispatchEvent(evt);										
		}
	}
	
	
	public replayEventB(xEvt:XMLList ) : void
	{
		let tarObject:CEFObject;
		
		x = xEvt.@localX;
		y = xEvt.@localY;
		
		tarObject = hitTestCoord(x, y );

		if(tarObject)
		{
			switch(xEvt.CEFEvent.@type.toString())
			{
				case CEFMouseEvent.WOZMOVE:				// Ignore Event
							return;			
							break;
							
				case CEFMouseEvent.WOZOUT:					// Use "Current" Object
							tarObject = curObject;			
							break;
							
				case CEFMouseEvent.WOZOVER:				// Set Current Object
							curObject = tarObject;			
							break;
							
				case CEFMouseEvent.WOZUP:					// Direct "Up" to previous "Down" target
							tarObject = actObject;	
							break;
							
				case CEFMouseEvent.WOZDOWN:				// remember Down target object
							actObject = curObject;
							tarObject = curObject;
							break;
							
				case CEFMouseEvent.WOZCLICKED:				// Direct "Click" to previous "Down" target
							tarObject = actObject;	
							break;								
							
				case CEFMouseEvent.WOZDBLCLICK:			// Direct "Double Click" to previous "Down" target
							tarObject = actObject;	
							break;								
			}

			if(this.traceMode) trace("Automation Target: " + tarObject + " Event: " + xEvt.CEFEvent.@type);
						
			let evt:CEFMouseEvent = new CEFMouseEvent(tarObject.objID, xEvt.CEFEvent.@type, true, false, xEvt.@localX, xEvt.@localY);						
			
			tarObject.dispatchEvent(evt);										
		}
	}
	
	
	public replayEventAndMove(xEvt:XMLList, laEvt:XMLList, l2Evt:XMLList ) : Array
	{
		let tweens:Array;
		let easingX:Function;
		let easingY:Function;
		let v1:number;
		let v2:number;
		let dX:number;
		let dY:number;
		
		replayEvent(xEvt );
		
		let replayTime:number = (laEvt.CEFEvent.@evtTime - xEvt.CEFEvent.@evtTime) / 1000;
		let replayTim2:number = (l2Evt.CEFEvent.@evtTime - laEvt.CEFEvent.@evtTime) / 1000;
		
		//if(replayTime > .01)
		if(replayTime > 0)
		{
			// Manage the cursor acceleration curve
			//				
			if(l2Evt == null)
			{
				easingX = Exponential.easeOut;		// decelerate
				easingY = Exponential.easeOut;		// decelerate
			}				
			else
			{
				dX = Math.abs(laEvt.@localX - xEvt.@localX);
				v1 = dX / replayTime;
				v2 = Math.abs(l2Evt.@localX - laEvt.@localX) / replayTim2;
				
				if(this.traceMode) trace("delta T:" + replayTime + " : " + replayTim2);
				if(this.traceMode) trace("X: v1/v2:  " + (v1/v2));						
				
				if(dX < 10)
				{
					if(this.traceMode) trace("Easing X: Linear.easeNone");												
					easingX = Linear.easeNone;			// constant speed						
				}
				else if((v1 == 0) || (v2 == 0))
				{
					if(this.traceMode) trace("Easing X: Linear.easeNone");												
					easingX = Linear.easeNone;			// constant speed						
				}
				else if((v1/v2) > 3.5) 
				{
					if(this.traceMode) trace("Easing X: Exponential.easeOut");						
					easingX = Exponential.easeOut;		// decelerate
				}
				else if((v1/v2) < .30) 
				{
					if(this.traceMode) trace("Easing X: Exponential.easeIn");						
					easingX = Exponential.easeIn;	    // accelerate
				}
				else 
				{
					if(this.traceMode) trace("Easing X: Linear.easeNone");												
					easingX = Linear.easeNone;			// constant speed
				}
				
				dY = Math.abs(laEvt.@localY - xEvt.@localY);
				v1 = dY / replayTime;
				v2 = Math.abs(l2Evt.@localY - laEvt.@localY) / replayTim2;

				if(this.traceMode) trace("Y: v1/v2:  " + (v1/v2));						
				
				if(dY < 10)
				{
					if(this.traceMode) trace("Easing X: Linear.easeNone");												
					easingY = Linear.easeNone;			// constant speed						
				}
				else if((v1 == 0) || (v2 == 0))
				{
					if(this.traceMode) trace("Easing X: Linear.easeNone");												
					easingY = Linear.easeNone;			// constant speed						
				}
				else if((v1/v2) > 3.5) 
				{
					if(this.traceMode) trace("Easing Y: Exponential.easeOut");						
					easingY = Exponential.easeOut;		// decelerate
				}
				else if((v1/v2) < .30) 
				{
					if(this.traceMode) trace("Easing Y: Exponential.easeIn");						
					easingY = Exponential.easeIn;	   	// accelerate
				}
				else
				{
					if(this.traceMode) trace("Easing Y: Linear.easeNone");						
					easingY = Linear.easeNone;					    	// constant speed
				}
			}
			
			tweens = new Array;
			
			tweens[0] = new Tween(this, "x", easingX, x, laEvt.@localX, replayTime, true );
			tweens[1] = new Tween(this, "y", easingY, y, laEvt.@localY, replayTime, true );				
		}
		
		return tweens;
	}
	
	
	public replayMove(oldTime:int, laEvt:XMLList ) : Array
	{			
		let tweens:Array;
		
		let replayTime:number = (laEvt.CEFEvent.@evtTime - oldTime) / 1000;

		if(replayTime > 0)
		{
			tweens = new Array;
			
			tweens[0] = new Tween(this, "x", Cubic.easeInOut, x, laEvt.@localX, replayTime, true );
			tweens[1] = new Tween(this, "y", Cubic.easeInOut, y, laEvt.@localY, replayTime, true );
		}
		
		return tweens;
	}
	
	
//***************** Automation *******************************		
	
	
//***********  Live behaviors

	public liveMouseMove(evt:MouseEvent)
	{
		let evtMove:CEFMouseEvent;
		let fUpdate:boolean = false;
		
		let locX:number; 
		let locY:number; 
		
		locX = evt.stageX;
		locY = evt.stageY;
		
		if(this.x != locX)
		{
			this.x  = locX;
			fUpdate = true;
		}
		if(this.y != locY)
		{
			this.y  = locY;
			fUpdate = true;
		}

		//trace("Mousex:" + this.x + " - Mousey:" + this.y);
		
		if(fUpdate)
		{
			// Hit test the mouse 
			//
			hitTestMouse(evt);	
			
			if(curObject)
			{
				if(this.traceMode) trace("CEF Mouse Move : " + curObject.objID);				
				//
				evtMove = new CEFMouseEvent(curObject.objID, CEFMouseEvent.WOZMOVE, true, false, locX, locY);
				
				// Add this to the live event logging stream
				//
				if(fLiveLog)
					gLogR.logLiveEvent(evtMove.captureLogState());				

				// Log it before taking actions - state may change which would cause playback to freeze
					
				curObject.dispatchEvent(evtMove);				
			}
			
			// null hittest result
			else
			{
				if(this.traceMode) trace("NULL Mouse Move : ");				
				
				// Add this to the live event logging stream
				//
				evtMove = new CEFMouseEvent("none", CEFMouseEvent.WOZMOVE, true, false, locX, locY);

				if(fLiveLog)					
					gLogR.logLiveEvent(evtMove.captureLogState());				
			}
		}				
	}
		
	
	public liveMouseDown(evt:MouseEvent)
	{
		let locX:number; 
		let locY:number; 
		
		locX = evt.stageX;
		locY = evt.stageY;			
		
		// Hit test the mouse to ensure curTarget does not change while mouse is not moving
		// e.g. after a click a button may be dismissed
		//
		hitTestMouse(evt);	
		
		//@@ DEBUG
		//dumpStage(stage, "stage");			
		
		if(curObject)
		{
			if(this.traceMode) trace("CEF Mouse Down : " + curObject.objID);				
			//
			let evtDown:CEFMouseEvent = new CEFMouseEvent(curObject.objID, CEFMouseEvent.WOZDOWN, true, false, locX, locY);
			
			// Add this to the live event logging stream
			//
			if(fLiveLog)				
				gLogR.logLiveEvent(evtDown.captureLogState());
			
			// Log it before taking actions - state may change which would cause playback to freeze					
				
			curObject.dispatchEvent(evtDown);	
			
			actObject = curObject;
		}
	}

	
	public liveMouseUp(evt:MouseEvent)
	{
		if(this.traceMode) trace("CEF Mouse Up : " + ((curObject)? curObject.objID:"null"));				
		
		let locX:number; 
		let locY:number; 
		
		locX = evt.stageX;
		locY = evt.stageY;
					
		if(actObject)
		{
			let evtUp:CEFMouseEvent = new CEFMouseEvent(actObject.objID, CEFMouseEvent.WOZUP, true, false, locX, locY);
			
			// Add this to the live event logging stream
			//
			if(fLiveLog)				
				gLogR.logLiveEvent(evtUp.captureLogState());				
		
			// Log it before taking actions - state may change which would cause playback to freeze
			
			actObject.dispatchEvent(evtUp);	
			
			if(actObject == curObject)		
			{
				if(this.traceMode) trace("CEF Mouse Click : " + curObject.objID +  "  At X:" + locX +  "  Y:" + locY);				
				let evtClicked:CEFMouseEvent = new CEFMouseEvent(curObject.objID, CEFMouseEvent.WOZCLICKED, true, false, locX, locY);
								
				// Add this to the live event logging stream
				//
				if(fLiveLog)					
					gLogR.logLiveEvent(evtClicked.captureLogState());	
					
				// Log it before taking actions - state may change which would cause playback to freeze
				
				curObject.dispatchEvent(evtClicked);	
			}
		}
		
		// Object is no longer actObject
		//
		actObject = null;
	}				


	public liveMouseDblClick(evt:MouseEvent)
	{
		let locX:number; 
		let locY:number; 
		
		locX = evt.stageX;
		locY = evt.stageY;
					
		if(curObject)
		{
			if(this.traceMode) trace("CEF Mouse Dbl Clicked: " + curObject.objID);				
			//
			let evtDblClick:CEFMouseEvent = new CEFMouseEvent(curObject.objID, CEFMouseEvent.WOZDBLCLICK, true, false, locX, locY);
			
			// Add this to the live event logging stream
			//
			if(fLiveLog)			
				gLogR.logLiveEvent(evtDblClick.captureLogState());
			
			// Log it before taking actions - state may change which would cause playback to freeze
				
			curObject.dispatchEvent(evtDblClick);	
		}
	}
	
	
//***********  Utility Functions
	
	public stateHelper(tarObj:CEFObject ) : boolean
	{
		let fTest:boolean = false;
		
		if(hitTestCoord(x, y ) == tarObj) fTest = true;
								
		return fTest;
	}

	public hitTestCoord(locX:int, locY:int ) : CEFObject
	{
		let hitSet:Array;
		let hitObj:Object;
		let wozObj:CEFObject;
		
		cLocation.x = locX;
		cLocation.y = locY;
		
		// NOTE: Changed to "stage" for Flex integration - was gTutor
		//
		// Since gTutor is not synonymous with the stage coordinates when working in Flex and since we are 
		// using Stage coordinates we must "getObjectsUnderPoint" relative to the Stage rather than the gTutor
		//
		hitSet = stage.getObjectsUnderPoint(cLocation);
		
		if(this.traceMode) trace("Hittest results  - cursor name: " + name);
		
		// Find WOZ Object under cursor
		//
		if(hitSet.length)
		{
			hitObj = hitSet[hitSet.length - 1];
			
			wozObj = isWOZObject(hitObj);
			
			// if top object is a WOZ - skip this and process it otherwise 
			// top object may be the cursor - so check "next" object if extant
			//
			if(!wozObj && (hitSet.length > 1))
			{
				hitObj = hitSet[hitSet.length - 2];
				
				wozObj = isWOZObject(hitObj);							
			}
		}			
		
		if(wozObj)
			if(this.traceMode) trace("HitTest WozObject Name - " + wozObj.name);
			
		return wozObj;
	}
		
	
	public hitTestMouse(evt:MouseEvent)
	{
		let hitObj:CEFObject;
		
		hitObj = hitTestCoord(x, y );
		
		// if top object is a WOZ - process it 
		//
		if(hitObj || (!hitObj && (actObject == null)))
						updateCurrentObject(evt, hitObj );				
	}
		
	
	public show(bFlag:boolean)	
	{		
		if(bFlag)
		{
			if(this.traceMode) trace("Hiding Hardware Mouse : ");
			
			Mouse.hide();						
			visible = true;
		}
		else
		{
			if(this.traceMode) trace("Showing Hardware Mouse : ");
							
			Mouse.show();			
			visible = false;				
		}
	}
	
	
	private updateCurrentObject(evt:MouseEvent, hitObj:CEFObject)
	{
		if(this.traceMode) (hitObj)? trace("updateCurrentObject hitObj: " + hitObj.objID): trace("updateCurrentObject hitObj: null");		
		
		let locX:number; 
		let locY:number; 
		
		locX = evt.stageX;
		locY = evt.stageY;
					
		// Ignore Duplicates
		//
		if(hitObj == curObject)
							return;									
							
		// Send mouse out / over
		//
		else
		{
			if(curObject)
			{
				if(this.traceMode) trace("CEF Mouse Out : " + curObject.objID);				
				let evtOut:CEFMouseEvent = new CEFMouseEvent(curObject.objID, CEFMouseEvent.WOZOUT, true, false, locX, locY);
				
				// Add this to the live event logging stream
				//
				if(fLiveLog)					
					gLogR.logLiveEvent(evtOut.captureLogState());									
				
				// Log it before taking actions - state may change which would cause playback to freeze
				
				curObject.dispatchEvent(evtOut);	
			}
			
			curObject = hitObj;				
			
			if(curObject)
			{					
				if(this.traceMode) trace("CEF Mouse Over: " + curObject.objID);
				let evtOver:CEFMouseEvent = new CEFMouseEvent(curObject.objID, CEFMouseEvent.WOZOVER, true, false, locX, locY);
				
				// Add this to the live event logging stream
				//
				if(fLiveLog)
					gLogR.logLiveEvent(evtOver.captureLogState());	
					
				// Log it before taking actions - state may change which would cause playback to freeze					
					
				curObject.dispatchEvent(evtOver);	
			}
		}
	}
	
	
	public isWOZObject(tObj:Object) : CEFObject
	{
		// We don't enumerate top level objects in scenes that are not CEF
		// i.e. to be interactive an object must be derived from CEFObject
		//
		if(!tObj || tObj is CEFScene)
							return null;
		
		// Hit test WOZ Objects - Exclude the cursor 
		//
		else if(tObj is CEFObject)  
							return CEFObject(tObj);
		
		return isWOZObject(tObj.parent);
	}
	
}

