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

//** Imports

import { IEFTutorDoc } 		from "../core/IEFTutorDoc";

import { CTutorNode } 			from "./CTutorNode";
import { CTutorScene } 			from "./CTutorScene";
import { CTutorHistoryNode } 	from "./CTutorHistoryNode";


import { CUtil } 				from "../util/CUtil";



export class CTutorHistory extends Object
{
	protected tutorDoc:IEFTutorDoc;		

	private _history:Array<CTutorHistoryNode> = new Array();
	
	private _volatile:boolean = false;
	private _ndx:number;
	
	/**
	 * History may be non-volatile (non-revisionary - cannot be altered) or volatile (revisionary - can be altered)
	 * 
	 * In volatile history the stack is popped when going backwards.  This allows the 
	 * user to reevaluate node constraints when moving forward again.
	 * 
	 */
	constructor(_tutorDoc:IEFTutorDoc)
	{
		super();

		this.tutorDoc = _tutorDoc;
		this._ndx = 0;
	}			
	
	public push(node:CTutorNode, scene:CTutorScene) : void
	{
		// if nextScene was successful then add it to the stack
		
		if(scene != null)
		{
			this._history.push(new CTutorHistoryNode(node, scene));
			
			this._ndx = this._history.length;
		}
	}
	
	public next() : CTutorHistoryNode
	{
		let next:CTutorHistoryNode = null;
		
		if(this._ndx < this._history.length)
		{
			this._ndx = this._ndx + 1;
			
			next = this._history[this._ndx -1];
		}
		
		return next;
	}
	
	public back() : CTutorHistoryNode
	{
		let prev:CTutorHistoryNode = null;
		
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