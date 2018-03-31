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

import Event = createjs.Event;

import { CUtil } from "../util/CUtil";



export class CEFCommandEvent extends Event 
{
	public static readonly OBJCMD:string 	= "objcmd";		
	
	public objCmd:any;
	
	/**
	* Creates a new CEFCommandEvent instance. 
	*/
	constructor(type:string, _objCmd:any, bubbles:boolean=false, cancelable:boolean=false) 
	{ 
		super(type, bubbles, cancelable);
		
		this.objCmd = _objCmd;			
	} 
	
	public clone():Event 
	{ 
		return new CEFCommandEvent(this.type, this.objCmd, this.bubbles, this.cancelable);
	} 
	
}
