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

import { CTutorNode } 	from "./CTutorNode";
import { CTutorGraph } 	from "./CTutorGraph";
import { CTutorScene } 	from "./CTutorScene";

import { TRoot } 		from "../thermite/TRoot";


import { CONST }        from "../util/CONST";
import { CUtil } 		from "../util/CUtil";


export class CTutorModule extends CTutorNode
{
	private _scenes:Array<any> = new Array;	
	private _ndx:number        = -1;
    private _reuse:boolean;

    private restored:boolean   = false;
	
	
	constructor(_tutorDoc:IEFTutorDoc)
	{
		super(_tutorDoc);
	}			

	
	// Note: moduleFactory can either be a CNode JSON specification or a CGraphModuleGroup JSON specification 
	//      
	public static factory(_tutorDoc:any, parent:CTutorGraph, id:string, moduleFactory:any, factory:any) : CTutorModule	
	{
		var moduleFactoryData:any = factory.CModules[moduleFactory.link];
		
		var node:any = new CTutorModule(_tutorDoc);			
		
		// polymorphically Initialize the base type - add the edges
		// Note: ModuleGroup members dont have associated node edge data (nodeFactoryData) 
		
		if(moduleFactory.edges)
			node.nodeFactory(parent, id, moduleFactory);
		
		node._reuse = moduleFactoryData.reuse;
		
		// add scene instances to the module
		
		var sceneList:any = moduleFactoryData.scenes;			
		
		for (var scene of sceneList)
		{
			node._scenes.push(new CTutorScene(_tutorDoc, scene, parent));	
		}
		
		return node;
	}
	
	
	public captureGraph(obj:any) : Object
	{
		obj['index'] = this._ndx.toString();			
		
		return obj;
	}
	
	public restoreGraph(obj:any) : any
	{			
        this._ndx = Number(obj['index']);
        this.restored = true;
		
		return this._scenes[this._ndx];
	}
	
	public nextScene() : CTutorScene
	{
		var nextScene:CTutorScene = null;
		var features:string;
		
		// If new scene has features, check that it is being used in the current tutor feature set
		// Note: You must ensure that there is a match for the last scene in the sequence   			
		
		//@@TODO note that if nothing matches in a module ensure it cannot become an infinite loop
		
		while(this._ndx < this._scenes.length)
		{
            // If we just restored to this state we start there
            // Note we test features etc in case the start point is no longer valid
            // 
            if(this.restored) {
                this.restored  = false;
            }
            // Otherwise increment the scene index and test
            // 
            else {
                this._ndx++;
            }

            if(this._ndx >= this._scenes.length) nextScene = null;
                                            else nextScene = this._scenes[this._ndx];
            
            if(nextScene != null)
            {
                features = nextScene.features;
                
                // If this scene is not in the feature set for the tutor then check the next one.
                
                if(features != "")
                {
                    if(this.tutorDoc.testFeatureSet(features))
                    {
                        // Check stocastic Feature if present
                        
                        if(nextScene.hasPFeature)
                        {
                            if(nextScene.testPFeature())
                                                    break;
                        }											
                        else
                            break;
                    }
                    CUtil.trace("Graph Feature: " + features + " :failed.");
                }
                
                // Check Stocastic Feature if present
                
                else if(nextScene.hasPFeature)
                {
                    if(nextScene.testPFeature())
                                            break;
                }											
                else
                    break;
            }
            else break;
		}
		
		// If we have exhausete the node check if it can be reused - if so reinitialize it for 
		// the next time it is called.
		
		if(this._ndx >= this._scenes.length)
		{
			if(this._reuse)
			{
				this.resetNode();
			}
		}			
		
		return nextScene;			
	}
	
	public applyNode() : boolean
	{
		dispatchEvent(new Event("todo"));  //return this._scenes[this._ndx];
		
		return false;			
	}
	
	
	public seekToScene(seekScene:CTutorScene) : CTutorScene
	{
		var scene:CTutorScene = null;
		var ndx:number = 0;
	
		// Move to the correct scene within the module
		
		for (scene of this._scenes)
		{
			if(seekScene == scene)
			{
				this._ndx = ndx;
				break;
			}			
			ndx++;
		}
		
		return scene;
	}
	
	public resetNode() : void
	{		
		this._ndx = -1;
	}
	
}
