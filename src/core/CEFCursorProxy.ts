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



namespace TutorEngineOne {

//** Imports

import MovieClip     	  = createjs.MovieClip;
import DisplayObject      = createjs.DisplayObject;
import Point     		  = createjs.Point;
import Tween     		  = createjs.Tween;
import Ease			      = createjs.Ease;



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
	
	constructor()
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
			
		(this as any)[style].visible = true;
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
		if(sMode == CEFCursorProxy.WOZLIVE)
		{
			this.stage.addEventListener(CEFMouseEvent.MOUSE_MOVE  , this.liveMouseMove);
			this.stage.addEventListener(CEFMouseEvent.MOUSE_DOWN  , this.liveMouseDown);
			this.stage.addEventListener(CEFMouseEvent.MOUSE_UP    , this.liveMouseUp);		
			this.stage.addEventListener(CEFMouseEvent.DOUBLE_CLICK, this.liveMouseDblClick);		
		}
		// Input is being driven by log input
		//
		else if(sMode == CEFCursorProxy.WOZREPLAY)
		{
			this.stage.removeEventListener(CEFMouseEvent.MOUSE_MOVE  , this.liveMouseMove);
			this.stage.removeEventListener(CEFMouseEvent.MOUSE_DOWN  , this.liveMouseDown);
			this.stage.removeEventListener(CEFMouseEvent.MOUSE_UP    , this.liveMouseUp);						
			this.stage.removeEventListener(CEFMouseEvent.DOUBLE_CLICK, this.liveMouseDblClick);		
		}			
					
