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

import { CSceneGraph } 	from "./CSceneGraph";
import { CGraphEdge } 	from "./CGraphEdge";
import { CGraphScene } 	from "./CGraphScene";

import { CEFRoot }		from "../core/CEFRoot";

import { CUtil } 			from "../util/CUtil";

import EventDispatcher 	  = createjs.EventDispatcher;


export class CGraphNode extends EventDispatcher
{
	protected _parent:CSceneGraph;
	
	protected _id:string;
	protected _name:string;
	protected _type:string;

	protected _edges:Array<any> = new Array;

	// Note: Graph pre Enter Exit execute within the context of the Navigator object
	//       They (Their code) cannot have "Scene object" dependencies as scene existence is not 
	//       guaranteed during execution.
	
	protected _preEnter:string;
	protected _preExit:string;
	

	constructor()
	{
		super();
	}			
	
	
	protected nodeFactory(parent:CSceneGraph, id:string, nodefactory:any) : void
	{
		this._parent = parent;
		
		this._id    = id;			
		this._type  = nodefactory.type; 		
		this._name  = nodefactory.name;			
	
		this._preEnter = nodefactory.preenter;
		this._preExit  = nodefactory.preexit;
		
		// We don't want these to fire if there is nothing in them
		//
		if(this._preEnter == "") this._preEnter = null;
		if(this._preExit == "")  this._preExit = null;
		
		for (let edge of nodefactory.edges)
		{
			this._edges.push(CGraphEdge.factory(parent, edge));	
		}
	}
			
	public get id() : string
	{
		return this._id;
	}
	
	public captureGraph(obj:Object) : Object
	{
		return obj;
	}
	
	public restoreGraph(obj:Object) : any
	{
		
	}
	
	public nextScene() : CGraphScene
	{
		return null;
	}	
	
	public nextNode() : CGraphNode
	{
		let edge:CGraphEdge;
		let node:CGraphNode = this;
		
		if(this._preExit != null)
		{
			// D.eval(this._preExit, CONST.Tutor.SnavPanel);			
		}
		
		for (let edge of this._edges)
		{
			// Note: Order is important - we don't want PConstraints tested unless the corresponding Constraint fires.
			
			if(edge.testConstraint() && edge.testPConstraint())
			{
				node = edge.followEdge();
				
				if(node != null && node._preEnter != null)
				{
					eval(node._preEnter);
				}
				
				break;
			}
		}
		
		// This is one way of terminating - If we get a nextNode request out of a node that has no heirs
		// then we return null to push a logTerminate packet
		// Terminate if there are no other nodes.
		
		if(this._edges.length == 0) 
						node = null;
		
		return node;
	}
	
	public applyNode() : boolean
	{
		return false;			
	}		
	
	public seekToScene(seekScene:CGraphScene) : CGraphScene
	{
		return null;
	}
	
	public seekToSceneByName(seekScene:string) : CGraphScene
	{
		return null;
	}
	
	public resetNode() : void
	{			
	}
}	
