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

import { CTutorGraph } 		from "./CTutorGraph";

import { TRoot } 			from "../thermite/TRoot";


import { CONST }            from "../util/CONST";
import { CUtil } 			from "../util/CUtil";



export class CTutorConstraint extends Object
{
	protected tutorDoc:IEFTutorDoc;		
	protected _parent:CTutorGraph;
	
	private _cmd:string;
	private _code:string;
			

	constructor(_tutorDoc:IEFTutorDoc)
	{
		super();

		this.tutorDoc = _tutorDoc;
	}				
	
	public static factory(_tutorDoc:IEFTutorDoc, parent:CTutorGraph, factory:any) : CTutorConstraint
	{
		let node:CTutorConstraint = new CTutorConstraint(_tutorDoc);			
		
		node._parent = parent;
		
		node._cmd  = factory.cmd;
		node._code = factory.code;
		
		return node;
	}
	
	public execute() : boolean
	{			
		let result:boolean = false;
		
		switch(this._cmd)
		{
			case "test":
				
				result = this.tutorDoc.testFeatureSet(this._code);
				
				//let sresult = result? " :passed.":" :failed.";					
				//trace("Graph Constraint: " + this._code + sresult);
				break
			
			case "exec":
				try
				{
					result = eval(this._code);
											
					//trace("R0 Belief: " + this._parent.sceneInstance().gTutor.ktSkills['rule0'].queryBelief());
				}
				catch(err)
				{
					CUtil.trace("CONST.execute: " + err.toString());
																
					result = false;
				}
				break;
		}
		
		return result; 							
	}
	
}	