		// Show the woz cursor 
		//
		//show(true);
	}
	
	
	public decodeTarget(baseObj:any, objArray:Array<any> ) : CEFObject
	{
		let tmpObject:CEFObject = null;
		let subObject:string;
		
		subObject = objArray.shift();
		
		if(this.traceMode) CUtil.trace("decoding: " + subObject );
		
//			if((subObject == "Cell10"))
//							CUtil.trace("test point");
		
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
	
	public playBackAction(wozEvt:any ) : void
	{
		let traceAction:boolean = false;
		
		let tarObject:CEFObject;
		let objArray:Array<any>;
					
		if (traceAction) CUtil.trace("PlayBack Action: " + wozEvt);
		
		if(wozEvt.CEFMouseEvent != undefined)
		{
			this.x = wozEvt.CEFMouseEvent.localX;
			this.y = wozEvt.CEFMouseEvent.localY;
			
			//*** Click indicator *************
			//
			if(this.fSparklerTest)
			{
				this.fSparklerTest = false;
				if(wozEvt.CEFMouseEvent.CEFEvent.type.toString() == CEFMouseEvent.WOZMOVE) this.fSparklerDrag = true;
			}

			if((wozEvt.CEFMouseEvent.CEFEvent.type.toString() == CEFMouseEvent.WOZDOWN) && this.fSparkler)
			{
				this.fSparklerDrag = false;
				this.fSparklerTest = true;
				this.Ssparkle.gotoAndPlay(2);			
			}
						
			if((wozEvt.CEFMouseEvent.CEFEvent.type.toString() == CEFMouseEvent.WOZUP) && this.fSparklerDrag)
																								this.Ssparkle.gotoAndPlay(10);			
			//
			//*** Click indicator *************
	
	
			if(traceAction) CUtil.trace("Splitting: " + wozEvt.CEFMouseEvent.CEFEvent.target + " EVT TYPE: " +  wozEvt.CEFMouseEvent.CEFEvent.type);
			
			objArray = wozEvt.CEFMouseEvent.CEFEvent.target.split(".");
						
			if(traceAction) CUtil.trace("Target Array: " + objArray[0]);
						
			tarObject = this.decodeTarget(CEFRoot.gTutor, objArray);

			if(tarObject)
			{
				if(traceAction) CUtil.trace("Automation Target: " + tarObject + " Event: " + wozEvt.CEFMouseEvent.CEFEvent.type);

				let evt:CEFMouseEvent = new CEFMouseEvent(tarObject.objID, wozEvt.CEFMouseEvent.CEFEvent.type, wozEvt.bubbles, wozEvt.cancelable, wozEvt.stageX, wozEvt.stageY,wozEvt.nativeEvent, wozEvt.pointerID, wozEvt.primary, wozEvt.rawX, wozEvt.rawY);
				
				tarObject.dispatchEvent(evt);										
			}
			
		}
		
		
		else if(wozEvt.CEFTextEvent != undefined)
		{	
			if(traceAction) CUtil.trace("Splitting: " + wozEvt.CEFTextEvent.CEFEvent.target + " EVT TYPE: " +  wozEvt.CEFTextEvent.CEFEvent.type);
			
			if(wozEvt.CEFTextEvent.CEFEvent.type == CEFTextEvent.WOZINPUTTEXT)
			{
				objArray = wozEvt.CEFTextEvent.CEFEvent.target.split(".");
							
				if(traceAction) CUtil.trace("Target Array: " + objArray[0]);
							
				tarObject = this.decodeTarget(CEFRoot.gTutor, objArray);

				if(tarObject)
				{
					if(traceAction) CUtil.trace("Automation Target: " + tarObject + " Event: " + wozEvt.CEFTextEvent.CEFEvent.type);
								
					let tEvt:CEFTextEvent = new CEFTextEvent(tarObject.objID, wozEvt.CEFTextEvent.CEFEvent.type, wozEvt.CEFTextEvent.index1, wozEvt.CEFTextEvent.index2, wozEvt.CEFTextEvent.text, true, false );						
					
					tarObject.dispatchEvent(tEvt);										
				}
			}
		}
		
	}
		
		
	public playBackMove(nextMove:any, frameTime:number ) : void
	{			
		let relTime:number = (frameTime - this.lastFrameTime) / (nextMove.time - this.lastFrameTime);

		if (this.traceMode) CUtil.trace("PlayBack Move");
		
		this.x += relTime * (nextMove.CEFMouseEvent.localX - this.x);
		this.y += relTime * (nextMove.CEFMouseEvent.localY - this.y);
		
		// update the frametime last used 
		//
		this.lastFrameTime = frameTime;
		
		if(this.traceMode) CUtil.trace("-- Target X: " + nextMove.CEFMouseEvent.localX + " -- Target Y: " + nextMove.CEFMouseEvent.localY);
		if(this.traceMode) CUtil.trace("-- Mouse  X: " + this.x + " -- Mouse  Y: " + this.y);
	}
		
		
//********************** Playback 


	public replayEvent(xEvt:any ) : void
	{
		let tarObject:CEFObject;
		let objArray:Array<any>;
		
		this.x = xEvt.localX;
		this.y = xEvt.localY;
		
		//*** Click indicator *************
		//
		if(this.fSparklerTest)
		{
			this.fSparklerTest = false;
			if(xEvt.CEFEvent.type.toString() == CEFMouseEvent.WOZMOVE) this.fSparklerDrag = true;
		}

		if((xEvt.CEFEvent.type.toString() == CEFMouseEvent.WOZDOWN) && this.fSparkler)
		{
			this.fSparklerDrag = false;
			this.fSparklerTest = true;
			this.Ssparkle.gotoAndPlay(2);			
		}
					
		if((xEvt.CEFEvent.type.toString() == CEFMouseEvent.WOZUP) && this.fSparklerDrag)
															this.Ssparkle.gotoAndPlay(10);			
		//
		//*** Click indicator *************
																	
																	
		if(this.traceMode) CUtil.trace("Splitting: " + xEvt.CEFEvent.target + " EVT TYPE: " +  xEvt.CEFEvent.type);
		
		objArray = xEvt.CEFEvent.target.split(".");
					
		if(this.traceMode) CUtil.trace("Target Array: " + objArray[0]);
					
		tarObject = this.decodeTarget(CEFRoot.gTutor, objArray);

		if(tarObject)
		{
			if(this.traceMode) CUtil.trace("Automation Target: " + tarObject + " Event: " + xEvt.CEFEvent.type);
						
//			if((tarObject.name == "Cell10"))// && (xEvt.CEFEvent.type == CEFMouseEvent.WOZDOWN))
//							CUtil.trace("test point");
						
			let evt:CEFMouseEvent = new CEFMouseEvent(tarObject.objID, xEvt.CEFEvent.type, xEvt.bubbles, xEvt.cancelable, xEvt.stageX, xEvt.stageY,xEvt.nativeEvent, xEvt.pointerID, xEvt.primary, xEvt.rawX, xEvt.rawY);
			
			tarObject.dispatchEvent(evt);										
		}
	}
	
	
	public replayEventB(xEvt:any ) : void
	{
		let tarObject:CEFObject;
		
		this.x = xEvt.localX;
		this.y = xEvt.localY;
		
		tarObject = this.hitTestCoord(this.x, this.y );

		if(tarObject)
		{
			switch(xEvt.CEFEvent.type.toString())
			{
				case CEFMouseEvent.WOZMOVE:				// Ignore Event
							return;			
							
				case CEFMouseEvent.WOZOUT:					// Use "Current" Object
							tarObject = this.curObject;			
							break;
							
				case CEFMouseEvent.WOZOVER:				// Set Current Object
							this.curObject = tarObject;			
							break;
							
				case CEFMouseEvent.WOZUP:					// Direct "Up" to previous "Down" target
							tarObject = this.actObject;	
							break;
							
				case CEFMouseEvent.WOZDOWN:				// remember Down target object
							this.actObject = this.curObject;
							tarObject = this.curObject;
							break;
							
				case CEFMouseEvent.WOZCLICKED:				// Direct "Click" to previous "Down" target
							tarObject = this.actObject;	
							break;								
							
				case CEFMouseEvent.WOZDBLCLICK:			// Direct "Double Click" to previous "Down" target
							tarObject = this.actObject;	
							break;								
			}

			if(this.traceMode) CUtil.trace("Automation Target: " + tarObject + " Event: " + xEvt.CEFEvent.type);
						
			let evt:CEFMouseEvent = new CEFMouseEvent(tarObject.objID, xEvt.CEFEvent.type, xEvt.bubbles, xEvt.cancelable, xEvt.stageX, xEvt.stageY,xEvt.nativeEvent, xEvt.pointerID, xEvt.primary, xEvt.rawX, xEvt.rawY);
			
			tarObject.dispatchEvent(evt);										
		}
	}
	
	
	public replayEventAndMove(xEvt:any, laEvt:any, l2Evt:any ) : Array<any>
	{
		let tweens:Array<Tween>;
		let easingX:any;
		let easingY:any;
		let v1:number;
		let v2:number;
		let dX:number;
		let dY:number;
		
		this.replayEvent(xEvt );
		
		let replayTime:number = (laEvt.CEFEvent.evtTime - xEvt.CEFEvent.evtTime) / 1000;
		let replayTim2:number = (l2Evt.CEFEvent.evtTime - laEvt.CEFEvent.evtTime) / 1000;
		
		//if(replayTime > .01)
		if(replayTime > 0)
		{
			// Manage the cursor acceleration curve
			//				
			if(l2Evt == null)
			{
				easingX = Ease.cubicOut;		// decelerate
				easingY = Ease.cubicOut;		// decelerate
			}				
			else
			{
				dX = Math.abs(laEvt.localX - xEvt.localX);
				v1 = dX / replayTime;
				v2 = Math.abs(l2Evt.localX - laEvt.localX) / replayTim2;
				
				if(this.traceMode) CUtil.trace("delta T:" + replayTime + " : " + replayTim2);
				if(this.traceMode) CUtil.trace("X: v1/v2:  " + (v1/v2));						
				
				if(dX < 10)
				{
					if(this.traceMode) CUtil.trace("Easing X: Ease.linear");												
					easingX = Ease.linear;			// constant speed						
				}
				else if((v1 == 0) || (v2 == 0))
				{
					if(this.traceMode) CUtil.trace("Easing X: Ease.linear");												
					easingX = Ease.linear;			// constant speed						
				}
				else if((v1/v2) > 3.5) 
				{
					if(this.traceMode) CUtil.trace("Easing X: Ease.cubicOut");						
					easingX = Ease.cubicOut;		// decelerate
				}
				else if((v1/v2) < .30) 
				{
					if(this.traceMode) CUtil.trace("Easing X: Ease.cubicIn");						
					easingX = Ease.cubicIn;	    // accelerate
				}
				else 
				{
					if(this.traceMode) CUtil.trace("Easing X: Ease.linear");												
					easingX = Ease.linear;			// constant speed
				}
				
				dY = Math.abs(laEvt.localY - xEvt.localY);
				v1 = dY / replayTime;
				v2 = Math.abs(l2Evt.localY - laEvt.localY) / replayTim2;

				if(this.traceMode) CUtil.trace("Y: v1/v2:  " + (v1/v2));						
				
				if(dY < 10)
				{
					if(this.traceMode) CUtil.trace("Easing X: Ease.linear");												
					easingY = Ease.linear;			// constant speed						
				}
				else if((v1 == 0) || (v2 == 0))
				{
					if(this.traceMode) CUtil.trace("Easing X: Ease.linear");												
					easingY = Ease.linear;			// constant speed						
				}
				else if((v1/v2) > 3.5) 
				{
					if(this.traceMode) CUtil.trace("Easing Y: Ease.cubicOut");						
					easingY = Ease.cubicOut;		// decelerate
				}
				else if((v1/v2) < .30) 
				{
					if(this.traceMode) CUtil.trace("Easing Y: Ease.cubicIn");						
					easingY = Ease.cubicIn;	   	// accelerate
				}
				else
				{
					if(this.traceMode) CUtil.trace("Easing Y: Ease.linear");						
					easingY = Ease.linear;					    	// constant speed
				}
			}
			
			tweens = new Array;
			
			tweens[0] = new Tween(this).to({x:laEvt.localX}, replayTime, easingX);
			tweens[1] = new Tween(this).to({y:laEvt.localY}, replayTime, easingY);			
		}
		
		return tweens;
	}
	
	
	public replayMove(oldTime:number, laEvt:any ) : Array<Tween>
	{			
		let tweens:Array<Tween>;
		
		let replayTime:number = (laEvt.CEFEvent.evtTime - oldTime) / 1000;

		if(replayTime > 0)
		{
			tweens = new Array;
			
			tweens[0] = new Tween(this).to({x:laEvt.localX}, replayTime, Ease.cubicInOut);
			tweens[1] = new Tween(this).to({y:laEvt.localY}, replayTime, Ease.cubicInOut);			
		}
		
		return tweens;
	}
	
	
//***************** Automation *******************************		
	
	
//***********  Live behaviors

	public liveMouseMove(evt:CEFMouseEvent)
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

		//CUtil.trace("Mousex:" + this.x + " - Mousey:" + this.y);
		
		if(fUpdate)
		{
			// Hit test the mouse 
			//
			this.hitTestMouse(evt);	
			
			if(this.curObject)
			{
				if(this.traceMode) CUtil.trace("CEF Mouse Move : " + this.curObject.objID);				
				//
				evtMove = new CEFMouseEvent("none", CEFMouseEvent.WOZMOVE, evt.bubbles, evt.cancelable, evt.stageX, evt.stageY, evt.nativeEvent, evt.pointerID, evt.primary, evt.rawX, evt.rawY);
				
				// Add this to the live event logging stream
				//
				if(this.fLiveLog)
					this.gLogR.logLiveEvent(evtMove.captureLogState());				

				// Log it before taking actions - state may change which would cause playback to freeze
					
				this.curObject.dispatchEvent(evtMove);				
			}
			
			// null hittest result
			else
			{
				if(this.traceMode) CUtil.trace("NULL Mouse Move : ");				
				
				// Add this to the live event logging stream
				//
				evtMove = new CEFMouseEvent("none", CEFMouseEvent.WOZMOVE, evt.bubbles, evt.cancelable, evt.stageX, evt.stageY, evt.nativeEvent, evt.pointerID, evt.primary, evt.rawX, evt.rawY);

				if(this.fLiveLog)					
					this.gLogR.logLiveEvent(evtMove.captureLogState());				
			}
		}				
	}
		
	
	public liveMouseDown(evt:CEFMouseEvent)
	{
		let locX:number; 
		let locY:number; 
		
		locX = evt.stageX;
		locY = evt.stageY;			
		
		// Hit test the mouse to ensure curTarget does not change while mouse is not moving
		// e.g. after a click a button may be dismissed
		//
		this.hitTestMouse(evt);	
		
		//@@ DEBUG
		//dumpStage(stage, "stage");			
		
		if(this.curObject)
		{
			if(this.traceMode) CUtil.trace("CEF Mouse Down : " + this.curObject.objID);				
			//			
			let evtDown:CEFMouseEvent = new CEFMouseEvent(this.curObject.objID, CEFMouseEvent.WOZDOWN, evt.bubbles, evt.cancelable, evt.stageX, evt.stageY, evt.nativeEvent, evt.pointerID, evt.primary, evt.rawX, evt.rawY);
			
			// Add this to the live event logging stream
			//
			if(this.fLiveLog)				
				this.gLogR.logLiveEvent(evtDown.captureLogState());
			
			// Log it before taking actions - state may change which would cause playback to freeze					
				
			this.curObject.dispatchEvent(evtDown);	
			
			this.actObject = this.curObject;
		}
	}

	
	public liveMouseUp(evt:CEFMouseEvent)
	{
		if(this.traceMode) CUtil.trace("CEF Mouse Up : " + ((this.curObject)? this.curObject.objID:"null"));				
		
		let locX:number; 
		let locY:number; 
		
		// locX = evt.stageX;		//** TODO */
		// locY = evt.stageY;
					
		if(this.actObject)
		{
			let evtUp:CEFMouseEvent = new CEFMouseEvent(this.actObject.objID, CEFMouseEvent.WOZUP, evt.bubbles, evt.cancelable, evt.stageX, evt.stageY, evt.nativeEvent, evt.pointerID, evt.primary, evt.rawX, evt.rawY);
			
			// Add this to the live event logging stream
			//
			if(this.fLiveLog)				
				this.gLogR.logLiveEvent(evtUp.captureLogState());				
		
			// Log it before taking actions - state may change which would cause playback to freeze
			
			this.actObject.dispatchEvent(evtUp);	
			
			if(this.actObject == this.curObject)		
			{
				if(this.traceMode) CUtil.trace("CEF Mouse Click : " + this.curObject.objID +  "  At X:" + locX +  "  Y:" + locY);				
				let evtClicked:CEFMouseEvent = new CEFMouseEvent(this.curObject.objID, CEFMouseEvent.WOZCLICKED, evt.bubbles, evt.cancelable, evt.stageX, evt.stageY, evt.nativeEvent, evt.pointerID, evt.primary, evt.rawX, evt.rawY);
								
				// Add this to the live event logging stream
				//
				if(this.fLiveLog)					
					this.gLogR.logLiveEvent(evtClicked.captureLogState());	
					
				// Log it before taking actions - state may change which would cause playback to freeze
				
				this.curObject.dispatchEvent(evtClicked);	
			}
		}
		
		// Object is no longer actObject
		//
		this.actObject = null;
	}				


	public liveMouseDblClick(evt:CEFMouseEvent)
	{
		let locX:number; 
		let locY:number; 
		
		// locX = evt.stageX;	//** TODO */
		// locY = evt.stageY;
					
		if(this.curObject)
		{
			if(this.traceMode) CUtil.trace("CEF Mouse Dbl Clicked: " + this.curObject.objID);				
			//
			let evtDblClick:CEFMouseEvent = new CEFMouseEvent(this.curObject.objID, CEFMouseEvent.WOZDBLCLICK, evt.bubbles, evt.cancelable, evt.stageX, evt.stageY, evt.nativeEvent, evt.pointerID, evt.primary, evt.rawX, evt.rawY);
			
			// Add this to the live event logging stream
			//
			if(this.fLiveLog)			
				this.gLogR.logLiveEvent(evtDblClick.captureLogState());
			
			// Log it before taking actions - state may change which would cause playback to freeze
				
			this.curObject.dispatchEvent(evtDblClick);	
		}
	}
	
	
