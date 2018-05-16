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

import { CSceneGraph } 		from "./CSceneGraph";

import { TRoot } 			from "../thermite/TRoot";


import { CONST }            from "../util/CONST";
import { CUtil } 			from "../util/CUtil";



export class CSceneConstraint 
{
	protected tutorDoc:IEFTutorDoc;		
	protected _parent:CSceneGraph;
	
	private _cmd:string;
	private _code:string;
	
	constructor(_tutorDoc:IEFTutorDoc)
	{
		this.tutorDoc = _tutorDoc;
	}			
	

	public static factory(_tutorDoc:IEFTutorDoc, parent:CSceneGraph, factory:any) : CSceneConstraint
	{
		let node:CSceneConstraint = new CSceneConstraint(_tutorDoc);			
		
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
				
				result = this.tutorDoc.testFeatureSet(this._code);
									
				sresult = result? " :passed.":" :failed.";
				CUtil.trace("Animation Constraint: " + this._code + sresult);
				break
			
			case "exec":
				
				// result = D.eval(this._code, this._parent.sceneInstance);
				
				CUtil.trace("R0 Belief: " + this.tutorDoc.ktSkills['rule0'].queryBelief());
				break;
		}
		
		return result; 							
	}
	
}