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

import Event = createjs.Event;




/**
* To manage scripting packets originating from ActionTracks.
* 
* */
export class CEFScriptEvent extends Event 
{		
	public static readonly SCRIPT:string = "script";

	public script:any;	

	constructor(type:string, _script:any, bubbles:boolean=false, cancelable:boolean=false) 
	{ 
		super(type, bubbles, cancelable);
		
		this.script = _script;			
	} 
	
	public clone():Event 
	{ 
		return new CEFScriptEvent(this.type, this.script, this.bubbles, this.cancelable);
	} 
	
}
}