//***********  Utility Functions
	
	public stateHelper(tarObj:CEFObject ) : boolean
	{
		let fTest:boolean = false;
		
		if(this.hitTestCoord(this.x, this.y ) == tarObj) fTest = true;
								
		return fTest;
	}

	public hitTestCoord(locX:number, locY:number ) : CEFObject
	{
		let hitSet:Array<DisplayObject>;
		let hitObj:Object;
		let wozObj:CEFObject;
		
		this.cLocation.x = locX;
		this.cLocation.y = locY;
		
		// NOTE: Changed to "stage" for Flex integration - was gTutor
		//
		// Since gTutor is not synonymous with the stage coordinates when working in Flex and since we are 
		// using Stage coordinates we must "getObjectsUnderPoint" relative to the Stage rather than the gTutor
		//
		hitSet = this.stage.getObjectsUnderPoint(locX, locY, 0);
		
		if(this.traceMode) CUtil.trace("Hittest results  - cursor name: " + name);
		
		// Find WOZ Object under cursor
		//
		if(hitSet.length)
		{
			hitObj = hitSet[hitSet.length - 1];
			
			wozObj = this.isWOZObject(hitObj);
			
			// if top object is a WOZ - skip this and process it otherwise 
			// top object may be the cursor - so check "next" object if extant
			//
			if(!wozObj && (hitSet.length > 1))
			{
				hitObj = hitSet[hitSet.length - 2];
				
				wozObj = this.isWOZObject(hitObj);							
			}
		}			
		
		if(wozObj)
			if(this.traceMode) CUtil.trace("HitTest WozObject Name - " + wozObj.name);
			
		return wozObj;
	}
		
	
	public hitTestMouse(evt:CEFMouseEvent)
	{
		let hitObj:CEFObject;
		
		hitObj = this.hitTestCoord(this.x, this.y );
		
		// if top object is a WOZ - process it 
		//
		if(hitObj || (!hitObj && (this.actObject == null)))
						this.updateCurrentObject(evt, hitObj );				
	}
		
	
	// see: https://www.w3schools.com/jsref/prop_style_cursor.asp
	public show(bFlag:boolean)	
	{		
		if(bFlag)
		{
			if(this.traceMode) CUtil.trace("Hiding Hardware Mouse : ");
			
			document.getElementById("canvas").style.cursor = "none";
			this.visible = true;
		}
		else
		{
			if(this.traceMode) CUtil.trace("Showing Hardware Mouse : ");
							
			document.getElementById("canvas").style.cursor = "none";
			this.visible = false;				
		}
	}
	
	
	private updateCurrentObject(evt:CEFMouseEvent, hitObj:CEFObject)
	{
		if(this.traceMode) (hitObj)? CUtil.trace("updateCurrentObject hitObj: " + hitObj.objID): CUtil.trace("updateCurrentObject hitObj: null");		
		
		let locX:number; 
		let locY:number; 
		
		locX = evt.stageX;
		locY = evt.stageY;
					
		// Ignore Duplicates
		//
		if(hitObj == this.curObject)
							return;									
							
		// Send mouse out / over
		//
		else
		{
			if(this.curObject)
			{
				if(this.traceMode) CUtil.trace("CEF Mouse Out : " + this.curObject.objID);				
				let evtOut:CEFMouseEvent = new CEFMouseEvent(this.curObject.objID, CEFMouseEvent.WOZOUT, evt.bubbles, evt.cancelable, evt.stageX, evt.stageY, evt.nativeEvent, evt.pointerID, evt.primary, evt.rawX, evt.rawY);
				
				// Add this to the live event logging stream
				//
				if(this.fLiveLog)					
					this.gLogR.logLiveEvent(evtOut.captureLogState());									
				
				// Log it before taking actions - state may change which would cause playback to freeze
				
				this.curObject.dispatchEvent(evtOut);	
			}
			
			this.curObject = hitObj;				
			
			if(this.curObject)
			{					
				if(this.traceMode) CUtil.trace("CEF Mouse Over: " + this.curObject.objID);
				let evtOver:CEFMouseEvent = new CEFMouseEvent(this.curObject.objID, CEFMouseEvent.WOZOVER, evt.bubbles, evt.cancelable, evt.stageX, evt.stageY, evt.nativeEvent, evt.pointerID, evt.primary, evt.rawX, evt.rawY);
				
				// Add this to the live event logging stream
				//
				if(this.fLiveLog)
					this.gLogR.logLiveEvent(evtOver.captureLogState());	
					
				// Log it before taking actions - state may change which would cause playback to freeze					
					
				this.curObject.dispatchEvent(evtOver);	
			}
		}
	}
	
	
	public isWOZObject(tObj:any) : CEFObject
	{
		// We don't enumerate top level objects in scenes that are not CEF
		// i.e. to be interactive an object must be derived from CEFObject
		//
		if(!tObj || tObj instanceof CEFScene)
							return null;
		
		// Hit test WOZ Objects - Exclude the cursor 
		//
		else if(tObj instanceof CEFObject)  
								return tObj;
		
		return this.isWOZObject(tObj.parent);
	}
	
}
}

