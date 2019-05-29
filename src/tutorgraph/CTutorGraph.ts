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
 
import { CTutorNode } 		 from "./CTutorNode";
import { CTutorScene } 		 from "./CTutorScene";
import { CTutorConstraint }  from "./CTutorConstraint";
import { CTutorAction } 	 from "./CTutorAction";
import { CTutorModule } 	 from "./CTutorModule";
import { CTutorModuleGroup } from "./CTutorModuleGroup";

import { CEFNavigator } 	 from "../core/CEFNavigator";

import { CBKTSkill } 		 from "../bkt/CBKTSkill";

import { TObject } 			 from "../thermite/TObject";
import { TRoot } 			 from "../thermite/TRoot";


import { CONST }            from "../util/CONST";
import { CUtil } 			from "../util/CUtil";



export class CTutorGraph extends CTutorNode
{		
	private _nodes:any       = {};		
	private _modules:any     = {};
	private _actions:any     = {};
	private _graphs:any      = {};
	private _constraints:any = {};
	private _skillSet:any	= {};

	private _currNode:CTutorNode;
	private _currScene:CTutorScene;
	private _prevScene:CTutorScene;

	private _factory:any;
	private _pFeatures:any    = {}; 
	private _pConstraints:any = {}; 
	
	
	/**
	 * Creates a new CSceneGraphNavigator instance. 
	 */
	constructor(_tutorDoc:any, factory:any)
	{
		super(_tutorDoc);		

		this._factory = factory;
	}

	
	public static factory(_tutorDoc:any, parent:CTutorGraph, id:string, factory:any) : CTutorGraph
	{			
		let tutorgraph:CTutorGraph = new CTutorGraph(_tutorDoc, factory);			
					
		tutorgraph.parseNodes();			
		tutorgraph.parseConstraints();		
		tutorgraph.parseSkills();
		
		return tutorgraph;
	}
			

	//@@ TODO: need to support sub-graphs - currently only support module type nodes		
	//
	public captureGraph(obj:any) : Object
	{			
		// Capture the polymorphic node state
        //  TODO: Reconcile this with the node id  which to use??
        // 
		obj['currNodeID'] = this._currNode.name;			
		obj['currNode']   = this._currNode.captureGraph({});
        
        // e.g. {"currNodeID":"root","currNode":{"index":0}}

		return obj;
	}
	
	public restoreGraph(obj:any) : any
	{					
		this._currNode = this.findNodeByName(obj['currNodeID']);
		
		this._currScene = this._currNode.restoreGraph(obj['currNode']);
		this._prevScene = this._currScene;
		
		return this._currScene;
	}
	
	
	public sceneInstance() : TObject
	{
		let objInstance:TObject = null;
		
		//@@ mod Oct 1 2013 - "Catch" errors in this sequence
		//					  this is an attempt to isolate the Next button failure observed in the 
		//                    fall 2013 scitech trials
		
		try
		{
			// recover the scene instance
            //
            if(this._currScene) {

                objInstance = this.tutorDoc.TutAutomator[this._currScene.scenename]._instance as TObject;
            }
		}
		catch(err)
		{
			CUtil.trace("CONST.sceneInstance: " + err.toString());
			
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
		
		if(this._pFeatures[pid] != undefined)
		{
			iter = this._pFeatures[pid] + 1;
			
			if(iter >= size)
			{
				iter = size - cycle;					
			}
			
			this._pFeatures[pid] = iter;
		}
			
			// On first touch we have to create the property
			
		else this._pFeatures[pid] = 0;
		
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
		
		if(this._pConstraints[pid] != undefined)
		{
			iter = this._pConstraints[pid] + 1;
			
			if(iter >= size)
			{
				iter = size - cycle;					
			}
			
			this._pConstraints[pid] = iter;
		}
			
			// On first touch we have to create the property
			
		else this._pConstraints[pid] = 0;
		
		return iter;
	}
	
	
	public seekTo(nxtScene:string) : CTutorScene
	{
		return null;
	}

	
	public seekEnd() : CTutorScene
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
	
	
	public seekBack() : CTutorScene
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
	public nextScene() : CTutorScene
	{
		let nextNode:CTutorNode;
		
		if(this._currNode) do 
		{
			// Increment the scene polymorphically
			
			this._currScene = this._currNode.nextScene();
							
			if(this._currScene == null)
			{
				nextNode = this._currNode.nextNode();
				
                this._currNode = nextNode;
                
                // Apply action nodes
                
                if(this._currNode != null)
                    this._currNode.applyNode();
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
	
	private parseNodes() : boolean
	{
		let nodeList:any = this._factory.CNodes;
		
		// Note: this is not order garanteed 
		
		for(let name in nodeList) 
		{
			if(!(name.startsWith("COMMENT"))) {	

				CUtil.trace("TutorGraph - generating node: " + name);
				
				switch(nodeList[name].type)
				{
					case "action":					
						this._nodes[name] = CTutorAction.factory(this.tutorDoc, this, name, this._factory);
						break;
					
					case "module":					
						this._nodes[name] = CTutorModule.factory(this.tutorDoc, this, name, nodeList[name], this._factory);
						break;
					
					case "modulegroup":					
						this._nodes[name] = CTutorModuleGroup.factory(this.tutorDoc, this, name, nodeList[name], this._factory);
						break;
					
					case "subgraph":					
						//_nodes[name] = CSceneGraph.factory(this, name, this._factory.CSubGraphs[nodeList[name].link]);
						break;
					
					case "external":					
						break;						
                }
            }
		}			
		
		return true;
	}

	
	private parseConstraints() : boolean
	{		
		let constFactory:any = this._factory.CConstraints;
		
		for(let name in constFactory) 
		{
			if(!(name.startsWith("COMMENT")))		
				this._constraints[name] = CTutorConstraint.factory(this.tutorDoc, this, constFactory[name]);	
		}			
		
		return true;
	}
	
	
	public recoverSkills(recoveredSkills:any) : boolean {

		this._factory.CSkills = recoveredSkills;

		return this.parseSkills();
	}


	public parseSkills() : boolean {

		let skillsFactory:any = this._factory.CSkills;
		
		for(let name in skillsFactory) 
		{
			if(!(name.startsWith("COMMENT")))		
				this._skillSet[name] = CBKTSkill.factory(this.tutorDoc, skillsFactory[name]);	
		}			
		
		// Make accessible globally
		
		this.tutorDoc.ktSkills = this._skillSet;
		
		return true;
	}
	
	
	public findNodeByName(name:string) : CTutorNode
	{
		return this._nodes[name];
	}

	
	public findConstraintByName(name:string) : CTutorConstraint
	{
		return this._constraints[name];
	}

	
	public get node() : CTutorNode
	{
		return this._currNode;
	}
	
	public set node(newNode:CTutorNode) 
	{
		// If backtracking through a volatile history we need to reset
		// nodes so that if we revisit them they will increment their
		// this._currScene correctly
		
		if(this._currNode != newNode)
			this._currNode.resetNode();
		
		this._currNode = newNode;			
	}
	
	public set scene(seekScene:CTutorScene)
	{
		this._currScene = this._currNode.seekToScene(seekScene);			
	}
	
}