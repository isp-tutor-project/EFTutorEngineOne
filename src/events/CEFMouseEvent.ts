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
//  File:      CEFMouseEvent.as
//                                                                        
//  Purpose:   CEFMouseEvent object implementation
//                                                                        
//  Author(s): Kevin Willows                                                           
//  
//  History: File Creation May 11 2008  
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


export class CEFMouseEvent extends CEFEvent
{		

	public localX:number;
	public localY:number;

	static readonly CLICK:string 		= "click";					// Click event from the button 
			
	static readonly WOZCLICK:string 	= "WOZMOUSE_CLICK";			// Click event from the button 
	static readonly WOZCLICKED:string 	= "WOZMOUSE_CLICKED";		// Click event from the Hardware mouse
	static readonly WOZDBLCLICK:string 	= "WOZMOUSE_DBLCLICKED";	// Click event from the Hardware mouse
	static readonly WOZMOVE:string 		= "WOZMOUSE_MOVE";
	static readonly WOZDOWN:string 		= "WOZMOUSE_DOWN";
	static readonly WOZUP:string 		= "WOZMOUSE_UP";
	static readonly WOZOVER:string 		= "WOZMOUSE_OVER";
	static readonly WOZOUT:string 		= "WOZMOUSE_OUT";
	static readonly WOZKEYDOWN:string 	= "WOZKEY_DOWN";
	static readonly WOZKEYUP:string		= "WOZMKEY_UP";
	static readonly WOZNULL:string		= "WOZNULL";

	constructor(TarObjID:string, Type:string, Bubbles:boolean = false, Cancelable:boolean = false, LocalX:number = 0, LocalY:number  = 0)
	{
		super(TarObjID, Type, Bubbles, Cancelable);
		
		this.localX   = LocalX;
		this.localY   = LocalY;
	}

	/**	
	* Creates and returns a copy of the current instance.	
	* @return A copy of the current instance.		
	*/		
	public clone():CEFMouseEvent		
	{
		CUtil.trace("cloning WOZEvent:");
		
		return new CEFMouseEvent(this.tarObjID, this.type, this.bubbles, this.cancelable, this.localX, this.localY);		
	}
	
	
}

