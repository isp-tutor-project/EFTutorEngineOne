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


import { IEFTutorDoc } 		from "./IEFTutorDoc";

import { TRoot } 			from "../thermite/TRoot";
import { TObject }			from "../thermite/TObject";

import { CEFEvent } 		from "../events/CEFEvent";


import { CONST }            from "../util/CONST";
import { CUtil } 			from "../util/CUtil";


import Tween 			  = createjs.Tween;
import Event 		  	  = createjs.Event;
import Timeline 	      = createjs.Timeline;


/**
* ...
*/
export class CEFTimeLine extends Timeline
{
	//************ Stage Symbols
	
	
	//************ Stage Symbols

	public traceMode:boolean = false;

	public tutorDoc:IEFTutorDoc;		
	public tutorContainer:any;		
	public tutorAutoObj:any;		
	
	public targets:Array<any>;				
	public xnFinalize:Function;
	public xnScope:any;

	// random quick fix
	public _tweens: any;

	/**
	 * Abstract base class providing object animation features
	 */
	constructor(tweens: Tween[], labels: Object, props: Object, _tutorDoc:IEFTutorDoc) 
	{
		super(tweens, labels, props);

		this.traceMode      = true;					
		this.tutorDoc       = _tutorDoc;
		this.tutorContainer = _tutorDoc.tutorContainer;
		this.tutorAutoObj   = _tutorDoc.TutAutomator;

		this.targets = new Array();
	}
			
	public addTween(...tween:Tween[]) : Tween {

        let result:Tween;

        result = super.addTween(...tween);

        tween.forEach( tween => this.targets.push(tween.target));
        
        return result;
	}

	/**
	 * 
	 */
	public startTransition(xnF:Function = null, scope:any) : void
	{			
		if(this.traceMode) CUtil.trace("startTransition : ");
	
        this.xnFinalize = xnF;
        this.xnScope    = scope;
		
		// Setup the running array for the transition
		//
		this.on(CEFEvent.CHANGE, this.xnChanged, this );			
		this.gotoAndPlay(0);			
			
		if(this.traceMode) CUtil.trace("Transition Running: " );
	}				


	public stopTransitions() : void {

		this.setPaused(true);

		while(this._tweens.length != 0) 
			this.removeTween(this._tweens[0]);
	}


	// NB: This uses the older CreateJS Tween model not 1.0
	// 
	public xnChanged(evt:CEFEvent) {

		if(this.traceMode) CUtil.trace("xnChanged : ");

		if(this.position >= this.duration) {
			evt.remove();
			this.xnFinished();
		}
	}


	/**
	 * 
	 */
	public xnFinished() : void
	{			
		if(this.traceMode) CUtil.trace("xnFinished : ");
		
		this.stopTransitions();
		
		// If any target becomes completely transparent, make it invisible. 
		//
		for(let tar of this.targets) {

			// if(tar.alpha == 0)
			// 	tar.visible = false;			
		}		
		this.targets = new Array();
		
		// invoke the Xition specific finalization 
		//
		if(this.xnFinalize != null)
			this.xnFinalize.call(this.xnScope);
		
		// the interface is now in a new state - 
		
		this.tutorDoc.incStateID();				
	}					

}

