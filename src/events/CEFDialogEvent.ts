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




export  class CEFDialogEvent extends Event 
{
	public result:string;
	
	public static readonly ENDMODAL:string  = "ENDMODAL";
	public static readonly DLGOK:string     = "DialogOK";
	public static readonly DLGCANCEL:string = "DialogCancel";
	
	/**
	* Creates a new CEFDialogEvent instance. 
	*/
	constructor(Result:string, type:string, bubbles:boolean=false, cancelable:boolean=false) 
	{ 
		super(type, bubbles, cancelable);
	
		this.result = Result;
	} 
	
	public clone():Event 
	{ 
		return new CEFDialogEvent(this.result, this.type, this.bubbles, this.cancelable);
	} 

}
}
