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


//** imports

import { IEFTutorDoc } 		from "../core/IEFTutorDoc";

import { CAnimationNode } 	from "./CAnimationNode";
import { CAnimationGraph } 	from "./CAnimationGraph";
import { TRoot } 			from "../thermite/TRoot";

import EventDispatcher 	  = createjs.EventDispatcher;


import { CONST }            from "../util/CONST";
import { CUtil } 			from "../util/CUtil";


export class CAnimationAction extends CAnimationNode
{
	private _cmd:string;
	private _code:string;
	
	
	constructor(_tutorDoc:IEFTutorDoc, target:EventDispatcher=null)
	{
		super(_tutorDoc, target);
	}
			
	/** 
	 * Note:  We can use this to construct a CModule object from CNode data or CModule data
	 * 			  
	 *		When moduleFactory is a "type":"node" the generated object is referenced directly from the graph 
		*   	When moduleFactory is a "type":"action" the generated object is a global referenced elsewhere 
		*      
		**/		
	public static factory(_tutorDoc:IEFTutorDoc, parent:CAnimationGraph, nodeName:string, moduleFactory:any) : CAnimationAction
	{			
		let node:CAnimationAction = new CAnimationAction(_tutorDoc);
		
		// If this is a CNode spec then extract the CNode info - e.g. edges etc. 
		
		if(moduleFactory.type == "node")
		{
			node.nodeFactory(parent, nodeName, moduleFactory);
			
			// change the factory to the module referenced by the node
			
			moduleFactory = parent._graphFactory.CActions[node._name];
		}
		
		// extract the action command & parameters
		
		node._cmd  = moduleFactory.cmd; 		
		node._code = moduleFactory.code;
		
		return node;
	}
	
	
	public nextAnimation() : string
	{
		return null;
	}
	
	
	public applyNode() : boolean
	{
		let result:boolean = false;
		
		switch(this._cmd)
		{
			case "test":
				
				result = this.tutorDoc.testFeatureSet(this._code);
				break
			
			case "exec":
				
				// result = D.eval(_code, _parent.sceneInstance);					
				break;
		}
		
		return result; 							
	}		
}
