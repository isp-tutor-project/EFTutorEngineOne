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

import { IEFTutorDoc }      from "./IEFTutorDoc";

import { CEFEvent }         from "../events/CEFEvent";

import { CONST }            from "../util/CONST";
import { CUtil } 			from "../util/CUtil";

import Ticker 		   = createjs.Ticker;
import EventDispatcher = createjs.EventDispatcher;




/**
*  Think of this as a framerate timer which may be paused.
* 
*  Provides support for pausing all Timers in the entire tutor
*/
export class CEFTimer extends EventDispatcher
{
	private traceMode:boolean = false;

    private _handler:Function;
    private _scope:Object;
    private _event:Object;
    public publicEvent:Object;

	private _time	     : number;
    private _repeatCount : number;

    private count       : number;
    private repeats     : number;
    private paused      : boolean;
    public  frameRate   : number;
    public  frame_ms    : number;
    
	private _tickHandler: Function | Object;
	
	// Create one EDFORGEObject through which we can listen for pause play commands
	//
	private static activeTimers:Array<CEFTimer> = new Array();
	private static tutorDoc:IEFTutorDoc;

	
	/**
	* Creates a new CEFTimerProxy instance. 
	*/
	constructor(time:number, repeatCount:number = 0)
	{
		super();

		this._time		  = time;
        this._repeatCount = repeatCount;

        this.count     = 0;
        this.repeats   = 0;
        this.paused    = true;
        this.frame_ms  = (1/Ticker.framerate) * 1000;
        this.frameRate = Ticker.framerate;
        this._handler  = null;
        this._event    = null;
	}
                

    public static startTimer(duration:number, callback:Function, scope:Object, event:Object) : CEFTimer {

        let timer:CEFTimer = new CEFTimer(duration);

        timer.publicEvent = event;

        timer._event   = event;
        timer._handler = callback
        timer._scope   = scope;
        timer.start();

        return timer;
    }


    private tick(evt:Event) {

        this.count += this.frame_ms;

        if(!this.paused && (this.count > this._time)) {

            this.count = 0;

            if(this._handler) {
                this._handler.call(this._scope, this._event, this);
            }
            else 
                this.dispatchEvent(new Event(CONST.TIMER));

            if(this._repeatCount > 0) {                

                this.repeats++;
                if(this.repeats >= this._repeatCount) {

                    Ticker.off(CEFEvent.ENTER_FRAME, this._tickHandler as Function);
                    
                    this.dispatchEvent(new Event(CONST.TIMER_COMPLETE));
                }
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
	 */
	public connectToTutor():void
	{
		if(CEFTimer.tutorDoc)
		{
			CEFTimer.tutorDoc.tutorContainer.on(CONST.EF_CANCEL,  this.cancelTimers, this);
			CEFTimer.tutorDoc.tutorContainer.on(CONST.EF_PAUSING, this.pauseTimers, this);
			CEFTimer.tutorDoc.tutorContainer.on(CONST.EF_PLAYING, this.playTimers, this);
			
			this.timerAddThis();			
        }        
	}

	/**
	 */
	public disConnectFromTutor():void
	{
		if(CEFTimer.tutorDoc)
		{
			CEFTimer.tutorDoc.tutorContainer.off(CONST.EF_CANCEL,  this.cancelTimers, this);
			CEFTimer.tutorDoc.tutorContainer.off(CONST.EF_PAUSING, this.pauseTimers, this);
			CEFTimer.tutorDoc.tutorContainer.off(CONST.EF_PLAYING, this.playTimers, this);
			
			this.timerRemoveThis();			
        }        
	}
    

	/**
	 */
	public start():void
	{
		if(this.traceMode) CUtil.trace(" Timer is starting");
		
        this.connectToTutor();

        this.paused = false;
		this._tickHandler = Ticker.on(CEFEvent.ENTER_FRAME, this.tick, this);
	}
	
	/**
	 */
	public stop():void
	{
		if(this.traceMode) CUtil.trace(" Timer is stopping");
		
        this.disConnectFromTutor();
        
        this.paused = true;
		Ticker.off(CEFEvent.ENTER_FRAME, this._tickHandler as Function);
	}
	
	/**
	 */
	public reset():void
	{
		if(this.traceMode) CUtil.trace("Timer is resetting");
        
        this.disConnectFromTutor();
        
        this.count   = 0;
        this.repeats = 0;
        this.paused  = true;

		Ticker.off(CEFEvent.ENTER_FRAME, this._tickHandler as Function);
    }	
    


    /**
	 * Proxy EDFORGE replay handler for FLVtimerBack control
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
	 * Proxy EDFORGE pause handler for FLVtimerBack control
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
	 * Proxy EDFORGE play handler for FLVPlayBack control
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
}
