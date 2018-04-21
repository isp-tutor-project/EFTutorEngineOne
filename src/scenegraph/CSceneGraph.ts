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


//## imports

import { CGraphNode } 		from "./CGraphNode";
import { CGraphScene } 		from "./CGraphScene";
import { CEFObject } 		from "../core/CEFObject";
import { CEFNavigator } 	from "../core/CEFNavigator";
import { CGraphConstraint } from "./CGraphConstraint";
import { CEFRoot } 			from "../core/CEFRoot";
import { CBKTSkill } 		from "../bkt/CBKTSkill";
import { CGraphAction } 	from "./CGraphAction";
import { CGraphModule } 	from "./CGraphModule";
import { CGraphModuleGroup } from "./CGraphModuleGroup";

import { CUtil } 			from "../util/CUtil";


export class CSceneGraph extends CGraphNode
{		
	private _nodes:any       = {};		
	private _modules:any     = {};
	private _actions:any     = {};
	private _graphs:any      = {};
	private _constraints:any = {};
	private _skillSet:any	= {};

	private _currNode:CGraphNode;
	private _currScene:CGraphScene;
	private _prevScene:CGraphScene;

	private static _pFeatures:any    = {}; 
	private static _pConstraints:any = {}; 
	
	
	/**
	 * Creates a new CSceneGraphNavigator instance. 
	 */
	constructor()
	{
		super();		
	}

	
	public static factory(parent:CSceneGraph, id:string, factory:any) : CSceneGraph
	{			
		let scenegraph:CSceneGraph = new CSceneGraph;			
					
		scenegraph.parseNodes(factory);			
		scenegraph.parseConstraints(factory['CConstraints']);
		
		scenegraph.parseSkills(factory['CSkills']);
		
		return scenegraph;
	}
			

	//@@ TODO: need to support sub-graphs - currently only support module type nodes		
	//
	public captureGraph(obj:any) : Object
	{			
		// Capture the polymorphic node state
		
		obj['currNodeID'] = this._currNode.id;			
		obj['currNode']   = this._currNode.captureGraph({});
		
		return obj;
	}
	
	public restoreGraph(obj:any) : any
	{					
		this._currNode = this.findNodeByName(obj['currNodeID']);
		
		this._currScene = this._currNode.restoreGraph(obj['currNode']);
		this._prevScene = this._currScene;
		
		return this._currScene;
	}
	
	
	public sceneInstance() : CEFObject
	{
		let objInstance:CEFObject = null;
		
		//@@ mod Oct 1 2013 - "Catch" errors in this sequence
		//					  this is an attempt to isolate the Next button failure observed in the 
		//                    fall 2013 scitech trials
		
		try
		{
			// recover the scene instance
			//
			if(this._prevScene != null)
			{
				objInstance = CEFNavigator.TutAutomator[this._prevScene.scenename].instance as CEFObject;
			}
		}
		catch(err)
		{
			CUtil.trace("CSceneGraphNavigator.sceneInstance: " + err.toString());
			
			objInstance = null;
		}
		
		return objInstance;
	}		
	
	
	/**
	 * 	
	 */
	public queryPFeature(pid:string, size:number, cycle:number) : number
	{
		let iter:number = 0;
		
		// On subsequent accesses we increment the iteration count 
		// If it has surpassed the size of the pFeature array we cycle on the last 'cycle' entries
		
		if(CSceneGraph._pFeatures[pid] != undefined)
		{
			iter = CSceneGraph._pFeatures[pid] + 1;
			
			if(iter >= size)
			{
				iter = size - cycle;					
			}
			
			CSceneGraph._pFeatures[pid] = iter;
		}
			
			// On first touch we have to create the property
			
		else CSceneGraph._pFeatures[pid] = 0;
		
		return iter;
	}
	
	
	/**
	 * 	
	 */
	public queryPConstraint(pid:string, size:number, cycle:number) : number
	{
		let iter: number = 0;
		
		// On subsequent accesses we increment the iteration count 
		// If it has surpassed the size of the pFeature array we cycle on the last 'cycle' entries
		
		if(CSceneGraph._pConstraints[pid] != undefined)
		{
			iter = CSceneGraph._pConstraints[pid] + 1;
			
			if(iter >= size)
			{
				iter = size - cycle;					
			}
			
			CSceneGraph._pConstraints[pid] = iter;
		}
			
			// On first touch we have to create the property
			
		else CSceneGraph._pConstraints[pid] = 0;
		
		return iter;
	}
	
	
	public seekTo(nxtScene:string) : CGraphScene
	{
		return null;
	}

	
	public seekEnd() : CGraphScene
	{
		
		return null;
	}
	
	
	// For subgraphs this is how subnodes are invoked.
	// (sceneGraphs can be nodes in themselves) 
	//
	public applyNode() : boolean
	{			
		// Apply a node from a non-root-graph 
		
		return this._currNode.applyNode();	
	}
	
	
	public seekBack() : CGraphScene
	{
		
		return null;
	}

	
	public seekRoot() : void
	{
		this._currNode = this._nodes["root"];
	}
	
