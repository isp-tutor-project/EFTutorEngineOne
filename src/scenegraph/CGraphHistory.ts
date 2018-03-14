//*********************************************************************************
//                                                                        
//         CARNEGIE MELLON UNIVERSITY PROPRIETARY INFORMATION             
//  
//  This software is supplied under the terms of a license agreement or   
//  nondisclosure agreement with Carnegie Mellon University and may not   
//  be copied or disclosed except in accordance with the terms of that   
//  agreement.    
//  
//  Copyright(c) 2013 Carnegie Mellon University. All Rights Reserved.   
//                                                                        
//  Author(s): Kevin Willows                                                           
//  
//  History: File Creation 07/18/2013 
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

import { CGraphNode } 			from "./CGraphNode";
import { CGraphScene } 			from "./CGraphScene";
import { CGraphHistoryNode } 	from "./CGraphHistoryNode";


export class CGraphHistory extends Object
{
	private _history:Array<CGraphHistoryNode> = new Array();
	
	private _volatile:boolean = false;
	private _ndx:number;
	
	/**
	 * History may be non-volatile (non-revisionary - cannot be altered) or volatile (revisionary - can be altered)
	 * 
	 * In volatile history the stack is popped when going backwards.  This allows the 
	 * user to reevaluate node constraints when moving forward again.
	 * 
	 */
	constructor()
	{
		super();
		
		this._ndx = 0;
	}
	
	public push(node:CGraphNode, scene:CGraphScene) : void
	{
		// if nextScene was successful then add it to the stack
		
		if(scene != null)
		{
			this._history.push(new CGraphHistoryNode(node, scene));
			
			this._ndx = this._history.length;
		}
	}
	
	public next() : CGraphHistoryNode
	{
		let next:CGraphHistoryNode = null;
		
		if(this._ndx < this._history.length)
		{
			this._ndx = this._ndx + 1;
			
			next = this._history[this._ndx -1];
		}
		
		return next;
	}
	
	public back() : CGraphHistoryNode
	{
		let prev:CGraphHistoryNode = null;
		
		if(this._ndx > 1)
		{
			this._ndx = this._ndx - 1;
			
			// Note: when we are working on a scene it is already on the stack
			// so if we are going backwards with a volatile history we need to 
			// pop what we are currently working on and return the scene before it.
			
			if(this._volatile)
				this._history.pop();
			
			prev = this._history[this._ndx -1];
		}
		
		return prev;
	}
	
	public set volatile(newState:boolean)
	{
		this._volatile = newState;
	}
	
	public get isVolatile() : boolean
	{
		return this._volatile;
	}
	
}