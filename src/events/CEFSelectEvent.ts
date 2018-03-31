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




export class CEFSelectEvent extends Event
{
	
	public static readonly WOZTABSELECT:string 	= "WOZTABSELECT";
	public static readonly WOZIMGSELECT:string 	= "WOZIMGSELECT";

	public wozSelection:string;
			
	constructor(target:string, type:string, bubbles:boolean = false, cancelable:boolean = false)
	{
		super(type, bubbles, cancelable);
		
		this.wozSelection = target;
	}

	/**	
	* Creates and returns a copy of the current instance.	
	* @return A copy of the current instance.		
	*/		
	public clone():Event		
	{
		CUtil.trace("cloning CEFSelectEvent:");
		
		return new CEFSelectEvent(this.wozSelection, this.type, this.bubbles, this.cancelable );		
	}
	
}
}
