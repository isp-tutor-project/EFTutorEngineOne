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

namespace TutorEngineOne {

//** Imports




export class CGraphEdge extends Object
{
	protected _parent:CSceneGraph;
			
	private _edgeConst:string;
	private _edgeNode:string;
	
	private _pid:string;			// GUID for stocastic object
	private _cycle:number;			// recycle distance for looping
	private _prob:Array<number>;	// Array of probabliities for given PID 
	
	
	constructor()
	{
		super();
	}				
	
	
	public static factory(parent:CSceneGraph, factory:any) : CGraphEdge
	{
		let edge:CGraphEdge = new CGraphEdge;			
		
		edge._parent = parent;
		
		edge._edgeConst = factory.constraint;
		edge._edgeNode  = factory.edge;
		
		// Handle Stocastic Constraints
		
		if(factory.$P != undefined)
		{				
			edge._pid   = factory.pid;
			edge._prob  = factory.$P.split('|');
			edge._cycle = Number(factory.cycle);
		}
		
		return edge;
	}

	
	/**
	 *	If it has a Stocastic constraint - check it
		*	Otherwise return true so the constraint itself is tested 
		*/
	public testPConstraint() : boolean
	{
		let result:boolean = true;			
		let iter;			
		let rand;
		
		if(this._pid != null)
		{
			iter = this._parent.queryPConstraint(this._pid, this._prob.length, this._cycle);			
			rand = Math.random();
			
			// It's important to be < not <= because if we have 0 prob we never want it to fire.
			
			result = (rand < this._prob[iter]);
		}
		
		return result; 
	}
	
	
	/**
	 * 
	 */ 
	public testConstraint() : boolean
	{
		// * default to pass - if there is a null constraint then we just pass and seek along that edge.
		
		let result:boolean = true;
		
		let constraint:CGraphConstraint = this._parent.findConstraintByName(this._edgeConst);			
					
		if(constraint != null)
			result = constraint.execute();
		
		return 	result;		 	
	}
	
	public followEdge() : CGraphNode
	{					
		return this._parent.findNodeByName(this._edgeNode);	 	
	}		
	
}
}	
