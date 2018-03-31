import { CEFNavigator } from "./CEFNavigator";
import { CEFRoot } from "./CEFRoot";

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




/**
* ...
*/
export class CEFSceneNavigator extends CEFNavigator
{
	
	//*************** Navigator "ROOT INSTANCE" CONSTANTS - 
	// Place these within a subclass to set the root of a navigation sequence
	// 
	private StscenePrev:number;
	private StsceneCurr:number;
	
	private StsceneTitle:Array<string>    = new Array();
	private StscenePage:Array<string>     = new Array();
	private StsceneSeq:Array<string>      = new Array();
	private StsceneClass:Array<string>    = new Array();
	private StscenePersist:Array<string>  = new Array();
	private StsceneFeatures:Array<string> = new Array();
		
	//*************** Navigator "ROOT INSTANCE" CONSTANTS - 
	
	/**
	* Creates a new CEFSceneNavigator instance. 
	*/
	constructor() 
	{
		super();
	}
	
	/**
	 * Add a scene to a navigation sub-sequence - These sequences are driven by scene events not NEXT/PREV button clicks
	 * @param	sceneTitle
	 * @param	sceneName
	 */
	public addScene(SceneTitle:string, ScenePage:string, SceneName:string, SceneClass:string, ScenePersist:boolean, SceneFeatures:string = "null" ) : void
	{
		this.sceneCnt++;
		
		this.StsceneTitle.push(SceneTitle);
		this.StscenePage.push(ScenePage);
		this.StsceneSeq.push(SceneName);			
		this.StsceneClass.push(SceneClass);			
		this.StscenePersist.push(ScenePersist.toString());
		
		if(SceneFeatures != "null")
			this.StsceneFeatures.push(SceneFeatures);	
		else
			this.StsceneFeatures.push(null);	
	}	
	
	
//****** Overridable Behaviors
	
//***************** Navigation Behaviors *******************************	

	//*************** Navigator getter setters - 
	// Override these within a subclass to set the root of a navigation sequence
	protected get scenePrev() :number 
	{
		return this.StscenePrev;
	}
	protected set scenePrev(scenePrevINT:number) 
	{
		this.StscenePrev = scenePrevINT;
	}
	
	protected get sceneCurr() :number 
	{
		return this.StsceneCurr;
	}
	protected set sceneCurr(sceneCurrINT:number) 
	{
		this.StsceneCurr = sceneCurrINT;
	}
	protected get sceneCurrINC() :number 
	{
		let feature:string;
		let match:boolean = false;
		
		this.StsceneCurr++;
		
		// If new scene has features, check that it is being used in the current tutor feature set
		// Note: You must ensure that there is a match for the last scene in the sequence   
		
		while(this.StsceneFeatures[this.StsceneCurr] != null)
		{
			// If this scene is not in the feature set for the tutor then check the next one.
			
			if(!CEFRoot.gTutor.testFeatureSet(this.StsceneFeatures[this.StsceneCurr])) this.StsceneCurr++;
																					else break;
		}
		
		return this.StsceneCurr;
	}
	
	protected get sceneCurrDEC() :number 
	{
		let feature:string;
		let match:boolean = false;
		
		this.StsceneCurr--;
		
		// If new scene has features, check that it is being used in the current tutor feature set
		// Note: You must ensure that there is a match for the last scene in the sequence   
		
		while(this.StsceneFeatures[this.StsceneCurr] != null)
		{
			// If this scene is not in the feature set for the tutor then check the next one.
			
			if(!CEFRoot.gTutor.testFeatureSet(this.StsceneFeatures[this.StsceneCurr])) this.StsceneCurr++;
																else break;
		}
		
		return this.StsceneCurr;
	}
	
	
	protected get sceneTitle() :Array<string>							// initialize the Tutor specific scene titles
	{
		return this.StsceneTitle;
	}
	protected set sceneTitle(sceneTitleARRAY:Array<string>) 			// initialize the Tutor specific scene titles
	{
		this.StsceneTitle = sceneTitleARRAY;
	}
	
	
	protected get sceneSeq() :Array<string>								// initialize the Tutor specific scene sequence
	{
		return this.StsceneSeq;
	}		
	protected set sceneSeq(sceneSeqARRAY:Array<string>) 				// initialize the Tutor specific scene sequence
	{
		this.StsceneSeq = sceneSeqARRAY;
	}		
	
	
	protected get scenePage() :Array<string>							// initialize the Tutor specific scene sequence
	{
		return this.StscenePage;
	}		
	protected set scenePage(scenePageARRAY:Array<string>) 				// initialize the Tutor specific scene sequence
	{
		this.StscenePage = scenePageARRAY;
	}		

	
	protected get sceneName() :Array<string>							// initialize the Tutor specific scene sequence
	{
		return this.StsceneSeq;
	}		
	protected set sceneName(scenePageARRAY:Array<string>) 				// initialize the Tutor specific scene sequence
	{
		this.StsceneSeq = scenePageARRAY;
	}		
	
	
	protected get sceneClass() :Array<string>							// initialize the Tutor specific scene sequence
	{
		return this.StsceneClass;
	}		
	protected set sceneClass(scenePageARRAY:Array<string>) 				// initialize the Tutor specific scene sequence
	{
		this.StsceneClass = scenePageARRAY;
	}		
	
	
	protected get scenePersist() :Array<string>							// initialize the Tutor specific scene sequence
	{
		return this.StscenePersist;
	}	
	protected set scenePersist(scenePageARRAY:Array<string>) 			// initialize the Tutor specific scene sequence
	{
		this.StscenePersist = scenePageARRAY;
	}		
	
	
	//*************** Navigator getter setters - 
	
//***************** Navigation Behaviors *******************************		

//****** Overridable Behaviors		
	
}
