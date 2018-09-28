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

import { CTutorGraph } 		from "./CTutorGraph";
import { CTutorEdge } 		from "./CTutorEdge";
import { CTutorScene } 		from "./CTutorScene";

import { TRoot }			from "../thermite/TRoot";

import { CUtil } 			from "../util/CUtil";

import EventDispatcher 	  = createjs.EventDispatcher;


export class CTutorNode extends EventDispatcher
{
	protected tutorDoc:IEFTutorDoc;		
	protected _parent:CTutorGraph;
	
	protected _id:string;
	protected _name:string;
	protected _type:string;

	protected _edges:Array<any> = new Array;

	// Note: Graph pre Enter Exit execute within the context of the Navigator object
	//       They (Their code) cannot have "Scene object" dependencies as scene existence is not 
	//       guaranteed during execution.
	
	protected _preEnter:string;
	protected _preExit:string;
	

	constructor(_tutorDoc:IEFTutorDoc)
	{
		super();

		this.tutorDoc = _tutorDoc;
	}			
	
	
	protected nodeFactory(parent:CTutorGraph, nodeName:string, nodefactory:any) : void
	{
		this._parent = parent;
		
		this._id    = nodefactory.id;			
		this._type  = nodefactory.type; 		
		this._name  = nodeName;			
	
		this._preEnter = nodefactory.preenter;
		this._preExit  = nodefactory.preexit;
		
		// We don't want these to fire if there is nothing in them
		//
		if(this._preEnter == "") this._preEnter = null;
		if(this._preExit == "")  this._preExit = null;
		
		for (let edge of nodefactory.edges)
		{
			this._edges.push(CTutorEdge.factory(this.tutorDoc, parent, this, edge));	
		}
	}
			
	public get id() : string
	{
		return this._id;
	}
	
	public get name() : string
	{
		return this._name;
	}
	
	public captureGraph(obj:Object) : Object
	{
		return obj;
	}
	
	public restoreGraph(obj:Object) : any
	{
		
	}
	
	public nextScene() : CTutorScene
	{
		return null;
	}	
	
	public nextNode() : CTutorNode
	{
		let edge:CTutorEdge;
		let node:CTutorNode = this;
		
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
	
	public seekToScene(seekScene:CTutorScene) : CTutorScene
	{
		return null;
	}
	
	public seekToSceneByName(seekScene:string) : CTutorScene
	{
		return null;
	}
	
	public resetNode() : void
	{			
	}
}	
