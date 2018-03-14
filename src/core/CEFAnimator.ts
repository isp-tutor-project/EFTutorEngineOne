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
//  File:      CEFAnimator.as
//                                                                        
//  Purpose:   CEFAnimator object implementation
//                                                                        
//  Author(s): DefaultUser (Tools -> Custom Arguments...)                                                          
//  
//  History: File Creation 10/1/2008 9:20 AM 
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


import { CEFRoot } 			from "./CEFRoot";
import { CEFDoc } 			from "./CEFDoc";
import { CEFObject }		from "./CEFObject";

import { CUtil } 			from "../util/CUtil";
import { CEFEvent } 		from "../events/CEFEvent";

import Tween 				  = createjs.Tween;

/**
* ...
*/
export class CEFAnimator extends CEFRoot
{
	public Running:Array<any> = new Array();			
	public started:number   = 0;
	public runCount:number  = 0;
	
	public xnFinalize:Function;
	
	/**
	 * Abstract base class providing object animation features
	 */
	public CEFAnimator() 
	{
	}
	
	/**
	 * 
	 */
	public startTransition(xnF = null) : void
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
		
		CEFDoc.gApp.incStateID();				
	}					
	
			
	/**
	 * 
	 */
	public xnFinished(evt:CEFEvent ) : void
	{			
		if(this.traceMode) CUtil.trace("xnFinished : ", this.runCount, evt.currentTarget.obj, evt.currentTarget.obj.name , evt.currentTarget.prop);
	
		let targTwn:CEFObject = evt.currentTarget;
		let targObj:CEFObject = evt.currentTarget.obj;
		
		targTwn.stop();
		targTwn.removeEventListener(CEFEvent.MOTION_FINISH, this.xnFinished );			
		
		this.runCount--;
		
		// If it is comletely transparent, make it invisible. 
		
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

