//*********************************************************************************
//                                                                        
//         CARNEGIE MELLON UNIVERSITY PROPRIETARY INFORMATION             
//  
//  This software is supplied under the terms of a license agreement or   
//  nondisclosure agreement with Carnegie Mellon University and may not   
//  be copied or disclosed except in accordance with the terms of that   
//  agreement.    
//  
//   Copyright(c) 2013 Carnegie Mellon University. All Rights Reserved.   
//                                                                        
//  Author(s): Kevin Willows                                                           
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
import { CUtil } from "../util/CUtil";

import Event = createjs.Event;



export class CCacheEvent extends Event
{
	
	public static readonly READY:string 	= "READY";
	public static readonly ERROR:string 	= "ERROR";
	
	public collection:Array<any>;
	public query_id:string;

	
	constructor(type:string, _target:Array<any>, _id:string, bubbles:boolean = false, cancelable:boolean = false ) 
	{
		super(type, bubbles, cancelable);
		
		this.collection = _target;
		this.query_id   = _id;
	}
	

	/**	
	 * Creates and returns a copy of the current instance.	
	 * @return A copy of the current instance.		
	 */		
	public clone():Event		
	{
		CUtil.trace("cloning WOZEvent:");
		
		return new CCacheEvent(this.type, this.collection, this.query_id, this.bubbles, this.cancelable );		
	}
	
}	










