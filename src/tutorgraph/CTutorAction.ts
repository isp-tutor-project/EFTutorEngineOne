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

import { CTutorNode } 	from "./CTutorNode";
import { CTutorGraph } 	from "./CTutorGraph";
import { CTutorScene } 	from "./CTutorScene";


export class CTutorAction extends CTutorNode
{
	private _cmnd:string;	
	private _parms:Array<string>;
	
	
	constructor(_tutorDoc:IEFTutorDoc)
	{
		super(_tutorDoc);
	}				
	
	public static factory(_tutorDoc:IEFTutorDoc, parent:CTutorGraph, name:string, factory:any) : CTutorAction
	{			
		let nodeFactoryData = factory.CNodes[name];
		
		let node:CTutorAction = new CTutorAction(_tutorDoc);

		// polymorphically Initialize the base type - add the edges
		
		node.nodeFactory(parent, name, nodeFactoryData);
		
		// extract the action command & parameters
		
		let actObject = factory.CActions[nodeFactoryData.link];			

		node._cmnd  = actObject.cmd; 		
		node._parms = actObject.parms;
		
		return node;
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
	
	public applyNode() : boolean
	{
		
		return false;
	}		
}	
