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
//  Author(s): Kevin Willows                                                           
//  
//  History: File Creation 07/18/2013 
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


//## imports

import { CGraphNode } from "./CGraphNode";

import { CUtil } 			from "../util/CUtil";


export class CSceneGraph extends CGraphNode
{		
	private _nodes:Object       = new Object;		
	private _modules:Object     = new Object;
	private _actions:Object     = new Object;
	private _graphs:Object      = new Object;
	private _constraints:Object = new Object;
	private _skillSet:Object	= new Object;

	private _currNode:CGraphNode;
	private _currScene:CGraphScene;
	private _prevScene:CGraphScene;

	private static _pFeatures:Object    = new Object; 
	private static _pConstraints:Object = new Object; 
	
	
	/**
	 * Creates a new CSceneGraphNavigator instance. 
	 */
	constructor()
	{
		super();		
	}

	
	public static factory(parent:CSceneGraph, id:string, factory:Object) : CSceneGraph
	{			
		let scenegraph:CSceneGraph = new CSceneGraph;			
					
		scenegraph.parseNodes(factory);			
		scenegraph.parseConstraints(factory['CConstraints']);
		
		scenegraph.parseSkills(factory['CSkills']);
		
		return scenegraph;
	}
			

	//@@ TODO: need to support sub-graphs - currently only support module type nodes		
	//
	public captureGraph(obj:Object) : Object
	{			
		// Capture the polymorphic node state
		
		obj['currNodeID'] = _currNode.id;			
		obj['currNode']   = _currNode.captureGraph(new Object);
		
		return obj;
	}
	
	public restoreGraph(obj:Object) : *
	{					
		_currNode = findNodeByName(obj['currNodeID']);
		
		_currScene = _currNode.restoreGraph(obj['currNode']);
		_prevScene = _currScene;
		
		return _currScene;
	}
	
	
	public sceneInstance() : CWOZObject
	{
		let objInstance:CWOZObject = null;
		
		//@@ mod Oct 1 2013 - "Catch" errors in this sequence
		//					  this is an attempt to isolate the Next button failure observed in the 
		//                    fall 2013 scitech trials
		
		try
		{
			// recover the scene instance
			//
			if(_prevScene != null)
			{
				objInstance = CWOZNavigator.TutAutomator[_prevScene.scenename].instance as CWOZObject;
			}
		}
		catch(err:Error)
		{
			trace("CSceneGraphNavigator.sceneInstance: " + err.toString());
			
			objInstance = null;
		}
		
		return objInstance;
	}		
	
	
	/**
	 * 	
	 */
	public queryPFeature(pid, size, cycle) : int
	{
		let iter:int = 0;
		
		// On subsequent accesses we increment the iteration count 
		// If it has surpassed the size of the pFeature array we cycle on the last 'cycle' entries
		
		if(_pFeatures[pid] != undefined)
		{
			iter = _pFeatures[pid] + 1;
			
			if(iter >= size)
			{
				iter = size - cycle;					
			}
			
			_pFeatures[pid] = iter;
		}
			
			// On first touch we have to create the property
			
		else _pFeatures[pid] = 0;
		
		return iter;
	}
	
	
	/**
	 * 	
	 */
	public queryPConstraint(pid, size, cycle) : int
	{
		let iter:int = 0;
		
		// On subsequent accesses we increment the iteration count 
		// If it has surpassed the size of the pFeature array we cycle on the last 'cycle' entries
		
		if(_pConstraints[pid] != undefined)
		{
			iter = _pConstraints[pid] + 1;
			
			if(iter >= size)
			{
				iter = size - cycle;					
			}
			
			_pConstraints[pid] = iter;
		}
			
			// On first touch we have to create the property
			
		else _pConstraints[pid] = 0;
		
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
		
		return _currNode.applyNode();	
	}
	
	
	public seekBack() : CGraphScene
	{
		
		return null;
	}

	
	public seekRoot() : void
	{
		_currNode = _nodes["root"];
	}
	
	// increments the currScene polymorphically
	// potentially called recursively if currNode is a subgraph.		
	//
	public nextScene() : CGraphScene
	{
		let nextNode:CGraphNode;
		
		if(_currNode) do 
		{
			// Increment the scene polymorphically
			
			_currScene = _currNode.nextScene();
							
			if(_currScene == null)
			{
				nextNode = _currNode.nextNode();
				
				if(_currNode == nextNode)
				{
					// If node increment failed then fall back to previous scene
										
					_currScene = _prevScene;
					
					_currNode.seekToScene(_currScene);
				}					
				else 
				{
					_currNode = nextNode;
					
					// Apply action nodes
					
					if(_currNode != null)
						_currNode.applyNode();
				}
			}
			// Increment the iteration count - for logging 
			else
				_currScene.incIteration();				
			
		}while((_currScene == null) && (_currNode != null))
			
		// Remember a context in which to do constraint testing for graph Node transitions.
		// i.e. the constraints are tested within the context of the last valid scene
			
		_prevScene = _currScene;	
			
		return _currScene;				
	}
	
	
	//***** Private
	
	private parseNodes(_factory:Object) : boolean
	{
		let nodeList:Object = _factory.CNodes;
		
		// Note: this is not order garanteed 
		
		for(let name:string in nodeList) 
		{
			if(name != "COMMENT")				
				switch(nodeList[name].type)
				{
					case "action":					
						_nodes[name] = CGraphAction.factory(this, name, _factory);
						break;
					
					case "module":					
						_nodes[name] = CGraphModule.factory(this, name, nodeList[name], _factory);
						break;
					
					case "modulegroup":					
						_nodes[name] = CGraphModuleGroup.factory(this, name, nodeList[name], _factory);
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

	
	private parseConstraints(constFactory:Object) : boolean
	{
		
		for(let name:string in constFactory) 
		{
			if(name != "COMMENT")
				_constraints[name] = CGraphConstraint.factory(this, constFactory[name]);	
		}			
		
		return true;
	}
	
	
	
	public parseSkills(skillsFactory:Object) : boolean
	{
		
		for(let name:string in skillsFactory) 
		{
			if(name != "COMMENT")
				_skillSet[name] = CBKTSkill.factory(skillsFactory[name]);	
		}			
		
		// Make accessible globally
		
		CWOZRoot.Tutor.ktSkills = _skillSet;
		
		return true;
	}
	
	
	public findNodeByName(name:string) : CGraphNode
	{
		return _nodes[name];
	}

	
	public findConstraintByName(name:string) : CGraphConstraint
	{
		return _constraints[name];
	}

	
	public get node() : CGraphNode
	{
		return _currNode;
	}
	
	public set node(newNode:CGraphNode) : void 
	{
		// If backtracking through a volatile history we need to reset
		// nodes so that if we revisit them they will increment their
		// _currScene correctly
		
		if(_currNode != newNode)
			_currNode.resetNode();
		
		_currNode = newNode;			
	}
	
	public set scene(seekScene:CGraphScene) : void 
	{
		_currNode.seekToScene(seekScene);			
	}
	
}