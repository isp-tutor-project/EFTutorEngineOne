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



export class CEFKeyboardEvent extends Event 
{
	public static readonly KEY_PRESS:string = "keypress";
	public static readonly KEY_DOWN:string 	= "keydown";
	public static readonly KEY_UP:string 	= "keyup";
		
	/**
	* Creates a new CEFTimerEvent instance. 
	*/
	constructor(type:string, bubbles:boolean=false, cancelable:boolean=false) 
	{ 
		super(type, bubbles, cancelable);
		
	} 
	
}
}
	
