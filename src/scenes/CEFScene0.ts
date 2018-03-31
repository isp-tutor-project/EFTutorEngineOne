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

import { CEFSceneSequence } from "../core/CEFSceneSequence";
import { CUtil } 			from "../util/CUtil";

import MovieClip     		  = createjs.MovieClip;




export class CEFScene0 extends CEFSceneSequence
{
	//************ Stage Symbols
	
	// non-interactive elements
	
	public SbackGround:MovieClip;
	
	//************ Stage Symbols
	
	constructor() 
	{
		super();

		CUtil.trace("CEFScene0:Constructor");
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