	// increments the currScene polymorphically
	// potentially called recursively if currNode is a subgraph.		
	//
	public nextScene() : CGraphScene
	{
		let nextNode:CGraphNode;
		
		if(this._currNode) do 
		{
			// Increment the scene polymorphically
			
			this._currScene = this._currNode.nextScene();
							
			if(this._currScene == null)
			{
				nextNode = this._currNode.nextNode();
				
				if(this._currNode == nextNode)
				{
					// If node increment failed then fall back to previous scene
										
					this._currScene = this._prevScene;
					
					this._currNode.seekToScene(this._currScene);
				}					
				else 
				{
					this._currNode = nextNode;
					
					// Apply action nodes
					
					if(this._currNode != null)
						this._currNode.applyNode();
				}
			}
			// Increment the iteration count - for logging 
			else
				this._currScene.incIteration();				
			
		}while((this._currScene == null) && (this._currNode != null))
			
		// Remember a context in which to do constraint testing for graph Node transitions.
		// i.e. the constraints are tested within the context of the last valid scene
			
		this._prevScene = this._currScene;	
			
		return this._currScene;				
	}
	
	
	//***** Private
	
	private parseNodes(_factory:any) : boolean
	{
		let nodeList:any = _factory.CNodes;
		
		// Note: this is not order garanteed 
		
		for(let name in nodeList) 
		{
			if(name != "COMMENT")				
				switch(nodeList[name].type)
				{
					case "action":					
						this._nodes[name] = CGraphAction.factory(this, name, _factory);
						break;
					
					case "module":					
						this._nodes[name] = CGraphModule.factory(this, name, nodeList[name], _factory);
						break;
					
					case "modulegroup":					
						this._nodes[name] = CGraphModuleGroup.factory(this, name, nodeList[name], _factory);
						break;
					
					case "subgraph":					
						//_nodes[name] = CSceneGraph.factory(this, name, _factory.CSubGraphs[nodeList[name].name]);
						break;
					
					case "external":					
						break;						
				}
		}			
		
		return true;
	}

	
	private parseConstraints(constFactory:any) : boolean
	{
		
		for(let name in constFactory) 
		{
			if(name != "COMMENT")
				this._constraints[name] = CGraphConstraint.factory(this, constFactory[name]);	
		}			
		
		return true;
	}
	
	
	
	public parseSkills(skillsFactory:any) : boolean
	{
		
		for(let name in skillsFactory) 
		{
			if(name != "COMMENT")
				this._skillSet[name] = CBKTSkill.factory(skillsFactory[name]);	
		}			
		
		// Make accessible globally
		
		CEFRoot.gTutor.ktSkills = this._skillSet;
		
		return true;
	}
	
	
	public findNodeByName(name:string) : CGraphNode
	{
		return this._nodes[name];
	}

	
	public findConstraintByName(name:string) : CGraphConstraint
	{
		return this._constraints[name];
	}

	
	public get node() : CGraphNode
	{
		return this._currNode;
	}
	
	public set node(newNode:CGraphNode) 
	{
		// If backtracking through a volatile history we need to reset
		// nodes so that if we revisit them they will increment their
		// this._currScene correctly
		
		if(this._currNode != newNode)
			this._currNode.resetNode();
		
		this._currNode = newNode;			
	}
	
	public set scene(seekScene:CGraphScene)
	{
		this._currNode.seekToScene(seekScene);			
	}
	
}