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
//  File:      CEFButton.as
//                                                                        
//  Purpose:   CEFButton object implementation
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
//
//*********************************************************************************

import { CEFRoot }			from "./CEFRoot";
import { CEFObject }     	from "./CEFObject";
import { CEFMouseEvent }    from "../events/CEFMouseEvent";

import { CUtil } 			from "../util/CUtil";

import MovieClip     		  = createjs.MovieClip;
import DisplayObject 		  = createjs.DisplayObject;
import DisplayObjectContainer = createjs.Container;



export class CEFButton extends CEFObject
{
	//************ Stage Symbols
	
	public Sup:MovieClip;
	public Sover:MovieClip;
	public Sdown:MovieClip;
	public Sdisabled:MovieClip;
	public Sfocus:MovieClip;
	
	//************ Stage Symbols
	
	public curState:string   = "Sup";
	public fPressed:boolean  = false;
	public fEnabled:boolean  = true;
	public fOver:boolean     = false;

	private onClickScript:Object = null;
	
	constructor()
	{
		super();

		this.traceMode = false;
		if(this.traceMode) CUtil.trace("CEFButton:Constructor");
		
		this.gotoState("Sup");
		this.enableButton(true);
	}
	
	public Destructor() : void
	{
		this.removeEventListener(CEFMouseEvent.WOZCLICKED, this.doMouseClicked);
		this.removeEventListener(CEFMouseEvent.WOZOVER   , this.doMouseOver);
		this.removeEventListener(CEFMouseEvent.WOZOUT    , this.doMouseOut);
		this.removeEventListener(CEFMouseEvent.WOZDOWN   , this.doMouseDown);
		this.removeEventListener(CEFMouseEvent.WOZUP     , this.doMouseUp);			
		
		super.Destructor();
	}
	
	// Walk the WOZ Objects to capture their default state
	//
	public captureDefState(TutScene:Object ) : void 
	{
		super.captureDefState(TutScene );
	}
	
	
	// Walk the WOZ Objects to restore their default state
	//
	public restoreDefState(TutScene:Object ) : void 
	{
		if(this.traceMode) CUtil.trace("Button Reseting: " + name);
		
		this.curState = "unknown";
		this.fPressed = false;
		this.fEnabled = true;
		this.fOver    = false;
					
		this.enableButton(true);
		
		super.restoreDefState(TutScene );
	}
	

//*************** Logging state management
	
	public captureLogState(obj:Object = null) : Object
	{
		obj = super.captureLogState(obj);
		
		obj['target']  = 'button'; 
		obj['name']	   = name; 
		obj['state']   = this.curState; 
		obj['pressed'] = this.fPressed.toString(); 
		obj['enabled'] = this.fEnabled.toString(); 
		obj['over']    = this.fOver.toString();
		
		return obj;											   
	}				
	
	public capturestringState() : string
	{		
		let stringVal:string = "<button name={name} state={curState} pressed={fPressed.toString()} enabled={fEnabled.toString()} over={fOver.toString()}/>";
		
		return stringVal;
	}		

//*************** Logging state management

	public resetState() : void 
	{											
		this["Sup"].visible 	  = true;
		this["Sover"].visible 	  = false;
		this["Sdown"].visible 	  = false;		
		this["Sdisabled"].visible = false;		
		this["Sfocus"].visible    = false;		
	}


