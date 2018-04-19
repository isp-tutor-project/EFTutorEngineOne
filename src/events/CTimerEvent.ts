//*********************************************************************************
//                                                                        
//         CARNEGIE MELLON UNIVERSITY PROPRIETARY INFORMATION             
//  
//  This software is supplied under the terms of a license agreement or   
//  nondisclosure agreement with Carnegie Mellon University and may not   
//  be copied or disclosed except in accordance with the terms of that   
//  agreement.    
//  
//   Copyright(c) 2011 Carnegie Mellon University. All Rights Reserved.   
//                                                                        
//  File:      CLogEvent.as
//                                                                        
//  Purpose:   CLogEvent object implementation
//                                                                        
//  Author(s): Kevin Willows                                                           
//  
//  History: File Creation Oct 28 2011  
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

import { CEFEvent } from "./CEFEvent";
import { CUtil } 	from "../util/CUtil";

import Event = createjs.Event;



export class CTimerEvent extends Event
{	
	// event types		
	public static readonly TIMER:string 		 = "timer";	
	public static readonly TIMER_COMPLETE:string = "timer_complete";	

	private traceMode:boolean = false;
	
	// Event Parms
	
	constructor(type:string = CTimerEvent.TIMER, bubbles:boolean = false, cancelable:boolean = false ) 
	{
		super(type, bubbles, cancelable);
	}

	/**	
	* Creates and returns a copy of the current instance.	
	* @return A copy of the current instance.		
	*/		
	public clone() : Event		
	{
		if(this.traceMode) CUtil.trace("cloning CTimerEvent:");
		
		return new CTimerEvent(this.type, this.bubbles, this.cancelable );		
	}
}