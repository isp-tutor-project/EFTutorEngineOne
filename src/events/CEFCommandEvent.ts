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
//  File:      CEFCommandEvent.as
//                                                                        
//  Purpose:   CEFCommandEvent Base class implementation
//                                                                        
//  Author(s): ...                                                           
//  
// History: File Creation 3/19/2009 12:34 PM
//                                                                        
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//
//*********************************************************************************


//** Imports

import Event = createjs.Event;

import { CUtil } from "../util/CUtil";



export class CEFCommandEvent extends Event 
{
	public static readonly OBJCMD:string 	= "objcmd";		
	
	public objCmd:any;
	
	/**
	* Creates a new CEFCommandEvent instance. 
	*/
	constructor(type:string, _objCmd:any, bubbles:boolean=false, cancelable:boolean=false) 
	{ 
		super(type, bubbles, cancelable);
		
		this.objCmd = _objCmd;			
	} 
	
	public clone():Event 
	{ 
		return new CEFCommandEvent(this.type, this.objCmd, this.bubbles, this.cancelable);
	} 
	
}
