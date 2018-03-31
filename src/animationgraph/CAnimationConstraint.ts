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
	
import { CAnimationGraph } 	from "./CAnimationGraph";

import { CEFRoot } 			from "../core/CEFRoot";

import { CUtil } 			from "../util/CUtil";



export class CAnimationConstraint extends Object
{
	protected _parent:CAnimationGraph;
	
	private _cmd:string;
	private _code:string;
	
	constructor()
	{
		super();
	}
			
	public static factory(parent:CAnimationGraph, factory:any) : CAnimationConstraint
	{
		let node:CAnimationConstraint = new CAnimationConstraint;			
		
		node._parent = parent;
		
		node._cmd  = factory.cmd;
		node._code = factory.code;
		
		return node;
	}
	
	public execute() : boolean
	{			
		let result:boolean = false;
		let sresult:string = "";
		
		switch(this._cmd)
		{
			case "test":
				
				result = CEFRoot.gTutor.testFeatureSet(this._code);
									
				sresult = result? " :passed.":" :failed.";
				CUtil.trace("Animation Constraint: " + this._code + sresult);
				break
			
			case "exec":
				
				// result = D.eval(this._code, this._parent.sceneInstance);
				
				CUtil.trace("R0 Belief: " + CEFRoot.gTutor.ktSkills['rule0'].queryBelief());
				break;
		}
		
		return result; 							
	}
	
}