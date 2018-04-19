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

import { CEFSceneSequence } 	from "../../core/CEFSceneSequence";
import { CEFEvent } 			from "../../events/CEFEvent";
import { CEFNavEvent } 			from "../../events/CEFNavEvent";
import { CUtil } 				from "../../util/CUtil";
import { CEFLabelButton } 		from "../../controls/CEFLabelButton";

import MovieClip     	  = createjs.MovieClip;
import TextField    	  = createjs.Text;


export class CEFEndScene extends CEFSceneSequence
{
	//************ Stage Symbols
	
	public SpostTest:MovieClip;
	public SdoneButton:CEFLabelButton;
	public SuploadButton:CEFLabelButton;
	
	// non-interactive elements
	
	public Send:TextField;		
	
	//************ Stage Symbols		
	
	public CEFEndScene():void
	{
		CUtil.trace("CEFEndScene:Constructor");
		
//			SdoneButton.addEventListener(CEFMouseEvent.WOZCLICK, onDoneClick);
//			SdoneButton.setLabel("Replay");
//
//			SuploadButton.addEventListener(CEFMouseEvent.WOZCLICK, onUploadClick);
//			SuploadButton.setLabel("Upload");
		
		//SpostTest.addEventListener(CEFMouseEvent.WOZCLICK, onPostTest);
		
		// No pacing here
		this.fComplete = true;				
	}

	
	public onDoneClick(evt:CEFEvent) : void
	{			
		// debug test of stream replay
		//
		this.dispatchEvent(new CEFNavEvent(CEFNavEvent.WOZNAVREPLAY));			
		
		// Goto the end Cloak panel
		//
		//dispatchEvent(new CEFNavEvent(CEFNavEvent.WOZNAVNEXT));			
	}										
			

	public onPostTest(evt:CEFEvent) : void
	{			
		// load the post test URL on click
		//
		// let postTest:URLRequest = new URLRequest("http://tedserver.psy.cmu.edu/amherst/ted_post.html");
		// this.navigateToURL(postTest);
	}										
	
	
	public onUploadClick(evt:CEFEvent) : void
	{			
		// debug test of stream replay
		//
		dispatchEvent(new Event("pushlog"));						
	}										
			

	// Walk the WOZ Objects to capture their default state
	//
	public captureDefState(TutScene:Object ) : void 
	{
		super.captureDefState(TutScene );
	}
	
	
	// Walk the WOZ Objects to restore their default state
	//
	public restoreDefState(TutScene:Object ) : void 
	{
		super.restoreDefState(TutScene );
	}
				
}
