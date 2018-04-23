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

import { CEFRoot } 	   		from "./CEFRoot";
import { CEFTimerEvent } 	from "../events/CEFTimerEvent";

import { CTutorState }      from "../util/CTutorState";
import { CONST }            from "../util/CONST";
import { CUtil } 			from "../util/CUtil";

import EventDispatcher = createjs.EventDispatcher;



/**
* Provides support for pausing all Timers in the entire tutor
*/
export class CEFTimer extends EventDispatcher
{
	private traceMode:boolean = false;

	protected _delay	   : number;
	protected _repeatCount : number;
	
	// Create one wozObject through which we can listen for pause play commands
	//
	private static activeTimers:Array<CEFTimer> = new Array();

	
	/**
	* Creates a new CWOZTimerProxy instance. 
	*/
	constructor(delay:number, repeatCount:number = 0)
	{
		super();

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
			CEFTimer.activeTimers[0].stop();
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
			CEFTimer.activeTimers[i1].stop();
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
		
		if(CTutorState.gTutor)
		{
			CTutorState.gTutor.addEventListener(CONST.WOZCANCEL,  this.cancelTimers);
			CTutorState.gTutor.addEventListener(CONST.WOZPAUSING, this.pauseTimers);
			CTutorState.gTutor.addEventListener(CONST.WOZPLAYING, this.playTimers);
			
			this.timerAddThis();
			
			this.addEventListener(CEFTimerEvent.TIMER_COMPLETE, this.timerFinished);
		}
	}
	
	/**
	 */
	public timerFinished(evt:CEFTimerEvent) : void
	{
		this.timerRemoveThis();
		this.removeEventListener(CEFTimerEvent.TIMER_COMPLETE, this.timerFinished);
	}
	
	/**
	 */
	public stop():void
	{
		if(this.traceMode) CUtil.trace(" Timer is stopping");
		
		if (CTutorState.gTutor)
		{
			CTutorState.gTutor.removeEventListener(CONST.WOZCANCEL,  this.cancelTimers);
			CTutorState.gTutor.removeEventListener(CONST.WOZPAUSING, this.pauseTimers);
			CTutorState.gTutor.removeEventListener(CONST.WOZPLAYING, this.playTimers);
			
			this.timerRemoveThis();
			
			this.removeEventListener(CEFTimerEvent.TIMER_COMPLETE, this.timerFinished);
		}
	}
	
	
}
