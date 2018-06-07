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

import { TRoot }		from "./TRoot";
import { TObject }     	from "./TObject";

import { CEFEvent } 	from "../events/CEFEvent";
import { TMouseEvent }  from "./events/TMouseEvent";

import { CONST }        from "../util/CONST";
import { CUtil } 		from "../util/CUtil";

import MovieClip     		  = createjs.MovieClip;
import Timeline     		  = createjs.Timeline;
import DisplayObject 		  = createjs.DisplayObject;
import DisplayObjectContainer = createjs.Container;



export class TButton extends TObject
{
	//************ Stage Symbols
	
	public shape:MovieClip;
	public shape_1:MovieClip;
	public shape_2:MovieClip;
	public shape_3:MovieClip;
	
	//************ Stage Symbols
	
	public curState:string   = CONST.STATE_UP;
	public fPressed:boolean  = false;
	public fEnabled:boolean  = true;
	public fOver:boolean     = false;

	private onClickScript:TObject = null;
	

	constructor()
	{
		super();
		this.init3();
	}


/*  ###########  START CREATEJS SUBCLASS SUPPORT ##########  */
/* ######################################################### */

	public TButtonInitialize() {

		this.TObjectInitialize.call(this);
		this.init3();
	}

	public initialize() {

		this.TObjectInitialize.call(this);		
		this.init3();
	}

	private init3() {
		
		this.traceMode = true;
		if(this.traceMode) CUtil.trace("TButton:Constructor");

		this.on(CEFEvent.ADDED_TO_STAGE, this.onAddedToStage);

		// Note the CreateJS(AnimateCC) parts of the button have not been created
		// at this point.
	}

/* ######################################################### */
/*  ###########  END CREATEJS SUBCLASS SUPPORT ###########   */


	public Destructor() : void
	{
		this.removeEventListener(TMouseEvent.WOZCLICKED, this.doMouseClicked);
		this.removeEventListener(TMouseEvent.WOZOVER   , this.doMouseOver);
		this.removeEventListener(TMouseEvent.WOZOUT    , this.doMouseOut);
		this.removeEventListener(TMouseEvent.WOZDOWN   , this.doMouseDown);
		this.removeEventListener(TMouseEvent.WOZUP     , this.doMouseUp);			
		
		super.Destructor();
	}

	public onAddedToStage(evt:CEFEvent) {

		console.log("Button On Stage");

		this.mouseChildren = false;
		
		// Remove the AnimateCC created button timeline
		//
		this.timeline      = new Timeline(null,null,null);

		this.addChild(this[CONST.STATE_UP]);
		this.addChild(this[CONST.STATE_OVER]);
		this.addChild(this[CONST.STATE_DOWN]);
		this.addChild(this[CONST.STATE_DISABLED]);

		this.resetState();
	}

	// Walk the WOZ Objects to capture their default state
	//
	public captureDefState(TutScene:TObject ) : void 
	{
		super.captureDefState(TutScene );
	}
	
	
	// Walk the WOZ Objects to restore their default state
	//
	public restoreDefState(TutScene:TObject ) : void 
	{
		if(this.traceMode) CUtil.trace("Button Reseting: " + this.name);
		
		this.curState = "unknown";
		this.fPressed = false;
		this.fEnabled = true;
		this.fOver    = false;
					
		this.enableButton(true);
		
		super.restoreDefState(TutScene );
	}
	

//*************** Logging state management
	
	public captureLogState(obj:any = null) : TObject
	{
		obj = super.captureLogState(obj);
		
		obj['target']  = 'button'; 
		obj['name']	   = this.name; 
		obj['state']   = this.curState; 
		obj['pressed'] = this.fPressed.toString(); 
		obj['enabled'] = this.fEnabled.toString(); 
		obj['over']    = this.fOver.toString();
		
		return obj;											   
	}				
	
	public capturestringState() : string
	{		
		let stringVal:string = "<button this.name={this.name} state={curState} pressed={fPressed.toString()} enabled={fEnabled.toString()} over={fOver.toString()}/>";
		
		return stringVal;
	}		

//*************** Logging state management

	public resetState() : void 
	{											
		this[CONST.STATE_UP].visible 	   = true;
		this[CONST.STATE_OVER].visible 	   = false;
		this[CONST.STATE_DOWN].visible 	   = false;		
		this[CONST.STATE_DISABLED].visible = false;		
	}


