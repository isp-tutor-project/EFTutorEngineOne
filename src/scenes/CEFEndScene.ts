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
//  File:      CWOZEndScene.as
//                                                                        
//  Purpose:   CWOZEndScene object implementation
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


package cmu.woz.scenes
{
	import cmu.woz.*;
	import cmu.woz.network.*;
	import cmu.woz.controls.*;
	import cmu.woz.events.*;	
	
	import flash.display.*;
	import flash.events.*;
	import flash.text.*;
	import flash.net.*;	

	public class CWOZEndScene extends CWOZSceneSequence
	{
		//************ Stage Symbols
		
		public var SpostTest:MovieClip;
		public var SdoneButton:CWOZLabelButton;
		public var SuploadButton:CWOZLabelButton;
		
		// non-interactive elements
		
		public var Send:TextField;		
		
		//************ Stage Symbols		
		
		public function CWOZEndScene():void
		{
			trace("CWOZEndScene:Constructor");
			
//			SdoneButton.addEventListener(CWOZMouseEvent.WOZCLICK, onDoneClick);
//			SdoneButton.setLabel("Replay");
//
//			SuploadButton.addEventListener(CWOZMouseEvent.WOZCLICK, onUploadClick);
//			SuploadButton.setLabel("Upload");
			
			//SpostTest.addEventListener(CWOZMouseEvent.WOZCLICK, onPostTest);
			
			// No pacing here
			fComplete = true;				
		}

		
		public function onDoneClick(evt:CWOZEvent) : void
		{			
			// debug test of stream replay
			//
			dispatchEvent(new CWOZNavEvent(CWOZNavEvent.WOZNAVREPLAY));			
			
			// Goto the end Cloak panel
			//
			//dispatchEvent(new CWOZNavEvent(CWOZNavEvent.WOZNAVNEXT));			
		}										
				
	
		public function onPostTest(evt:CWOZEvent) : void
		{			
			// load the post test URL on click
			//
			var postTest:URLRequest = new URLRequest("http://tedserver.psy.cmu.edu/amherst/ted_post.html");
			navigateToURL(postTest);
		}										
		
		
		public function onUploadClick(evt:CWOZEvent) : void
		{			
			// debug test of stream replay
			//
			dispatchEvent(new Event("pushlog"));						
		}										
				
	
		// Walk the WOZ Objects to capture their default state
		//
		override public function captureDefState(TutScene:Object ) : void 
		{
			super.captureDefState(TutScene );
		}
		
		
		// Walk the WOZ Objects to restore their default state
		//
		override public function restoreDefState(TutScene:Object ) : void 
		{
			super.restoreDefState(TutScene );
		}
					
	}

}