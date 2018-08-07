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

import { CSceneHistoryNode } from "./CSceneHistoryNode";

import { CSceneGraph } 		from "./CSceneGraph";
import { CSceneEdge } 		from "./CSceneEdge";
import { CSceneTrack }      from "./CSceneTrack";

import EventDispatcher 	  = createjs.EventDispatcher;



export class CSceneNode extends EventDispatcher
{
	protected tutorDoc:IEFTutorDoc;		
	protected _parent:CSceneGraph;
	
	protected _id:string;
	protected _name:string;
	protected _type:string;
	
	protected _edges:Array<any> = new Array;
			
	
	constructor(_tutorDoc:IEFTutorDoc, target:EventDispatcher=null)
	{
		super();
	
		this.tutorDoc = _tutorDoc;
	}
    
    
	protected nodeFactory(parent:CSceneGraph, id:string, nodefactory:any) : void
	{
		this._parent = parent;
		
		this._id    = id;			
		this._type  = nodefactory.type; 		
		this._name  = nodefactory.name;			
		
		for (let edge of nodefactory.edges)
		{
			this._edges.push(CSceneEdge.factory(this.tutorDoc, parent, edge));	
		}
	}
    
    
	public gotoNextTrack() : CSceneTrack
	{
		return null;
	}	
    
    
	public nextNode() : CSceneNode
	{
		let edge:CSceneEdge;
		let node:CSceneNode = null;		// When we run out of tracks we just want to stop

        this._parent.sceneInstance.$nodePreExit(this._id);			
		
		for (edge of this._edges)
		{
			if(edge.testConstraint())
			{
				node = edge.followEdge();
				
				if(node != null)
				{
                    node._parent.sceneInstance.$nodePreEnter(node._id);	
				}
				
				break;
			}
		}
		
		return node;
	}
	
		
	public seekToTrack(historyNode:CSceneHistoryNode) :any
	{
		
	}
    
    public get index() {
        return -1;
    }

	public applyNode() : boolean
	{
		return false;			
	}		
    
    
	public resetNode() : void
	{			
	}
}