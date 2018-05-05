//*********************************************************************************
//                                                                        
//         CARNEGIE MELLON UNIVERSITY PROPRIETARY INFORMATION             
//  
//  This software is supplied under the terms of a license agreement or   
//  nondisclosure agreement with Carnegie Mellon University and may not   
//  be copied or disclosed except in accordance with the terms of that   
//  agreement.    
//  
//   Copyright(c) 2012 Carnegie Mellon University. All Rights Reserved.   
//                                                                        
//  File:      CWOZHoverMask.as
//                                                                        
//  Purpose:   CWOZHoverMask object implementation
//                                                                        
//  Author(s): Kevin Willows                                                           
//  
//  History: File Creation Apr 21 2008  
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


package cmu.woz
{
	import cmu.woz.events.*;
	import cmu.woz.network.*;
	import cmu.woz.rampsim.*;
	
	import fl.motion.easing.*;
	import fl.transitions.*;
	
	import flash.display.*;
	import flash.display.StageAlign;
	import flash.display.StageScaleMode;
	import flash.events.*;
	import flash.filters.*;
	import flash.geom.*;
	import flash.utils.*;

	
	//@@ Bug - Note that tweens start automatically so the push onto the running array should be coupled with a stop 
	//		   to allow us to control the onFinish proc.
	
	public class CWOZHoverMask extends CWOZObject
	{
		
		//************ Stage Symbols
		
		public var ShoverSpot:CWOZObject;
		
		// Dynamic Scene Elements
		
		
		//************ Stage Symbols

		private var _duration:Number = .15;
		
		
		public function CWOZHoverMask():void
		{
			traceMode = false;
			
			if(traceMode) trace("CWOZHoverMask:Constructor");
			
			ShoverSpot.addEventListener(CWOZMouseEvent.WOZOVER, hideMask);
		}		
		
		private function hideMask(evt:CWOZMouseEvent) : void
		{			
			ShoverSpot.removeEventListener(CWOZMouseEvent.WOZOVER, hideMask);
			ShoverSpot.addEventListener(CWOZMouseEvent.WOZOUT, showMask);
			
			stopTransitions();
			Running.push(new Tween(this, "alpha", Cubic.easeInOut, this.alpha, 0, Number(_duration), true ));			
			startTransition();		
			
			//@@ Action Logging
			var logData:Object = {'action':'ShowRules'};
			
			gLogR.logActionEvent(logData);
			//@@ Action Logging						
			
		}

		private function showMask(evt:CWOZMouseEvent) : void
		{			
			ShoverSpot.removeEventListener(CWOZMouseEvent.WOZOUT, showMask);
			ShoverSpot.addEventListener(CWOZMouseEvent.WOZOVER, hideMask);
			
			stopTransitions();
			Running.push(new Tween(this, "alpha", Cubic.easeInOut, this.alpha, 1.0, Number(_duration), true ));			
			startTransition();
			
			//@@ Action Logging
			var logData:Object = {'action':'HideRules'};
			
			gLogR.logActionEvent(logData);			
			//@@ Action Logging						
			
		}
				
		/*
		* 
		*/
		override public function loadXML(xmlSrc:XML) : void
		{			
			super.loadXML(xmlSrc);				
		}
		
	}
}