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


import { IEFTutorDoc } 		from "../core/IEFTutorDoc";

import { TRoot } 			from "../thermite/TRoot";
import { TObject }			from "../thermite/TObject";

import { CEFEvent } 		from "../events/CEFEvent";


import { CONST }            from "../util/CONST";
import { CUtil } 			from "../util/CUtil";


import Tween 			  = createjs.Tween;
import Event 		  	  = createjs.Event;
import EventDispatcher 	  = createjs.EventDispatcher;



/**
* ...
*/
export class CEFTimeLine extends EventDispatcher
{
	//************ Stage Symbols
	
	
	//************ Stage Symbols

	public traceMode:boolean = false;

	public tutorDoc:IEFTutorDoc;		
	public tutorAutoObj:any;		
	
	public Running:Array<any> = new Array();			
	public started:number   = 0;
	public runCount:number  = 0;
	
	public xnFinalize:Function;
	
	/**
	 * Abstract base class providing object animation features
	 */
	constructor(_tutorDoc:IEFTutorDoc) 
	{
		super();

		this.traceMode    = true;					
		this.tutorDoc     = _tutorDoc;
		this.tutorAutoObj = _tutorDoc.TutAutomator;
	}
			

	/**
	 * 
	 */
	public startTransition(xnF:Function = null) : void
	{			
		if(this.traceMode) CUtil.trace("startTransition : " + this.runCount );
	
		let i1:number;

		this.xnFinalize = xnF;
	
		//## Mod Sept 26 2012 - Allow for null transitions - scenes with identical visual instances
		
		if(this.Running.length == 0)
		{
			this.xnCleanup();
		}
		
		// Setup the running array for the transition
		//
		for(let i1 = this.started ; i1 < this.Running.length ; i1++)
		{
			this.runCount++;
			this.Running[i1].addEventListener(CEFEvent.MOTION_FINISH, this.xnFinished );			
			this.Running[i1].start();			
		}
		
		// started allows multiple calls to startTran.. without duplicating starts - and inflating runCount 
		// doing multiple starts on a tween would cause runCount to never go back to 0
		
		this.started = this.runCount;
		
		if(this.traceMode) CUtil.trace("Transition Running: ", this.runCount );
	}				

	
	/**
	 * 
	 *## Mod Sept 26 2012 - Allow for null transitions - scenes with identical visual instances
		*/
	private xnCleanup() : void
	{			
		if(this.traceMode) CUtil.trace("xn Flush Queue ");
		
		this.stopTransitions();							// clear the Running array
		//				dispatchEvent(new Event(Event.COMPLETE));	// Tell anyone listening that we are done  @@ removed Nov 17 2008 duplicate of inFinished dispatch
		
		// invoke the Xition specific finalization 
		//
		if(this.xnFinalize != null)
			this.xnFinalize.call(this);
		
		// the interface is now in a new state - 
		
		this.tutorDoc.incStateID();				
	}					
	
			
	/**
	 * 
	 */
	public xnFinished(evt:CEFEvent ) : void
	{			
		if(this.traceMode) CUtil.trace("xnFinished : ", this.runCount, evt.currentTarget.obj, evt.currentTarget.obj.name , evt.currentTarget.prop);
	
		let targTwn:TObject = evt.currentTarget;
		let targObj:TObject = evt.currentTarget.obj;
		
		targTwn.stop();
		targTwn.removeEventListener(CEFEvent.MOTION_FINISH, this.xnFinished );			
		
		this.runCount--;
		
		// If it is completely transparent, make it invisible. 
		
		if(targObj.alpha == 0)
			targObj.visible = false;			
		
		// Tell whoever is listening that the scene is ready to run
		//
		if(!this.runCount)
		{
			//## Mod Sept 26 2012 - Allow for null transitions - scenes with identical visual instances
			
			this.xnCleanup();
		}				
	}					

	
	/**
	 * 
	 */
	public stopTransitions() : void
	{			
		if(this.traceMode) CUtil.trace("stop Transition" );

		let i1:number;
		let runtween:Tween;
	
		// Flush the Running Array
		//
		while(runtween = this.Running.pop())
		{
			runtween.removeEventListener(CEFEvent.MOTION_FINISH, this.xnFinished );			
			runtween.pause(runtween);			
		}
		
		this.runCount = 0;
		this.started  = 0;
	}				

}

