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

import { CUtil } from "../util/CUtil";

import Event = createjs.Event;


	
export class CProgressEvent extends Event
{	
	private traceMode:boolean = false;

	// event types		
	
	public static readonly PROGRESS:string					= "progress";
	public static readonly STANDARD_ERROR_DATA:string		= "standardErrorData";
	public static readonly STANDARD_INPUT_PROGRESS:string	= "standardInputProgress";
	public static readonly STANDARD_OUTPUT_DATA:string		= "standardOutputData";		
	

	// Event Parms
	
	public loaded:number;
	public total:number;
	
	
	constructor(type:string = CProgressEvent.PROGRESS, _loaded:number = null, _total:number=null, bubbles:boolean = false, cancelable:boolean = false ) 
	{
		super(type, bubbles, cancelable);
		
		this.loaded = _loaded;
		this.total  = _total;
	}
	
	/**	
	 * Creates and returns a copy of the current instance.	
	 * @return A copy of the current instance.		
	 */		
	public clone():Event		
	{
		if(this.traceMode) CUtil.trace("cloning CProgressEvent:");
		
		return new CProgressEvent(this.type, this.loaded, this.total, this.bubbles, this.cancelable );		
	}
	
}
