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

import { CGraphNode } 	from "./CGraphNode";
import { CSceneGraph } 	from "./CSceneGraph";
import { CGraphScene } 	from "./CGraphScene";


export class CGraphAction extends CGraphNode
{
	private _cmnd:string;	
	private _parms:Array<string>;
	
	
	constructor()
	{
		super();
		
	}				
	
	public static factory(parent:CSceneGraph, id:string, factory:any) : CGraphAction
	{			
		let nodeFactoryData = factory.CNodes[id];
		
		let node:CGraphAction = new CGraphAction;

		// polymorphically Initialize the base type - add the edges
		
		node.nodeFactory(parent, id, nodeFactoryData);
		
		// extract the action command & parameters
		
		let actObject = factory.CActions[nodeFactoryData.name];			

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
	
	public nextScene() : CGraphScene
	{
		return null;
	}
	
	public applyNode() : boolean
	{
		
		return false;
	}		
}	
