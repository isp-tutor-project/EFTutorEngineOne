﻿//*********************************************************************************
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
//  File:      CTextEvent.as
//                                                                        
//  Purpose:   CTextEvent object implementation
//                                                                        
//  Author(s): Kevin Willows                                                           
//  
//  History: File Creation Oct 27 2011  
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



export class CTextEvent extends Event
{			
	public static readonly COMPLETE:string 	= "dnscomplete";
	public static readonly FAILED:string 	= "dnsfailed";
	
	public text:string;
			
	constructor(type:string = CTextEvent.COMPLETE, _text:string = null, bubbles:boolean = false, cancelable:boolean = false )
	{
		super(type, bubbles, cancelable);
		
		this.text = _text;
	}

	/**	
	* Creates and returns a copy of the current instance.	
	* @return A copy of the current instance.		
	*/		
	public clone():Event		
	{
		CUtil.trace("cloning CTextEvent:");
		
		return new CTextEvent(this.type, this.text, this.bubbles, this.cancelable );		
	}
	
}