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


namespace TutorEngineOne {

//** Imports


import MovieClip     		  = createjs.MovieClip;


export class CEFNavDemo extends CEFSceneSequence
{	
	//************ Stage Symbols
			
	private _demoPanel:any;
	
	// non-interactive elements
	
	//************ Stage Symbols		

	private _scenesShown:boolean = false;
	
	constructor()
	{
		super();

		if(this.traceMode) CUtil.trace("CEFNavDemo:Constructor");
					
		this._demoPanel = this.instantiateObject("CDemoPanel") as MovieClip;	
		
		this._demoPanel.x 	   = 0;					
		this._demoPanel.y       = 0;					
		this._demoPanel.alpha   = 1.0;			
		this._demoPanel.visible = true;					
		this._demoPanel.name    = "SdemoPanel";
		
		this._demoPanel["demoPath"] = (CEFDoc.gApp as any)["_modulePath"];
		
		// add it to this container
		
		this.addChild(this._demoPanel);				
		
		this._demoPanel.addEventListener(CEFNavEvent.WOZNAVTO, this.gotoScene);
		
		// Add the loaded scene image to the automation matrix
		
		CEFRoot.gTutor.automateScene("SdemoScene", this );		
	}

	private gotoScene(evt:CEFNavEvent) : void
	{			
		var features:Array<string>;
		var featVect:Array<string> = new Array();
		var subFeature:string;
	
		// Convert the features string to a vector
		// Conjunctive features come as a comma delimited string (which as a unit represent a feature vector so matching is done againt the whole string)
		// Disjunctive features come as a colon delimited list
		
		if(evt.wozFeatures != null)
			CEFRoot.gTutor.setTutorFeatures(evt.wozFeatures);
		
		// Show the default components to cleanup the demo instantiation 
		
		if(!this._scenesShown)
		{
			CEFRoot.gTutor.SnavPanel.visible = true;
			CEFRoot.gTutor.StitleBar.visible = true; 
			
			this._scenesShown = true;
		}

		CEFRoot.gTutor.xitions.resetTransitions();
		
		CEFRoot.gTutor.goToScene(new CEFNavEvent(CEFNavEvent.WOZNAVTO, evt.wozNavTarget ));
	}
	
}
}
