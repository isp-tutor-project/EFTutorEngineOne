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

import { CUtil } from "../util/CUtil";

import Event = createjs.Event;



export class CEFNavEvent extends Event
{
	
	public static readonly WOZNAVNEXT:string 	= "WOZNAVNEXT";
	public static readonly WOZNAVBACK:string 	= "WOZNAVBACK";
	public static readonly WOZNAVTO:string 		= "WOZNAVTO";
	public static readonly WOZNAVINC:string 	= "WOZNAVINC";
	public static readonly WOZNAVREPLAY:string 	= "WOZNAVREPLAY";

	public wozNavTarget:string;
	public wozFeatures:string;
			
	constructor(type:string, _target:string = null, _featureSet:string = null, bubbles:boolean = false, cancelable:boolean = false ) 
	{
		super(type, bubbles, cancelable);
		
		this.wozNavTarget = _target;
		this.wozFeatures  = _featureSet;
	}

	/**	
	* Creates and returns a copy of the current instance.	
	* @return A copy of the current instance.		
	*/		
	public clone():Event		
	{
		CUtil.trace("cloning WOZEvent:");
		
		return new CEFNavEvent(this.type, this.wozNavTarget, this.wozFeatures, this.bubbles, this.cancelable );		
	}
	
}
