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
//  File:      CDialogInitServer.as
//                                                                        
//  Purpose:   CDialogInitServer implementation
//                                                                        
//  Author(s): Kevin Willows                                                           
//  
//  History: File Creation Apr 15 2008  
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

package cmu.woz.dialogs
{
	import cmu.woz.*;
	import cmu.woz.controls.*;
	import cmu.woz.network.*;
	import cmu.woz.events.*;
	
	import flash.display.*;
	import flash.utils.*;
	import flash.events.*;
	import flash.text.*;

	import fl.controls.*;	
    import flash.net.*;	
	
	public class CDialogInitServer extends CDialogProgress
	{		
		
		var dDNS:CWOZDynamicDNS = new CWOZDynamicDNS;		// CWOZDynamicDNS encapsulates a URLLoader
				
		/**
		 * 
		 */
		public function CDialogInitServer() : void 
		{								
			setTitle("Notice:");
			setBody("\nContacting Server -- Please Wait...");		
			setFooter("\ndDNS lookup in progress");					
			setButtonText("Cancel");
			
			pgMax = 4;
			pgVal = 0;			
			
            SprogressBar.minimum =  0;
            SprogressBar.maximum = 10;
            SprogressBar.mode = ProgressBarMode.MANUAL;		
						
			setProgress(pgVal++, pgMax);
		}					
		
		override public function Destructor() : void
		{
			Scancel.removeEventListener(CWOZMouseEvent.WOZCLICK, initLogger);									
			Scancel.removeEventListener(MouseEvent.CLICK, cancelModal);			
			
			super.Destructor();
		}
		
		
		/**
		 * Configure system to use a specific logging server IP as defined in the loader
		 * @@ Mod May 21 2012
		 *  
		 * @param serverID
		 * @return 
		 * 
		 */		
		public function useOverride(serverID:String)
		{
			dDNS.useOverride(serverID);
		}
		
		
		/**
		 * Configure DDNS to use a specific logging server as defined in the loader
		 * @@ Mod Apr 06 2012
		 *  
		 * @param serverID
		 * @return 
		 * 
		 */		
		public function useAffinity(serverID:String)
		{
			dDNS.useAffinity(serverID);
		}
		
		
		/**
		 * 
		 */
		public function initLogger(evt:CWOZMouseEvent) : void 
		{			
			// Create a new Socket and resend all the data
			// resets the Ack counter to force resend of all data
			//
			gLogR.recycleSocket();
			
			setTitle("Notice:");
			setBody("\nContacting Server -- Please Wait...");					
			setFooter("dDNS Lookup in progress ----");			
			setProgress(pgVal++, pgMax);

			// dDNS encapsulates a URLLoader object - not an XMLSocket
			//
			dDNS.connectProgress(this);			
			dDNS.configureDDNSListeners(true);						
		}					
		
		/**
		 * 
		 */
		public function hideDialog(evt:MouseEvent) : void 
		{					
			visible = false;
		}					

		
		/**
		 * 
		 */
		public function doneBanner() : void 
		{					
			setTitle("Data Logging Complete:");
			setBody("");		
			setFooter("OK to shutdown");						
			showButton(false);
		}					
		
		
		/**
		 * Output any remaining data.
		 */		
		public function flushLog() : void 
		{															
 			setTitle("Finalizing Log:");
			setBody("\nSending Data -- Please Wait...");		
			setFooter("upload in progress");			

            SprogressBar.minimum = 0;
            SprogressBar.maximum = gLogR.logEvtIndex;
            SprogressBar.mode    = ProgressBarMode.MANUAL;		
									
			setProgress(gLogR.logAckIndex+1, gLogR.logEvtIndex);
			
			setTopMost();			
			visible = true;			
			CWOZDoc.gApp.Stutor.cCursor.setTopMost();
			
			// Flush the log as required
			//
			if(gLogR.logAckIndex != gLogR.logEvtIndex)
										gLogR.flushLog();						  
			else
			  gLogR.dispatchEvent(new Event(Event.COMPLETE));			  
		}
		
		
		/**
		 * Recycle the Socket to connect and upload the data to a potentially different server
		 */		
		public function recycleServer() : void 
		{																
			setTitle("Server connection lost:");
			setBody("\nData transmission interrupted.");		
			setFooter("Click OK to reconnect?");	
			setButtonText("OK");			
						
            SprogressBar.minimum = 0;
            SprogressBar.maximum = gLogR.logEvtIndex;
            SprogressBar.mode    = ProgressBarMode.MANUAL;		
									
			setProgress(0, gLogR.logEvtIndex);

			Scancel.addEventListener(CWOZMouseEvent.WOZCLICK, initLogger);									

			// Wait for user OK to start connection attempt
			//
			setTopMost();			
			visible = true;						
			CWOZDoc.gApp.Stutor.cCursor.setTopMost();
		}
		
		
//****** Overridable Behaviors

		/**
		 * 
		 */
		override public function doModal(accounts:XMLList = null, Alpha:Number = 1, fAdd:Boolean = true) : void 
		{					
			//super.doModal(accounts, Alpha, fAdd);
			
			Scancel.addEventListener(MouseEvent.CLICK, cancelModal);
			
			visible = true;			
			
			// Connect to the logger - go right into connection
			//
			initLogger(null);
		}					
		
		/**
		 * 
		 * @param	evt
		 */
		override public function endModal(Result:String) : void 
		{						
		 	trace("endModal: CDialogInitServer - ", Result);
			
			Scancel.removeEventListener(MouseEvent.CLICK, cancelModal);			

			// Flex integration - do not use super
			
			this.visible  = false;					
			
			dispatchEvent(new CWOZDialogEvent(Result, ENDMODAL ));				
		}		
		
//****** Overridable Behaviors
		
	}
}