	public gotoState(sState:string) : void 
	{
		if(this.traceMode) CUtil.trace("CEFButton.gotoState: ", name + " " + sState);
		
		this.resetState();

		this.curState = sState;

		if(!this.fEnabled)
		{
			this["Sover"].visible = false;
			this["Sup"].visible   = false;				
			
			this["Sdisabled"].visible = true;
			this.fPressed = false;
		}
		
		else switch(sState)
		{
			case "Sdown":
				this["Sdown"].visible = true;
				this.fPressed     		 = true;
				
				break;
							
			case "Sup":
				if(this.fOver)
					this["Sover"].visible = true;
				else
					this["Sup"].visible = true;
					
					this.fPressed   = false;
				
				break;
			
			case "Sover":
				if(!this.fPressed)
					this["Sover"].visible = true;
				else
					this["Sdown"].visible = true;											
					
					this.fOver = true;	
				
				break;

			case "Sout":
				this["Sup"].visible = true;					
				
				this.fOver = false;	
				
				break;
		}
	}					

	
	public muteButton( bMute:boolean)
	{			
		// Mute button
		if(bMute)
		{
			if(this.traceMode) CUtil.trace("Button Muted: " + name);				
			
			this.removeEventListener(CEFMouseEvent.WOZCLICKED, this.doMouseClicked);
			this.removeEventListener(CEFMouseEvent.WOZOVER   , this.doMouseOver);
			this.removeEventListener(CEFMouseEvent.WOZOUT    , this.doMouseOut);
			this.removeEventListener(CEFMouseEvent.WOZDOWN   , this.doMouseDown);
			this.removeEventListener(CEFMouseEvent.WOZUP     , this.doMouseUp);			
		}
		
		// Unmute Button
		else
		{
			if(this.traceMode) CUtil.trace("Button UnMuted: " + name);				
			
			this.addEventListener(CEFMouseEvent.WOZCLICKED, this.doMouseClicked);
			this.addEventListener(CEFMouseEvent.WOZOVER   , this.doMouseOver);
			this.addEventListener(CEFMouseEvent.WOZOUT    , this.doMouseOut);
			this.addEventListener(CEFMouseEvent.WOZDOWN   , this.doMouseDown);
			this.addEventListener(CEFMouseEvent.WOZUP     , this.doMouseUp);
		}
		
	}
			
	
	public enableButton( bFlag:boolean)
	{			
		// set flag
		this.fEnabled = bFlag;
		
		//## Mod May 10 2014 - was changing state explicitly which is undesirable - 
		//                    Should just set enable flag and then force button update with curState
		
		// Disable button
		if(!bFlag)
		{
			if(this.traceMode) CUtil.trace("Button Disabled: " + name);				
			
			this.gotoState(this.curState);				

			// don't listen to the button
			this.muteButton(true);
		}
		
		// Enable button
		else
		{
			if(this.traceMode) CUtil.trace("Button Enabled: " + name);				
			
			this.gotoState(this.curState);				
			
			// Listen to the button 
			this.muteButton(false);
		}
		
	}
			

//***********  WOZ automatable event stream -

	public doMouseClicked(evt:CEFMouseEvent) : void 
	{				
		if(this.traceMode) CUtil.trace("dispatch WOZCLICK");
	
		this.dispatchEvent(new CEFMouseEvent("", CEFMouseEvent.WOZCLICK, true, false, evt.localX, evt.localY));
		
		//## Mod Apr 14 2014 - support declarative button actions from scenedescr.string <symbol>
		if(this.onClickScript != null)
			this.doClickAction(evt);
		
		//@@ Action Logging			
		let logData:Object = {'action':'button_click', 'targetid':name};
		
		this.gLogR.logActionEvent(logData);			
		//@@ Action Logging						
	}					

	protected doClickAction(evt:CEFMouseEvent) : void
	{
		try
		{
			// eval(onClickScript, parentScene);
		}
		catch(e)
		{
			CUtil.trace("Error in onClick script: " + this.onClickScript);
		}
	}
	
	public doMouseOver(evt:CEFMouseEvent) : void 
	{											
		this.gotoState("Sover");		
	}					

	public doMouseOut(evt:CEFMouseEvent) : void 
	{											
		this.gotoState("Sout");
	}					

	public doMouseDown(evt:CEFMouseEvent) : void 
	{											
		this.gotoState("Sdown");
	}					

	public doMouseUp(evt:CEFMouseEvent) : void 
	{					
		this.gotoState("Sup");
	}	
	
	public showButton(fShow:boolean) : void 
	{					
		// Show the button before testing it
		//
		super.visible = fShow;	
		
	}	
	
	public set visible(value:boolean)
	{
		// Show the button before testing it
		//
		super.visible = value;	
		
		// When a button comes on stage - update its state immediately
		//
		if(value)
		{
			if(this.traceMode) CUtil.trace("testing init state: " + name);
			
			// Let the button know that the mouse is over it
			//
			try 
			{
				if(CEFRoot.gTutor.cCursor.stateHelper(this))
				{
					if(this.traceMode) CUtil.trace("setting init state Over");
					this.doMouseOver(new CEFMouseEvent(".", CEFMouseEvent.WOZOVER));
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
