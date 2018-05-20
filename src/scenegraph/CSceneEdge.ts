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

import { IEFTutorDoc } 			from "../core/IEFTutorDoc";

import { CSceneGraph } 			from "./CSceneGraph";
import { CSceneConstraint } 	from "./CSceneConstraint";
import { CSceneNode } 			from "./CSceneNode";



export class CSceneEdge
{
	protected tutorDoc:IEFTutorDoc;		
	protected _parent:CSceneGraph;
	
	private _edgeConst:string;
	private _edgeNode:string;
	
	constructor(_tutorDoc:IEFTutorDoc)
	{
		this.tutorDoc = _tutorDoc;
	}			
	
	public static factory(_tutorDoc:IEFTutorDoc, parent:CSceneGraph, factory:any) : CSceneEdge
	{
		let edge:CSceneEdge = new CSceneEdge(_tutorDoc);			
		
		edge._parent = parent;
		
		edge._edgeConst = factory.constraint;
		edge._edgeNode  = factory.edge;
		
		return edge;
	}
	
	public testConstraint() : boolean
	{
		let result:boolean = true;
		
		let constraint:CSceneConstraint = this._parent.findConstraintByName(this._edgeConst);			
		
		if(constraint != null)
			result = constraint.execute();
		
		return 	result;		 	
	}
	
	public followEdge() : CSceneNode
	{					
		return this._parent.findNodeByName(this._edgeNode);	 	
	}		
}