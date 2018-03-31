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

import { CAnimationGraph } 	from "./CAnimationGraph";
import { CAnimationEdge } 	from "./CAnimationEdge";

import EventDispatcher 	  = createjs.EventDispatcher;


export class CAnimationNode extends EventDispatcher
{
	protected _parent:CAnimationGraph;
	
	protected _id:string;
	protected _name:string;
	protected _type:string;
	
	protected _edges:Array<any> = new Array;
			
	protected _preEnter:string;
	protected _preExit:string;
	
	
	constructor(target:EventDispatcher=null)
	{
		super();
	}
	
	protected nodeFactory(parent:CAnimationGraph, id:string, nodefactory:any) : void
	{
		this._parent = parent;
		
		this._id    = id;			
		this._type  = nodefactory.type; 		
		this._name  = nodefactory.name;			
	
		this._preEnter = nodefactory.preenter;
		this._preExit  = nodefactory.preexit;
		
		// We don't want these to fire if there is nothing in them
		if(this._preEnter == "") this._preEnter = null;
		if(this._preExit == "")  this._preExit = null;
		
		for (let edge of nodefactory.edges)
		{
			this._edges.push(CAnimationEdge.factory(parent, edge));	
		}
	}
	
	public nextAnimation() : string
	{
		return null;
	}	
	
	public nextNode() : CAnimationNode
	{
		let edge:CAnimationEdge;
		let node:CAnimationNode = null;		// When we run out of tracks we just want to stop

		if(this._preExit != null)
		{
			// D.eval(_preExit, _parent.sceneInstance);			
		}
		
		for (edge of this._edges)
		{
			if(edge.testConstraint())
			{
				node = edge.followEdge();
				
				if(node != null && node._preEnter != null)
				{
					// D.eval(node._preEnter, node._parent.sceneInstance);
				}
				
				break;
			}
		}
		
		return node;
	}
	
	
	// Used by Animation graph to init root animation
	
	public preEnter() : void
	{
		if(this._preEnter != null)
		{
			// D.eval(this._preEnter, this._parent.sceneInstance);
		}						
	}
	
	
	public seekToAnimation(seek:string) : string
	{
		return null;
	}
	
	public applyNode() : boolean
	{
		return false;			
	}		
	
	public resetNode() : void
	{			
	}
}