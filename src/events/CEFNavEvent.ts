//*********************************************************************************
//                                                                        
//         CARNEGIE MELLON UNIVERSITY PROPRIETARY INFORMATION             
//  
//  This software is supplied under the terms of a license agreement or   
//  nondisclosure agreement with Carnegie Mellon University and may not   
//  be copied or disclosed except in accordance with the terms of that   
//  agreement.    
//  
//   Copyright(c) 2008 Carnegie Mellon University. All Rights Reserved.   
//                                                                        
//  File:      CEFNavEvent.as
//                                                                        
//  Purpose:   CEFNavEvent object implementation
//                                                                        
//  Author(s): Kevin Willows                                                           
//  
//  History: File Creation Apr 28 2008  
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
		
		return new CEFNavEvent(type, wozNavTarget, wozFeatures, bubbles, cancelable );		
	}
	
	/**		
	* Returns a String containing all the properties of the current		
	* instance.		
	* @return A string representation of the current instance.		
	*/		
	public toString():string		
	{
		return formatToString("CEFNavEvent", "type", "wozNavTarget", "wozFeatures", "bubbles", "cancelable");		
	}		
}
