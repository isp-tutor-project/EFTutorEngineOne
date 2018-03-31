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



import MovieClip     	  = createjs.MovieClip;
import Point     		  = createjs.Point;
import Tween     		  = createjs.Tween;


export class CEFSceneN extends CEFSceneSequence
{
	//************ Stage Symbols
	
	public SreplaySession:CEFButton;
	
	// non-interactive elements
	
	public SbackGround:MovieClip;		

	//************ Stage Symbols
	
	public CEFSceneN():void
	{
		CUtil.trace("CEFSceneN:Constructor");
		
		this.SreplaySession.addEventListener(CEFMouseEvent.WOZCLICK, this.doReplay);
	}

	public doReplay(evt:CEFEvent) : void
	{			
		// relay the entire tutor interaction
		//
		CEFRoot.gTutor.replayLiveStream();			
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
}