	public gotoState(sState:string) : void 
	{
		if(this.traceMode) CUtil.trace("Button.gotoState: ", this.name + " " + sState);
		
		this.resetState();
		this.curState = sState;

		switch(sState) {

			case CONST.STATE_DOWN:
				this[CONST.STATE_DOWN].visible = true;
				this.fPressed = true;
				
				break;
							
			case CONST.STATE_UP:
				if(this.fOver)
					this[CONST.STATE_OVER].visible = true;
				else
					this[CONST.STATE_UP].visible = true;
					
				this.fPressed = false;
				
				break;
			
			case CONST.STATE_OVER:
				if(!this.fPressed)
					this[CONST.STATE_OVER].visible = true;
				else
					this[CONST.STATE_DOWN].visible = true;											
					
					this.fOver = true;					
				break;

			case CONST.STATE_OUT:

				this[CONST.STATE_UP].visible   = true;								
				this.fOver    = false;					
				this.fPressed = false;
				break;
		}

		if(!this.fEnabled) {

			this.resetState();
			this[CONST.STATE_UP].visible 	   = false;
			this[CONST.STATE_DISABLED].visible = true;
		}
		

	}					

	
	public muteButton( bMute:boolean)
	{			
		// Mute button
		if(bMute)
		{
			if(this.traceMode) CUtil.trace("Button Muted: " + this.name);				
			
			this.off(TMouseEvent.MOUSE_CLICK , this.doMouseClicked);
			this.off(TMouseEvent.MOUSE_OVER  , this.doMouseOver);
			this.off(TMouseEvent.MOUSE_OUT   , this.doMouseOut);
			this.off(TMouseEvent.MOUSE_DOWN  , this.doMouseDown);
			this.off(TMouseEvent.MOUSE_UP    , this.doMouseUp);
		}
		
		// Unmute Button
		else
		{
			if(this.traceMode) CUtil.trace("Button UnMuted: " + this.name);				
			
			this.on(TMouseEvent.MOUSE_CLICK , this.doMouseClicked);
			this.on(TMouseEvent.MOUSE_OVER  , this.doMouseOver);
			this.on(TMouseEvent.MOUSE_OUT   , this.doMouseOut);
			this.on(TMouseEvent.MOUSE_DOWN  , this.doMouseDown);
			this.on(TMouseEvent.MOUSE_UP    , this.doMouseUp);
		}
		
	}
			
	
	public enableButton( bFlag:boolean)
	{			
		// set flag
		// 
		this.fEnabled = bFlag;
		
		//## Mod May 10 2014 - was changing state explicitly which is undesirable - 
		//                    Should just set enable flag and then force button update with curState
		
		// Disable button
		if(!bFlag)
		{
			if(this.traceMode) CUtil.trace("Button Disabled: " + this.name);				
			
			this.gotoState(this.curState);				

			// don't listen to the button
			this.muteButton(true);
		}
		
		// Enable button
		else
		{
			if(this.traceMode) CUtil.trace("Button Enabled: " + this.name);				
			
			this.gotoState(this.curState);				
			
			// Listen to the button 
			this.muteButton(false);
		}
		
	}
			

//***********  WOZ automatable event stream -

	public doMouseClicked(evt:TMouseEvent) : void 
	{						
		if(this.fPressed && this.fEnabled) {

			if(this.traceMode) CUtil.trace("dispatch CLICK");
			
			this.doClickAction(evt);
		
			//@@ Action Logging			
			let logData:any = {'action':'button_click', 'targetid':this.name};
			
			this.tutorDoc.log.logActionEvent(logData);			
			//@@ Action Logging						
		}

		this.gotoState(CONST.STATE_UP);
		
	}					

	// TODO: implement sceneExt action
	protected doClickAction(evt:TMouseEvent) : void
	{
		try
		{
			// this.sceneExt["SButton1_Action"].call(this);
		}
		catch(e)
		{
			CUtil.trace("Error in onClick script: " + this.onClickScript);
		}
	}
	
	public doMouseOver(evt:TMouseEvent) : void 
	{											
		this.gotoState(CONST.STATE_OVER);		
	}					

	public doMouseOut(evt:TMouseEvent) : void 
	{											
		this.gotoState(CONST.STATE_OUT);
	}					

	public doMouseDown(evt:TMouseEvent) : void 
	{											
		this.gotoState(CONST.STATE_DOWN);
	}					

	public doMouseUp(evt:TMouseEvent) : void 
	{					
		this.gotoState(CONST.STATE_UP);
	}	
	
	public showButton(fShow:boolean) : void 
	{					
		// Show the button before testing it
		//
		this.visible = fShow;	

		// When a button comes on stage - update its state immediately
		//
		if(fShow)
		{
			if(this.traceMode) CUtil.trace("testing init state: " + this.name);
			
			// Let the button know that the mouse is over it
			//
			try 
			{
				if(this.tutorDoc.tutorContainer.cCursor.stateHelper(this))
				{
					if(this.traceMode) CUtil.trace("setting init state Over");
					this.doMouseOver(null);
				}	
			}
			catch(Error)
			{
				if(this.traceMode) CUtil.trace("cCursor not yet instantiated");
			}
		}
		
	}	
	
//*************** Serialization
	
	/*
	* 
	*/
	public loadXML(stringSrc:any) : void
	{		
		super.loadXML(stringSrc);
		
		if(stringSrc.onclick != undefined)		
		{
			// Note: it is imperitive that we precompile the script -
			//       Doing it on each invokation causes failures

			// this.onClickScript = D.parseProgram(stringSrc.onclick);
		}
	}
	
	/*
	*/
	public saveXML() : string
	{
		let propVector:string;
		
		return propVector;
	}	
	
//*************** Serialization
	
}
