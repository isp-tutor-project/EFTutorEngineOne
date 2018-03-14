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
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//
//*********************************************************************************


//** imports

import { CAnimationNode } from "./CAnimationNode";
import { CAnimationGraph } from "./CAnimationGraph";
import { CEFRoot } from "../core/CEFRoot";

import EventDispatcher 	  = createjs.EventDispatcher;

import { CUtil } 			from "../util/CUtil";


export class CAnimationAction extends CAnimationNode
{
	private _cmd:string;
	private _code:string;
	
	
	constructor(target:EventDispatcher=null)
	{
		super(target);
	}
			
	/** 
	 * Note:  We can use this to construct a CModule object from CNode data or CModule data
	 * 			  
	 *		When moduleFactory is a "type":"node" the generated object is referenced directly from the graph 
		*   	When moduleFactory is a "type":"action" the generated object is a global referenced elsewhere 
		*      
		**/		
	public static factory(parent:CAnimationGraph, nodeName:string, moduleFactory:any) : CAnimationAction
	{			
		let node:CAnimationAction = new CAnimationAction;
		
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
				
				result = CEFRoot.gTutor.testFeatureSet(this._code);
				break
			
			case "exec":
				
				// result = D.eval(_code, _parent.sceneInstance);					
				break;
		}
		
		return result; 							
	}		
}
