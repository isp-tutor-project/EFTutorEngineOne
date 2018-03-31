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



export class CEFActionEvent extends Event
{		
	public static readonly CHKCMD:string 	= "chkcmd";		
	public static readonly STCCMD:string 	= "stccmd";		
	public static readonly INDCMD:string 	= "indcmd";
	public static readonly RMPCMD:string 	= "rmpcmd";
	public static readonly PMTCMD:string 	= "pmtcmd";
	public static readonly NAVCMD:string 	= "navcmd";
	public static readonly EFFECT:string 	= "effect";

	public prop1:string;	
	public prop2:string;
	public prop3:string;
	public prop4:string;
	public prop5:string;

	constructor(type:string, Prop1:string, Prop2:string = null, Prop3:string = null, Prop4:string = null, Prop5:string = null, bubbles:boolean=false, cancelable:boolean=false) 
	{ 
		super(type, bubbles, cancelable);
		
		this.prop1 = Prop1;			
		this.prop2 = Prop2;
		this.prop3 = Prop3;
		this.prop4 = Prop4;
		this.prop5 = Prop5;
	} 
	
	public clone():Event 
	{ 
		return new CEFActionEvent(this.type, this.prop1, this.prop2, this.prop3, this.prop4, this.prop5, this.bubbles, this.cancelable);
	} 
	
}
