//*********************************************************************************
//                                                                        
//         CARNEGIE MELLON UNIVERSITY PROPRIETARY INFORMATION             
//  
//  This software is supplied under the terms of a license agreement or   
//  nondisclosure agreement with Carnegie Mellon University and may not   
//  be copied or disclosed except in accordance with the terms of that   
//  agreement.    
//  
//   Copyright(c) 2011 Carnegie Mellon University. All Rights Reserved.   
//                                                                        
//  File:      CAnnulus.as
//                                                                        
//  Purpose:   CAnnulus Base class implementation
//                                                                        
//  Author(s): Kevin Willows                                                           
//  
// History: File Creation 5/08/2011
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


package util
{
	//** imports
	
	import flash.display.*;
	
	public class LFXAnnulus extends Object
	{
		public var id:String;
		
		public var centerX:Number;
		public var centerY:Number;
		public var radiusIn:Number;
		public var radiusOut:Number;
		
		public var outlineClrNml:Number;
		public var outlineClrHlt:Number;
		public var outlineAlphaNml:Number;
		public var outlineAlphaHlt:Number;
		
		public var fillClrNml:Number;
		public var fillClrHlt:Number;
		public var fillAlphaNml:Number;
		public var fillAlphaHlt:Number;
		
		public var segHiLighted:Vector.<Boolean> = new Vector.<Boolean>;	
		
		private var _gu:LFXGraphicsUtil = new LFXGraphicsUtil;
		
		private var _numSegments:int;
		private var _arcLength:Number;
		
		private var _arcStart:Number = 0.75;
		private var _arcEnd:Number;
		
		static private var _arcGap:Number = .004;
		
		
		public function LFXAnnulus()
		{
			super();
		}
		
		public function set numSegments(_numSeg:int) : void
		{
			var i1:int;
			
			_numSegments = _numSeg;
			_arcLength   = 1/_numSegments;
			
			for(i1 = 0 ; i1 < _numSegments ; i1++)
			{
				segHiLighted.push(false);
			}			
		}
		
		public function highLightSegment(ndx:int) : void
		{
			segHiLighted[ndx] = true;
		}
		
		public function set arcLength(arcLen:Number) : void
		{
			_arcEnd = _arcStart + arcLen;  
		}
		
		public function drawRing(g:Graphics) : void 
		{
			var i1:int;
			
			var arcStart:Number = _arcStart;
			
			if(_arcEnd)  _arcLength = _arcEnd - _arcStart;
			
			if(_arcLength > 0)
			{
				for(i1 = 0 ; i1 < _numSegments ; i1++)
				{
					g.beginFill(segHiLighted[i1]? fillClrNml:fillClrHlt, 
								segHiLighted[i1]? fillAlphaNml:fillAlphaHlt);
					
					g.lineStyle(0,
								segHiLighted[i1]? outlineClrNml:outlineClrHlt, 
								segHiLighted[i1]? outlineAlphaNml:outlineAlphaHlt, 
								false, 
								LineScaleMode.NONE, 
								CapsStyle.SQUARE);
					
					_gu.drawAnnulusSegment(g, 
										  centerX, 
										  centerY, 
										  radiusIn, 
										  radiusOut, 
										  arcStart, 
										  _arcLength - _arcGap);
									
					g.endFill();
					
					// calc the start and end points of the arc leaving a gap
					
					arcStart = arcStart + _arcLength;
				}				
			}
		}
	}
}