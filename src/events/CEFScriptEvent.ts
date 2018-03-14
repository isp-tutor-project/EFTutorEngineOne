//*********************************************************************************
//                                                                        
//         CARNEGIE MELLON UNIVERSITY PROPRIETARY INFORMATION             
//  
//  This software is supplied under the terms of a license agreement or   
//  nondisclosure agreement with Carnegie Mellon University and may not   
//  be copied or disclosed except in accordance with the terms of that   
//  agreement.    
//  
//   Copyright(c) 2010 Carnegie Mellon University. All Rights Reserved.   
//                                                                        
//  File:      CEFScriptEvent.as
//                                                                        
//  Purpose:   CEFScriptEvent object implementation
//                                                                        
//  Author(s): Kevin Willows                                                          
//  
//  History: File Creation 2/17/2010 2:45 PM 
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

import Event = createjs.Event;

import { CUtil } from "../util/CUtil";



/**
* To manage scripting packets originating from ActionTracks.
* 
* */
export class CEFScriptEvent extends Event 
{		
	public static readonly SCRIPT:string = "script";

	public script:any;	

	constructor(type:string, _script:any, bubbles:boolean=false, cancelable:boolean=false) 
	{ 
		super(type, bubbles, cancelable);
		
		this.script = _script;			
	} 
	
	public clone():Event 
	{ 
		return new CEFScriptEvent(this.type, this.script, this.bubbles, this.cancelable);
	} 
	
}
