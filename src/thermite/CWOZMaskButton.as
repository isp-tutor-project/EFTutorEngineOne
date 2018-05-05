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
//  File:      CWOZMaskButton.as
//                                                                        
//  Purpose:   CWOZMaskButton Base class implementation
//                                                                        
//  Author(s): Kevin Willows                                                           
//  
// History: File Creation 10/19/2008 8:50 AM
//                                                                        
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//
//*********************************************************************************


package cmu.woz 
{
	//** Imports
	import cmu.woz.network.*;
	import cmu.woz.events.*;
	
	import flash.geom.*;
	
	/**
	* ...
	*/
	public class CWOZMaskButton extends CWOZButton
	{
		//************ Stage Symbols
		
		public var Smask:CWOZMouseMask;
		
		//************ Stage Symbols
		
		/**
		* Creates a new CWOZMaskButton instance. 
		*/
		public function CWOZMaskButton() 
		{
			Smask.x = -x;
			Smask.y = -y;
			Smask.alpha = 0;
		}
		
	}
	
}