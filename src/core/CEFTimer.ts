﻿//*********************************************************************************
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
//  File:      CWOZTimerProxy.as
//                                                                        
//  Purpose:   CWOZTimerProxy Base class implementation
//                                                                        
//  Author(s): Kevin Willows                                                           
//  
// History: File Creation 10/14/2008 10:08 AM
//                                                                        
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//
//*********************************************************************************


//** Imports

import { CUtil } from "../util/CUtil";
import { CEFRoot } from "./CEFRoot";



/**
* Provides support for pausing all Timers in the entire tutor
*/
export class CEFTimer 
{
	private traceMode:boolean = false;

	protected _delay	   : number;
	protected _repeatCount : number;
	
	// Create one wozObject through which we can listen for pause play commands
	//
	static private activeTimers:Array<CEFTimer> = new Array();

	
	/**
	* Creates a new CWOZTimerProxy instance. 
	*/
	constructor(delay:number, repeatCount:number = 0)
	{
		this._delay		  = delay;
		this._repeatCount = repeatCount;

	}
				
	/**
	 * Proxy WOZ replay handler for FLVtimerBack control
	 * @param	evt
	 */
	public cancelTimers(evt:Event) : void
	{
		if(this.traceMode) CUtil.trace(" cancelTimers : " + CEFTimer.activeTimers.length);		
		
		var tCount:number = CEFTimer.activeTimers.length;
		
		// Stop the flash timers themselves (i.e. super)
		for (var i1:number = 0 ; i1 < tCount ; i1++)
		{
			CEFTimer.activeTimers[0].superStop();
			CEFTimer.activeTimers.pop();				
		}
	}
	
	/**
	 * Proxy WOZ pause handler for FLVtimerBack control
	 * @param	evt
	 */
	public pauseTimers(evt:Event) : void
	{
		if(this.traceMode) CUtil.trace(" pauseTimers : " + CEFTimer.activeTimers.length);		
		
		// Stop the flash timers themselves (i.e. super)
		for (var i1:number = 0 ; i1 < CEFTimer.activeTimers.length ; i1++)
		{
			CEFTimer.activeTimers[i1].superStop();
		}
	}
	
	/**
	 * Proxy WOZ play handler for FLVPlayBack control
	 * @param	evt
	 */
	public playTimers(evt:Event) : void
	{
		if(this.traceMode) CUtil.trace(" playTimers : " + CEFTimer.activeTimers.length);		
		
		// Start the flash timers themselves (i.e. super)
		for (var i1:number = 0 ; i1 < CEFTimer.activeTimers.length ; i1++)
		{
			CEFTimer.activeTimers[i1].start();
		}
	}

	
	/**
	 * Manage the array of Timers
	 *  
	 */
	public timerRemoveThis():void 
	{
		if(this.traceMode) CUtil.trace(" timerRemoveThis : ");		
		
		for (var i1:number = 0 ; i1 < CEFTimer.activeTimers.length ; i1++)
		{
			if (CEFTimer.activeTimers[i1] == this)
			{
				CEFTimer.activeTimers.splice(i1, 1);
				break;
			}
		}
	}

	/**
	 * Manage the array of CEFTimer.activeTimers movieclips
	 * 
	 */
	public timerAddThis():void 
	{
		if(this.traceMode) CUtil.trace(" timerAddThis : ");		
		
		var fAdd:boolean = true;
		
		for (var i1:number = 0 ; i1 < CEFTimer.activeTimers.length ; i1++)
		{
			if (CEFTimer.activeTimers[i1] == this)
			{
				fAdd = false;
				break;
			}
		}
		
		if (fAdd)
			CEFTimer.activeTimers.push(this);
	}

	/**
	 */
	public reset():void
	{
		if(this.traceMode) CUtil.trace(" is resetting");
		
		this.timerRemoveThis();
	}	
	
	/**
	 */
	public start():void
	{
		if(this.traceMode) CUtil.trace(" Timer is starting");
		
		if(CEFRoot.gTutor)
		{
			CEFRoot.gTutor.addEventListener(CWOZRoot.WOZCANCEL,  this.cancelTimers);
			CEFRoot.gTutor.addEventListener(CWOZRoot.WOZPAUSING, this.pauseTimers);
			CEFRoot.gTutor.addEventListener(CWOZRoot.WOZPLAYING, this.playTimers);
			
			this.timerAddThis();
			
			addEventListener(TimerEvent.TIMER_COMPLETE, this.timerFinished);
		}
	}
	
	/**
	 */
	public timerFinished(evt:TimerEvent) : void
	{
		this.timerRemoveThis();
		removeEventListener(TimerEvent.TIMER_COMPLETE, this.timerFinished);
	}
	
	/**
	 */
	public stop():void
	{
		if(this.traceMode) CUtil.trace(" Timer is stopping");
		
		if (CEFRoot.gTutor)
		{
			CEFRoot.gTutor.removeEventListener(CWOZRoot.WOZCANCEL,  this.cancelTimers);
			CEFRoot.gTutor.removeEventListener(CWOZRoot.WOZPAUSING, this.pauseTimers);
			CEFRoot.gTutor.removeEventListener(CWOZRoot.WOZPLAYING, this.playTimers);
			
			this.timerRemoveThis();
			
			removeEventListener(TimerEvent.TIMER_COMPLETE, this.timerFinished);
		}
	}
	
	
}
