﻿//*********************************************************************************//                                                                        //         CARNEGIE MELLON UNIVERSITY PROPRIETARY INFORMATION             //  //  This software is supplied under the terms of a license agreement or   //  nondisclosure agreement with Carnegie Mellon University and may not   //  be copied or disclosed except in accordance with the terms of that   //  agreement.    //  //   Copyright(c) 2008 Carnegie Mellon University. All Rights Reserved.   //                                                                        //  File:      CDialogProgress.as//                                                                        //  Purpose:   CDialogProgress class implementation//                                                                        //  Author(s): Kevin Willows                                                           //  // History: File Creation Apr 17 2008  //                                                                        // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN// THE SOFTWARE.////*********************************************************************************package cmu.woz.dialogs{	import cmu.woz.*;	import cmu.woz.controls.*;	import cmu.woz.network.*;	import cmu.woz.events.*;		import flash.display.*;	import flash.utils.*;	import flash.events.*;	import flash.text.*;	import fl.controls.*;	    import flash.net.*;			public class CDialogProgress extends CWOZDialogBox	{								//************ Stage Symbols				public var Sbody:TextField;		public var SprogressBar:ProgressBar;		public var Sfooter:TextField;		public var Scancel:CWOZLabelButton;				//************ Stage Symbols		public var pgMax:Number = 4;		public var pgVal:Number = 0;				//////////////////////////////////////////////////////////////		// Function: CDialogBox - Selector object		//		//  Description: 		//			Buttons for selecting ramp properties		//		// Parameters: none		//		// returns: NULL		//		public function CDialogProgress() : void 		{											setTitle("");			setBody("");					setFooter("");					setButtonText("");					            SprogressBar.minimum =  0;            SprogressBar.maximum = 10;            SprogressBar.mode = ProgressBarMode.MANUAL;											setProgress(pgVal++, pgMax);		}							/**		 * 		 * @param	txt		 */		public function setBody(txt:String ) : void 		{											Sbody.text = txt;		}												/**		 * 		 * @param	txt		 */			public function setFooter(txt:String ) : void 		{											Sfooter.text = txt;		}												/**		 * 		 * @param	txt		 */			public function setButtonText(txt:String ) : void 		{											Scancel.setLabel(txt);		}												/**		 * 		 * @param	txt		 */			public function showButton(fShow:Boolean ) : void 		{											Scancel.visible = fShow;		}												/**		 * 		 * @param	amtDone		 * @param	maxV		 */			public function setProgress(amtDone:Number, maxV:Number = 10 ) : void 		{														SprogressBar.setProgress(amtDone, maxV);		}					//****** Overridable Behaviors		/**		 * 		 * @param	evt		 */		override public function endModal(Result:String) : void 		{								 	trace("endModal: CDialogInitServer - ", Result);								super.endModal(Result);							}						/**		 * 		 * @param	evt		 */		public function cancelModal(evt:MouseEvent) : void 		{								 	trace("cancelModal: CDialogInitServer");					endModal(CWOZDialogEvent.DLGCANCEL);		}							/**		 * 		 */		public function failModal() : void 		{		 	trace("failModal: CDialogInitServer");						setProgress(pgMax, pgMax);						endModal(CWOZDialogEvent.DLGCANCEL);		}		//****** Overridable Behaviors			}	}